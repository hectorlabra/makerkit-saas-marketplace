import { initMercadoPago, Checkout } from '@mercadopago/sdk-react';
import { createPreference } from './api';

export const MercadoPagoProvider = ({ children }) => {
  // Inicializar MercadoPago con la clave pública
  initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
  
  return <>{children}</>;
};

export const MercadoPagoCheckout = ({ preferenceId }) => {
  return (
    <Checkout 
      initialization={{ preferenceId }}
      customization={{ 
        visual: { 
          hidePaymentButton: false 
        } 
      }}
    />
  );
};

// API para crear preferencia de pago
export async function createPreference(orderData) {
  const response = await fetch('/api/create-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  
  return response.json();
}