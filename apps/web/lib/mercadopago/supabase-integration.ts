/**
 * Integración entre MercadoPago y Supabase
 * 
 * Este módulo proporciona funciones para sincronizar datos entre
 * MercadoPago y Supabase, permitiendo almacenar información de pagos,
 * preferencias y eventos en la base de datos.
 */

import { createClient } from '@supabase/supabase-js';
import { MERCADOPAGO_CONFIG } from './config';

// Inicializar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Utilizamos la clave de servicio para tener acceso completo a la base de datos
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Crea un registro de pago en Supabase
 */
export async function createPaymentRecord({
  orderId,
  paymentId,
  preferenceId,
  status,
  amount,
  currency = MERCADOPAGO_CONFIG.currency,
  paymentMethod,
  paymentType,
  installments,
  metadata = {}
}: {
  orderId: string;
  paymentId?: string;
  preferenceId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_process';
  amount: number;
  currency?: string;
  paymentMethod?: string;
  paymentType?: string;
  installments?: number;
  metadata?: Record<string, any>;
}) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        payment_id: paymentId,
        preference_id: preferenceId,
        status,
        amount,
        currency,
        payment_method: paymentMethod,
        payment_type: paymentType,
        installments,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear registro de pago en Supabase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error al crear registro de pago:', error);
    throw error;
  }
}

/**
 * Actualiza el estado de un pago en Supabase
 */
export async function updatePaymentStatus({
  paymentId,
  status,
  metadata = {}
}: {
  paymentId: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_process';
  metadata?: Record<string, any>;
}) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status,
        metadata: { ...metadata },
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar estado de pago en Supabase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error al actualizar estado de pago:', error);
    throw error;
  }
}

/**
 * Registra un evento de pago en Supabase
 */
export async function createPaymentEvent({
  paymentId,
  eventType,
  status,
  rawData = {}
}: {
  paymentId: string;
  eventType: string;
  status: string;
  rawData?: Record<string, any>;
}) {
  try {
    // Primero obtenemos el ID interno del pago
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select('id')
      .eq('payment_id', paymentId)
      .single();

    if (paymentError || !paymentData) {
      console.error('Error al obtener el pago:', paymentError);
      throw paymentError || new Error('Pago no encontrado');
    }

    const { data, error } = await supabase
      .from('payment_events')
      .insert({
        payment_id: paymentData.id,
        event_type: eventType,
        status,
        raw_data: rawData
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear evento de pago en Supabase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error al crear evento de pago:', error);
    throw error;
  }
}

/**
 * Crea una orden en Supabase
 */
export async function createOrder({
  customerId,
  items,
  totalAmount,
  shippingAddress,
  billingAddress
}: {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  shippingAddress?: Record<string, any>;
  billingAddress?: Record<string, any>;
}) {
  try {
    // Crear la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        billing_address: billingAddress
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error al crear orden en Supabase:', orderError);
      throw orderError;
    }

    // Crear los items de la orden
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.quantity * item.unitPrice
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error al crear items de la orden en Supabase:', itemsError);
      throw itemsError;
    }

    return order;
  } catch (error) {
    console.error('Error al crear orden:', error);
    throw error;
  }
}

/**
 * Procesa un webhook de MercadoPago y actualiza Supabase
 */
export async function processWebhook(data: any) {
  try {
    const { action, data: webhookData } = data;
    
    if (!action || !webhookData || !webhookData.id) {
      throw new Error('Datos de webhook inválidos');
    }

    // Manejar diferentes tipos de eventos
    switch (action) {
      case 'payment.created':
      case 'payment.updated': {
        // Actualizar el estado del pago
        await updatePaymentStatus({
          paymentId: webhookData.id,
          status: webhookData.status || 'pending',
          metadata: { raw: webhookData }
        });

        // Registrar el evento
        await createPaymentEvent({
          paymentId: webhookData.id,
          eventType: action,
          status: webhookData.status || 'unknown',
          rawData: webhookData
        });
        
        break;
      }
      
      default:
        console.log(`Evento no manejado: ${action}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error al procesar webhook:', error);
    throw error;
  }
}

/**
 * Obtiene información de un pago desde Supabase
 */
export async function getPaymentInfo(paymentId: string) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        order:order_id (
          *,
          customer:customer_id (*),
          items:order_items (
            *,
            product:product_id (*)
          )
        )
      `)
      .eq('payment_id', paymentId)
      .single();

    if (error) {
      console.error('Error al obtener información de pago:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error al obtener información de pago:', error);
    throw error;
  }
}
