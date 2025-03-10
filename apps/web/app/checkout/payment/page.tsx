'use client';

import { useState } from 'react';
import { Button } from '@kit/ui/shadcn/button';
import { Card } from '@kit/ui/shadcn/card';
import { Input } from '@kit/ui/shadcn/input';
import { PageHeader } from '@kit/ui/makerkit/page';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    
    // Aquí simularemos el proceso de pago
    try {
      // En una implementación real, aquí conectaríamos con un servicio de pago
      console.log('Procesando pago con los siguientes datos:', { 
        method: paymentMethod,
        formData,
        orderSummary
      });
      
      // Simulamos un delay para la transacción
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirigimos a la página de confirmación
      router.push('/checkout/confirmation');
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setIsSubmitting(false);
      // Mostrar mensaje de error
      alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
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
                <div className="text-center p-8 border rounded-lg bg-gray-50">
                  <p className="mb-4">Serás redirigido a MercadoPago para completar tu pago.</p>
                  <p className="text-sm text-gray-500">
                    (Esta es una simulación. En una implementación real, se integraría el SDK de MercadoPago)
                  </p>
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