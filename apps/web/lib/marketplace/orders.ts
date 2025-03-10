/**
 * Servicios para gestionar órdenes y pagos en el marketplace
 * 
 * Este módulo proporciona funciones para interactuar con las órdenes
 * y pagos almacenados en Supabase desde el cliente.
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Tipos para el carrito de compras
export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  seller_id?: string;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

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

/**
 * Crea una nueva orden a partir de los items del carrito
 */
export async function createOrderFromCart(cartItems: CartItem[], shippingAddress: ShippingAddress, userId: string) {
  try {
    // Calcular el total de la orden
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Generar un ID único para la orden
    const orderId = `ord_${uuidv4().substring(0, 8)}`;
    
    // Crear la orden en Supabase
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId,
        status: 'pending_payment',
        total_amount: totalAmount,
        shipping_name: shippingAddress.name,
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_zip_code: shippingAddress.zipCode,
        shipping_country: shippingAddress.country,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (orderError) {
      throw orderError;
    }
    
    // Crear los items de la orden
    const orderItems = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.id,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      seller_id: item.seller_id
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      // Si hay un error al insertar los items, intentamos eliminar la orden para mantener consistencia
      await supabase.from('orders').delete().eq('id', orderId);
      throw itemsError;
    }
    
    return orderData;
  } catch (error) {
    console.error('Error al crear la orden:', error);
    throw error;
  }
}

/**
 * Registra un nuevo pago para una orden
 */
export async function createOrderPayment(orderId: string, paymentData: {
  payment_id: string;
  status: string;
  payment_method: string;
  amount: number;
}) {
  try {
    const paymentId = `pay_${uuidv4().substring(0, 8)}`;
    
    const { data, error } = await supabase
      .from('payments')
      .insert({
        id: paymentId,
        order_id: orderId,
        payment_id: paymentData.payment_id,
        status: paymentData.status,
        payment_method: paymentData.payment_method,
        amount: paymentData.amount,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Actualizar el estado de la orden según el estado del pago
    let orderStatus = 'pending_payment';
    if (paymentData.status === 'approved') {
      orderStatus = 'paid';
    } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
      orderStatus = 'payment_failed';
    }
    
    await updateOrderStatus(orderId, orderStatus);
    
    return data;
  } catch (error) {
    console.error(`Error al crear pago para la orden ${orderId}:`, error);
    throw error;
  }
}

/**
 * Registra un evento de pago (historial de cambios de estado)
 */
export async function logPaymentEvent(paymentId: string, eventData: {
  status: string;
  details?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('payment_events')
      .insert({
        payment_id: paymentId,
        status: eventData.status,
        details: eventData.details || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error al registrar evento para el pago ${paymentId}:`, error);
    throw error;
  }
}
