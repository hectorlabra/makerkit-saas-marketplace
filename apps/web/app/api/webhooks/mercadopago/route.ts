import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_CONFIG, MERCADOPAGO_PUBLIC_KEY } from '../../../../lib/mercadopago/config';
import { processWebhook, createPaymentEvent } from '../../../../lib/mercadopago/supabase-integration';

type WebhookData = {
  action: string;
  data: {
    id: string;
    [key: string]: any;
  };
  [key: string]: any;
};

/**
 * Endpoint para recibir webhooks de MercadoPago
 * 
 * MercadoPago envía notificaciones a este endpoint cuando ocurre un evento
 * relacionado con un pago, como cuando un pago es aprobado, rechazado o está pendiente.
 * 
 * Documentación: https://www.mercadopago.com.mx/developers/es/docs/checkout-api/webhooks
 */
export async function POST(request: Request) {
  let data: WebhookData | null = null;
  
  try {
    // Obtener los datos del webhook
    data = await request.json() as WebhookData;
    
    // Verificar que sea un webhook de MercadoPago
    if (!data.action || !data.data) {
      return NextResponse.json(
        { error: 'Formato de webhook inválido' },
        { status: 400 }
      );
    }
    
    // Obtener el ID del recurso (pago, preferencia, etc.)
    const resourceId = data.data.id;
    
    // Inicializar el cliente de MercadoPago
    const client = new MercadoPagoConfig({ 
      accessToken: MERCADOPAGO_ACCESS_TOKEN
    });
    
    // Verificar si debemos sincronizar con Supabase
    if (MERCADOPAGO_CONFIG.syncWithSupabase) {
      // Procesar el webhook y sincronizar con Supabase
      await processWebhook(data);
    } else {
      // Procesar según el tipo de acción sin Supabase
      switch (data.action) {
        case 'payment.created':
        case 'payment.updated': {
          // Obtener los detalles del pago
          const payment = new Payment(client);
          const paymentInfo = await payment.get({ id: resourceId });
          
          // Registrar la información del pago
          console.log(`Pago ${resourceId} actualizado. Estado: ${paymentInfo.status}`);
          console.log('Detalles del pago:', JSON.stringify(paymentInfo, null, 2));
          
          break;
        }
        
        // Otros tipos de eventos que podríamos manejar
        case 'merchant_order.created':
        case 'merchant_order.updated':
          console.log(`Orden ${resourceId} actualizada`);
          break;
          
        default:
          console.log(`Evento no manejado: ${data.action}`);
      }
    }
    
    // Responder con éxito
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al procesar webhook de MercadoPago:', error);
    
    // Registrar el error en los logs para depuración
    try {
      const webhookData = data ? JSON.stringify(data, null, 2) : 'No data available';
      console.error('Datos del webhook:', webhookData);
      
      // Intentar registrar el error en Supabase si es posible
      if (MERCADOPAGO_CONFIG.syncWithSupabase && data?.data?.id) {
        try {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await createPaymentEvent({
            paymentId: data.data.id,
            eventType: 'webhook.error',
            status: 'error',
            rawData: { error: errorMessage, webhook: data }
          });
        } catch (supabaseError) {
          console.error('Error al registrar el error en Supabase:', supabaseError);
        }
      }
    } catch (logError) {
      console.error('Error al registrar el error:', logError);
    }
    
    // Responder con error pero con código 200 para que MercadoPago no reintente
    // (MercadoPago reintenta si recibe códigos 4xx o 5xx)
    const errorMessage = error instanceof Error ? error.message : 'Error al procesar webhook';
    return NextResponse.json(
      { error: errorMessage },
      { status: 200 }
    );
  }
}

// Método GET para verificar que el endpoint está funcionando
export async function GET() {
  // Verificar la configuración
  const config = {
    mercadopago: {
      publicKey: MERCADOPAGO_PUBLIC_KEY ? 'Configurada' : 'No configurada',
      accessToken: MERCADOPAGO_ACCESS_TOKEN ? 'Configurado' : 'No configurado',
      webhookUrl: MERCADOPAGO_CONFIG.notificationUrl,
      syncWithSupabase: MERCADOPAGO_CONFIG.syncWithSupabase ? 'Activada' : 'Desactivada'
    }
  };
  
  return NextResponse.json({
    status: 'ok',
    message: 'Endpoint de webhooks de MercadoPago funcionando correctamente',
    config,
    timestamp: new Date().toISOString()
  });
}
