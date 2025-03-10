/**
 * Configuración de MercadoPago para la aplicación
 * 
 * Este archivo contiene las configuraciones y claves necesarias para
 * la integración con MercadoPago y Supabase. En producción, estas claves deberían
 * obtenerse de variables de entorno.
 */

// Claves de API para MercadoPago
export const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'TEST-743a8fe3-d95f-4f00-a3c8-4f1954cefc9c';
export const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-5274723537302382-111111-f7e9e5c9a9f1ea4a5f4c2a6b7c8d9e0f-1234567';

// Determinar el entorno (desarrollo o producción)
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Configuración de la integración con MercadoPago
export const MERCADOPAGO_CONFIG = {
  // URLs de retorno
  successUrl: `${APP_URL}/checkout/confirmation`,
  failureUrl: `${APP_URL}/checkout/payment`,
  pendingUrl: `${APP_URL}/checkout/pending`,
  
  // URL para webhooks
  notificationUrl: process.env.MERCADOPAGO_WEBHOOK_URL || `${APP_URL}/api/webhooks/mercadopago`,
  
  // Configuración de la integración
  integrationType: 'checkout_pro', // checkout_pro, checkout_api
  autoRedirect: true,              // Redireccionar automáticamente a MercadoPago
  
  // Configuración del entorno
  sandbox: !IS_PRODUCTION,          // Usar sandbox en desarrollo
  
  // Configuración de moneda y país
  currency: 'MXN',                 // Moneda (MXN, ARS, BRL, etc.)
  country: 'MX',                   // País (MX, AR, BR, etc.)
  
  // Configuración de la sincronización con Supabase
  syncWithSupabase: true,          // Sincronizar pagos con Supabase
  supabaseOrdersTable: 'orders',   // Tabla de órdenes en Supabase
  supabasePaymentsTable: 'payments' // Tabla de pagos en Supabase
};

// Función para inicializar el cliente de MercadoPago en el servidor
export async function initMercadoPagoServer() {
  try {
    const mercadopago = await import('mercadopago');
    // La API de MercadoPago cambió en la versión 2.0.0+
    // Ahora debemos crear una instancia del cliente
    const client = new mercadopago.default({
      accessToken: MERCADOPAGO_ACCESS_TOKEN,
    });
    return client;
  } catch (error) {
    console.error('Error al inicializar MercadoPago en el servidor:', error);
    throw error;
  }
}
