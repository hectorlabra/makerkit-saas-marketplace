import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_CONFIG, MERCADOPAGO_PUBLIC_KEY } from '../../../../lib/mercadopago/config';
import { processWebhook, createPaymentEvent } from '../../../../lib/mercadopago/supabase-integration';
import { createClient } from '@supabase/supabase-js';
import { logPaymentEvent } from '../../../../lib/marketplace/orders';

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
      // Procesar el webhook con ambos sistemas para asegurar compatibilidad
      await processWebhook(data);
      
      // Procesar según el tipo de acción con el nuevo sistema
      try {
        switch (data.action) {
          case 'payment.created':
          case 'payment.updated': {
            // Obtener los detalles del pago
            const payment = new Payment(client);
            const paymentInfo = await payment.get({ id: resourceId });
            
            // Inicializar Supabase con manejo explícito de tipos
            const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
            const supabaseServiceKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
            
            // Verificar que tenemos las credenciales necesarias
            if (!supabaseUrl || !supabaseServiceKey) {
              console.error('Error: Faltan credenciales de Supabase para procesar el webhook');
              throw new Error('Faltan credenciales de Supabase');
            }
            
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            
            // Buscar el pago en nuestra base de datos
            const { data: paymentData } = await supabase
              .from('payments')
              .select('id, order_id')
              .eq('payment_id', resourceId)
              .maybeSingle();
            
            if (paymentData) {
              // Registrar el evento de pago
              await logPaymentEvent(paymentData.id, {
                status: paymentInfo.status,
                details: `Pago ${resourceId} actualizado vía webhook. Estado: ${paymentInfo.status}`
              });
              
              // Actualizar el estado del pago en la base de datos
              await supabase
                .from('payments')
                .update({ 
                  status: paymentInfo.status,
                  updated_at: new Date().toISOString()
                })
                .eq('id', paymentData.id);
              
              // Actualizar el estado de la orden si es necesario
              if (paymentInfo.status === 'approved') {
                await supabase
                  .from('orders')
                  .update({ 
                    status: 'paid',
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', paymentData.order_id);
              } else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
                await supabase
                  .from('orders')
                  .update({ 
                    status: 'payment_failed',
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', paymentData.order_id);
              }
            }
            
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
      } catch (processingError) {
        console.error('Error al procesar webhook con el nuevo sistema:', processingError);
        // Continuamos con la ejecución normal aunque falle el nuevo sistema
      }
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
