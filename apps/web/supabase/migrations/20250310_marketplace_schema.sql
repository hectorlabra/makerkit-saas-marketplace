/*
 * -------------------------------------------------------
 * Marketplace and MercadoPago Integration Schema
 * This schema extends the Supabase SaaS Starter Kit with
 * tables for marketplace functionality and MercadoPago integration.
 * -------------------------------------------------------
 */

/*
 * -------------------------------------------------------
 * Section: Products
 * Tables for managing products in the marketplace
 * -------------------------------------------------------
 */

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    rating DECIMAL(3, 2),
    review_count INTEGER DEFAULT 0,
    seller_id UUID REFERENCES public.accounts(id),
    category_id UUID,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.products IS 'Products available in the marketplace';

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies for products
-- Anyone can read active products
CREATE POLICY products_read ON public.products
    FOR SELECT
    USING (status = 'active');

-- Sellers can CRUD their own products
CREATE POLICY products_crud_own ON public.products
    FOR ALL
    TO authenticated
    USING (seller_id = auth.uid())
    WITH CHECK (seller_id = auth.uid());

/*
 * -------------------------------------------------------
 * Section: Categories
 * Tables for organizing products into categories
 * -------------------------------------------------------
 */

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.categories IS 'Product categories for the marketplace';

-- Enable RLS on categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read categories
CREATE POLICY categories_read ON public.categories
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- Only admins can modify categories (implement admin check later)
CREATE POLICY categories_admin ON public.categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add foreign key to products table
ALTER TABLE public.products
    ADD CONSTRAINT fk_product_category
    FOREIGN KEY (category_id)
    REFERENCES public.categories(id);

/*
 * -------------------------------------------------------
 * Section: Orders
 * Tables for managing customer orders
 * -------------------------------------------------------
 */

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    customer_id UUID REFERENCES public.accounts(id) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address JSONB,
    billing_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.orders IS 'Customer orders in the marketplace';

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.order_items IS 'Items within customer orders';

-- Enable RLS on orders tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Customers can read their own orders
CREATE POLICY orders_read_own ON public.orders
    FOR SELECT
    TO authenticated
    USING (customer_id = auth.uid());

-- Sellers can read orders containing their products
CREATE POLICY orders_read_seller ON public.orders
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT o.id FROM public.orders o
            JOIN public.order_items oi ON o.id = oi.order_id
            JOIN public.products p ON oi.product_id = p.id
            WHERE p.seller_id = auth.uid()
        )
    );

-- Order items policies
CREATE POLICY order_items_read ON public.order_items
    FOR SELECT
    TO authenticated
    USING (
        order_id IN (
            SELECT id FROM public.orders
            WHERE customer_id = auth.uid()
        ) OR
        product_id IN (
            SELECT id FROM public.products
            WHERE seller_id = auth.uid()
        )
    );

/*
 * -------------------------------------------------------
 * Section: Payments
 * Tables for tracking payments via MercadoPago
 * -------------------------------------------------------
 */

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) NOT NULL,
    payment_provider VARCHAR(50) NOT NULL DEFAULT 'mercadopago',
    payment_id VARCHAR(255),
    preference_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
    payment_method VARCHAR(50),
    payment_type VARCHAR(50),
    installments INTEGER,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.payments IS 'Payment records for orders processed via payment providers';

-- Payment events table for tracking payment lifecycle
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    payment_id UUID REFERENCES public.payments(id) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    raw_data JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.payment_events IS 'Events in the payment lifecycle from payment providers';

-- Enable RLS on payment tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Payment policies
CREATE POLICY payments_read_own ON public.payments
    FOR SELECT
    TO authenticated
    USING (
        order_id IN (
            SELECT id FROM public.orders
            WHERE customer_id = auth.uid()
        )
    );

CREATE POLICY payment_events_read_own ON public.payment_events
    FOR SELECT
    TO authenticated
    USING (
        payment_id IN (
            SELECT p.id FROM public.payments p
            JOIN public.orders o ON p.order_id = o.id
            WHERE o.customer_id = auth.uid()
        )
    );

/*
 * -------------------------------------------------------
 * Section: Functions and Triggers
 * Helper functions and triggers for the marketplace
 * -------------------------------------------------------
 */

-- Function to update product stock when an order is placed
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Decrease product stock
    UPDATE public.products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product stock on order item creation
CREATE TRIGGER update_product_stock_trigger
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_product_stock();

-- Function to update order status when payment status changes
CREATE OR REPLACE FUNCTION public.update_order_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update order status based on payment status
    IF NEW.status = 'approved' THEN
        UPDATE public.orders
        SET status = 'paid'
        WHERE id = NEW.order_id;
    ELSIF NEW.status = 'rejected' THEN
        UPDATE public.orders
        SET status = 'payment_failed'
        WHERE id = NEW.order_id;
    ELSIF NEW.status = 'pending' THEN
        UPDATE public.orders
        SET status = 'pending_payment'
        WHERE id = NEW.order_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update order status when payment status changes
CREATE TRIGGER update_order_status_trigger
AFTER UPDATE ON public.payments
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.update_order_status();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT SELECT ON public.payments TO authenticated;
GRANT SELECT ON public.payment_events TO authenticated;
