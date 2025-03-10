'use client';

import { useState, useEffect } from 'react';
import { Button } from '@kit/ui/shadcn/button';
import { Card } from '@kit/ui/shadcn/card';
import { Input } from '@kit/ui/shadcn/input';
import { PageHeader } from '@kit/ui/makerkit/page';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';

// Importar directamente la clave pública de MercadoPago
const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'TEST-743a8fe3-d95f-4f00-a3c8-4f1954cefc9c';

// Esta interfaz representaría lo que vendría de la página del carrito
interface OrderSummary {
  subtotal: number;
  tax: number;
  total: number;
  items: {
    id: string;
    title: string;
    quantity: number;
    price: number;
  }[];
}

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'mp'>('credit_card');
  const [mpInitialized, setMpInitialized] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVC: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'México'
  });

  // En una implementación real, estos datos vendrían de un contexto o de Supabase
  const orderSummary: OrderSummary = {
    subtotal: 779.97,
    tax: 124.80,
    total: 904.77,
    items: [
      { id: '1', title: 'Smartphone XYZ', quantity: 1, price: 599.99 },
      { id: '3', title: 'Auriculares inalámbricos', quantity: 2, price: 89.99 }
    ]
  };
  
  // Inicializar MercadoPago
  useEffect(() => {
    // Inicializar el SDK de MercadoPago usando la clave de la configuración centralizada
    try {
      initMercadoPago(MERCADOPAGO_PUBLIC_KEY);
      setMpInitialized(true);
      console.log('MercadoPago inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar MercadoPago:', error);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validaciones específicas para ciertos campos
    if (name === 'cardNumber') {
      // Solo permitir números y espacios, máximo 19 caracteres (16 números + 3 espacios)
      const formatted = value.replace(/[^\d\s]/g, '').substring(0, 19);
      setFormData({ ...formData, [name]: formatted });
    } else if (name === 'cardExpiry') {
      // Formato MM/YY
      const formatted = value
        .replace(/[^\d]/g, '')
        .substring(0, 4)
        .replace(/^(\d{2})(\d{0,2})/, (_, p1, p2) => p2 ? `${p1}/${p2}` : p1);
      setFormData({ ...formData, [name]: formatted });
    } else if (name === 'cardCVC') {
      // Solo números, máximo 4 dígitos
      const formatted = value.replace(/[^\d]/g, '').substring(0, 4);
      setFormData({ ...formData, [name]: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePaymentMethodChange = (method: 'credit_card' | 'mp') => {
    setPaymentMethod(method);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Procesamiento según el método de pago seleccionado
    try {
      if (paymentMethod === 'credit_card') {
        // Procesamiento de tarjeta de crédito propio
        console.log('Procesando pago con tarjeta:', formData);
        
        // Simulamos un delay para la transacción
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Redirigimos a la página de confirmación
        router.push('/checkout/confirmation');
      } else {
        // MercadoPago se maneja en su propio componente
        console.log('MercadoPago seleccionado - el procesamiento se realiza en el componente de MercadoPago');
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setIsSubmitting(false);
      // Mostrar mensaje de error
      alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
    }
  };
  
  // Manejador para el pago con MercadoPago
  const handleMercadoPagoSubmit = async (formData: any) => {
    try {
      console.log('Datos del formulario de MercadoPago:', formData);
      
      // Mostrar estado de carga
      setIsSubmitting(true);
      
      // Enviar datos al backend para procesar el pago
      const response = await fetch('/api/create-payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: formData.token,
          issuerId: formData.issuer_id,
          paymentMethodId: formData.payment_method_id,
          transactionAmount: orderSummary.total,
          installments: formData.installments || 1,
          description: 'Compra en Marketplace',
          email: 'usuario@example.com',
          identification: {
            type: 'DNI',
            number: '12345678'
          },
          items: orderSummary.items
        })
      });
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log('Resultado del pago:', result);
      
      // Redirigimos a la página de confirmación
      router.push('/checkout/confirmation');
    } catch (error) {
      console.error('Error al procesar el pago con MercadoPago:', error);
      setIsSubmitting(false);
      alert('Error al procesar el pago con MercadoPago. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Pago"
        subtitle="Completa la información para finalizar tu compra"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-medium mb-6">Método de pago</h2>
            
            <div className="flex space-x-4 mb-6">
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('credit_card')}
                className={`flex-1 p-4 border rounded-lg flex flex-col items-center ${
                  paymentMethod === 'credit_card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Tarjeta de Crédito/Débito</span>
              </button>
              
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('mp')}
                className={`flex-1 p-4 border rounded-lg flex flex-col items-center ${
                  paymentMethod === 'mp'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>MercadoPago</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {paymentMethod === 'credit_card' ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                        Número de tarjeta
                      </label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                        Nombre en la tarjeta
                      </label>
                      <Input
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="NOMBRE APELLIDO"
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700">
                          Fecha de expiración
                        </label>
                        <Input
                          id="cardExpiry"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          placeholder="MM/AA"
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cardCVC" className="block text-sm font-medium text-gray-700">
                          CVC/CVV
                        </label>
                        <Input
                          id="cardCVC"
                          name="cardCVC"
                          value={formData.cardCVC}
                          onChange={handleChange}
                          placeholder="123"
                          required
                          className="mt-1"
                          type="password"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium my-4">Dirección de facturación</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700">
                        Dirección
                      </label>
                      <Input
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700">
                          Ciudad
                        </label>
                        <Input
                          id="billingCity"
                          name="billingCity"
                          value={formData.billingCity}
                          onChange={handleChange}
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billingState" className="block text-sm font-medium text-gray-700">
                          Estado
                        </label>
                        <Input
                          id="billingState"
                          name="billingState"
                          value={formData.billingState}
                          onChange={handleChange}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="billingZipCode" className="block text-sm font-medium text-gray-700">
                          Código Postal
                        </label>
                        <Input
                          id="billingZipCode"
                          name="billingZipCode"
                          value={formData.billingZipCode}
                          onChange={handleChange}
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700">
                          País
                        </label>
                        <Input
                          id="billingCountry"
                          name="billingCountry"
                          value={formData.billingCountry}
                          onChange={handleChange}
                          disabled
                          className="mt-1 bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 border rounded-lg">
                  {mpInitialized ? (
                    <div className="space-y-4">
                      <p className="text-center text-gray-600 mb-4">
                        Completa los datos de tu tarjeta con MercadoPago
                      </p>
                      <CardPayment
                        initialization={{ 
                          amount: orderSummary.total,
                          preferenceId: '' // No es necesario para pagos con tarjeta directos
                        }}
                        onSubmit={handleMercadoPagoSubmit}
                        onError={(error) => {
                          console.error('Error en el formulario de MercadoPago:', error);
                          setIsSubmitting(false);
                          alert('Error en el formulario de pago. Por favor, inténtalo de nuevo.');
                        }}
                        onReady={() => console.log('MercadoPago CardPayment listo')}
                        onBinChange={(bin) => console.log('BIN cambiado:', bin)}
                      />
                    </div>
                  ) : (
                    <p className="text-center text-gray-600">
                      Cargando MercadoPago...
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Link href="/checkout/cart">
                  <Button variant="outline">
                    Volver al carrito
                  </Button>
                </Link>
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Procesando...' : 'Confirmar pago'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Resumen de la orden
            </h2>
            
            <div className="divide-y">
              {orderSummary.items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <p className="text-gray-500">Subtotal</p>
                <p>${orderSummary.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Impuestos</p>
                <p>${orderSummary.tax.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <p>Total</p>
                <p>${orderSummary.total.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}