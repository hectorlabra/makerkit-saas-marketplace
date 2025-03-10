/**
 * Servicios para gestionar órdenes y pagos en el marketplace
 * 
 * Este módulo proporciona funciones para interactuar con las órdenes
 * y pagos almacenados en Supabase desde el cliente.
 */

import { createClient } from '@supabase/supabase-js';

// Inicializar cliente de Supabase (cliente)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Obtiene las órdenes del usuario actual
 */
export async function getUserOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          *,
          product:product_id (*)
        ),
        payments (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error al obtener órdenes del usuario:', error);
    throw error;
  }
}

/**
 * Obtiene una orden específica por su ID
 */
export async function getOrderById(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          *,
          product:product_id (*)
        ),
        payments (*)
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error al obtener la orden ${orderId}:`, error);
    throw error;
  }
}

/**
 * Obtiene los pagos asociados a una orden
 */
export async function getOrderPayments(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(`Error al obtener pagos de la orden ${orderId}:`, error);
    throw error;
  }
}

/**
 * Obtiene información detallada de un pago
 */
export async function getPaymentDetails(paymentId: string) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        events:payment_events (*)
      `)
      .eq('id', paymentId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error al obtener detalles del pago ${paymentId}:`, error);
    throw error;
  }
}

/**
 * Obtiene las ventas del vendedor actual
 */
export async function getSellerSales() {
  try {
    // Esta consulta es más compleja porque necesitamos unir varias tablas
    const { data, error } = await supabase
      .rpc('get_seller_sales');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error al obtener ventas del vendedor:', error);
    throw error;
  }
}

/**
 * Actualiza el estado de una orden
 */
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error al actualizar estado de la orden ${orderId}:`, error);
    throw error;
  }
}

/**
 * Formatea el estado de un pago para mostrar en la UI
 */
export function formatPaymentStatus(status: string) {
  const statusMap: Record<string, { label: string, color: string }> = {
    'pending': { label: 'Pendiente', color: 'yellow' },
    'approved': { label: 'Aprobado', color: 'green' },
    'authorized': { label: 'Autorizado', color: 'blue' },
    'in_process': { label: 'En proceso', color: 'blue' },
    'in_mediation': { label: 'En mediación', color: 'orange' },
    'rejected': { label: 'Rechazado', color: 'red' },
    'cancelled': { label: 'Cancelado', color: 'gray' },
    'refunded': { label: 'Reembolsado', color: 'purple' },
    'charged_back': { label: 'Contracargo', color: 'red' }
  };

  return statusMap[status] || { label: status, color: 'gray' };
}

/**
 * Formatea el estado de una orden para mostrar en la UI
 */
export function formatOrderStatus(status: string) {
  const statusMap: Record<string, { label: string, color: string }> = {
    'pending': { label: 'Pendiente', color: 'yellow' },
    'pending_payment': { label: 'Pago pendiente', color: 'yellow' },
    'paid': { label: 'Pagada', color: 'green' },
    'processing': { label: 'Procesando', color: 'blue' },
    'shipped': { label: 'Enviada', color: 'blue' },
    'delivered': { label: 'Entregada', color: 'green' },
    'cancelled': { label: 'Cancelada', color: 'gray' },
    'refunded': { label: 'Reembolsada', color: 'purple' },
    'payment_failed': { label: 'Pago fallido', color: 'red' }
  };

  return statusMap[status] || { label: status, color: 'gray' };
}
