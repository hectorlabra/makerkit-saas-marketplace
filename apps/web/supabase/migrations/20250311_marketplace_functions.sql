/*
 * -------------------------------------------------------
 * Marketplace Functions
 * This file contains SQL functions for the marketplace
 * -------------------------------------------------------
 */

-- Function to get sales for the current seller
CREATE OR REPLACE FUNCTION public.get_seller_sales()
RETURNS TABLE (
  order_id UUID,
  order_item_id UUID,
  product_id UUID,
  product_title TEXT,
  quantity INTEGER,
  unit_price DECIMAL,
  total_price DECIMAL,
  order_status TEXT,
  payment_status TEXT,
  customer_id UUID,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id as order_id,
    oi.id as order_item_id,
    p.id as product_id,
    p.title as product_title,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    o.status as order_status,
    COALESCE(pay.status, 'unknown') as payment_status,
    o.customer_id,
    a.name as customer_name,
    o.created_at
  FROM 
    public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    JOIN public.products p ON oi.product_id = p.id
    LEFT JOIN public.payments pay ON o.id = pay.order_id
    JOIN public.accounts a ON o.customer_id = a.id
  WHERE 
    p.seller_id = auth.uid()
  ORDER BY 
    o.created_at DESC;
END;
$$;

-- Function to get order summary statistics for a seller
CREATE OR REPLACE FUNCTION public.get_seller_order_stats()
RETURNS TABLE (
  total_orders BIGINT,
  total_sales DECIMAL,
  pending_orders BIGINT,
  completed_orders BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH seller_orders AS (
    SELECT 
      o.id as order_id,
      o.status as order_status,
      oi.total_price
    FROM 
      public.orders o
      JOIN public.order_items oi ON o.id = oi.order_id
      JOIN public.products p ON oi.product_id = p.id
    WHERE 
      p.seller_id = auth.uid()
  )
  SELECT
    COUNT(DISTINCT order_id) as total_orders,
    COALESCE(SUM(total_price), 0) as total_sales,
    COUNT(DISTINCT order_id) FILTER (WHERE order_status IN ('pending', 'pending_payment', 'processing')) as pending_orders,
    COUNT(DISTINCT order_id) FILTER (WHERE order_status IN ('paid', 'shipped', 'delivered')) as completed_orders
  FROM
    seller_orders;
END;
$$;

-- Function to get payment summary statistics for a customer
CREATE OR REPLACE FUNCTION public.get_customer_payment_stats()
RETURNS TABLE (
  total_orders BIGINT,
  total_spent DECIMAL,
  pending_payments BIGINT,
  successful_payments BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status IN ('pending', 'in_process')) as pending_payments,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'approved') as successful_payments
  FROM
    public.orders o
    LEFT JOIN public.payments p ON o.id = p.order_id
  WHERE
    o.customer_id = auth.uid();
END;
$$;
