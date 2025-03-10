import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_CONFIG } from '@/lib/mercadopago/config';
import { createOrder, createPaymentRecord } from '@/lib/mercadopago/supabase-integration';
import { getUser } from '@/lib/server/auth/user';

type PaymentRequestData = {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
  }>;
  payer?: {
    name: string;
    email: string;
    identification?: any;
    address?: any;
  };
  orderId?: string;
  userId?: string;
  shippingAddress?: Record<string, any>;
  billingAddress?: Record<string, any>;
};

export async function POST(request: Request) {
  try {
    const data = await request.json() as PaymentRequestData;
    
    // Obtener el usuario autenticado si está disponible
    const user = await getUser();
    
    // Usar la configuración centralizada
    const client = new MercadoPagoConfig({ 
      accessToken: MERCADOPAGO_ACCESS_TOKEN
    });
    
    // Crear una preferencia de pago
    const preference = new Preference(client);
    
    // Calcular el monto total de la orden
    const totalAmount = data.items.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
    
    // Si la sincronización con Supabase está habilitada, crear la orden en la base de datos
    let orderId = data.orderId;
    let userId = data.userId || (user ? user.id : 'anonymous');
    
    if (MERCADOPAGO_CONFIG.syncWithSupabase && user) {
      try {
        // Crear la orden en Supabase
        const orderItems = data.items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price
        }));
        
        const order = await createOrder({
          customerId: user.id,
          items: orderItems,
          totalAmount,
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress
        });
        
        // Usar el ID de la orden creada en Supabase
        orderId = order.id;
      } catch (orderError) {
        console.error('Error al crear orden en Supabase:', orderError);
        // Continuar con el proceso de pago aunque falle la creación de la orden
      }
    }
    
    // Crear la preferencia de pago en MercadoPago
    const result = await preference.create({
      body: {
        items: data.items.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: MERCADOPAGO_CONFIG.currency || 'MXN'
        })),
        back_urls: {
          success: MERCADOPAGO_CONFIG.successUrl,
          failure: MERCADOPAGO_CONFIG.failureUrl,
          pending: MERCADOPAGO_CONFIG.pendingUrl,
        },
        notification_url: MERCADOPAGO_CONFIG.notificationUrl,
        auto_return: 'approved',
        // Información del comprador si está disponible
        ...(data.payer && {
          payer: {
            name: data.payer.name,
            email: data.payer.email,
            identification: data.payer.identification,
            address: data.payer.address
          }
        }),
        // Metadatos adicionales para seguimiento
        metadata: {
          order_id: orderId || `order-${Date.now()}`,
          user_id: userId,
          source: 'marketplace'
        },
        // Fecha de expiración (opcional)
        expires: true,
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      }
    });
    
    // Si la sincronización con Supabase está habilitada, registrar el pago
    if (MERCADOPAGO_CONFIG.syncWithSupabase && orderId) {
      try {
        await createPaymentRecord({
          orderId,
          preferenceId: result.id,
          status: 'pending',
          amount: totalAmount,
          currency: MERCADOPAGO_CONFIG.currency || 'MXN',
          metadata: {
            preference: {
              id: result.id,
              init_point: result.init_point,
              sandbox_init_point: result.sandbox_init_point
            }
          }
        });
      } catch (paymentError) {
        console.error('Error al registrar pago en Supabase:', paymentError);
        // Continuar aunque falle el registro del pago
      }
    }
    
    return NextResponse.json({ 
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
      orderId
    });
  } catch (error) {
    console.error('Error al crear preferencia de pago:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al procesar el pago';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Endpoint para procesar pagos con tarjeta directamente
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Obtener el usuario autenticado si está disponible
    const user = await getUser();
    
    // Usar la configuración centralizada
    const client = new MercadoPagoConfig({ 
      accessToken: MERCADOPAGO_ACCESS_TOKEN
    });
    
    // Crear un pago
    const payment = new Payment(client);
    
    // Determinar el ID de usuario y orden
    let orderId = data.orderId;
    let userId = data.userId || (user ? user.id : 'anonymous');
    
    // Si la sincronización con Supabase está habilitada y no hay un orderId, crear la orden
    if (MERCADOPAGO_CONFIG.syncWithSupabase && user && !orderId && data.items) {
      try {
        // Crear la orden en Supabase
        const orderItems = data.items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price
        }));
        
        const order = await createOrder({
          customerId: user.id,
          items: orderItems,
          totalAmount: data.transactionAmount,
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress
        });
        
        // Usar el ID de la orden creada en Supabase
        orderId = order.id;
      } catch (orderError) {
        console.error('Error al crear orden en Supabase:', orderError);
        // Continuar con el proceso de pago aunque falle la creación de la orden
      }
    }
    
    const paymentData = {
      transaction_amount: data.transactionAmount,
      token: data.token,
      description: data.description || 'Compra en Marketplace',
      installments: data.installments || 1,
      payment_method_id: data.paymentMethodId,
      issuer_id: data.issuerId,
      payer: {
        email: data.email,
        identification: data.identification
      },
      metadata: {
        order_id: orderId || `order-${Date.now()}`,
        user_id: userId,
        source: 'marketplace'
      }
    };
    
    const result = await payment.create({ body: paymentData });
    
    // Si la sincronización con Supabase está habilitada, registrar el pago
    if (MERCADOPAGO_CONFIG.syncWithSupabase && orderId) {
      try {
        await createPaymentRecord({
          orderId,
          paymentId: result.id,
          status: result.status,
          amount: data.transactionAmount,
          currency: MERCADOPAGO_CONFIG.currency || 'MXN',
          paymentMethod: data.paymentMethodId,
          paymentType: 'credit_card',
          installments: data.installments || 1,
          metadata: {
            payment: result
          }
        });
      } catch (paymentError) {
        console.error('Error al registrar pago en Supabase:', paymentError);
        // Continuar aunque falle el registro del pago
      }
    }
    
    return NextResponse.json({
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
      orderId
    });
  } catch (error) {
    console.error('Error al procesar pago con tarjeta:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al procesar el pago con tarjeta';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}