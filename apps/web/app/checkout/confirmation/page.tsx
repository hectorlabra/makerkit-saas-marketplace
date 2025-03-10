'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@kit/ui/page';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface OrderDetails {
  id: string;
  date: string;
  total: number;
  paymentMethod: string;
  paymentStatus: 'approved' | 'pending' | 'rejected' | 'in_process';
  paymentId?: string;
  items: {
    id: string;
    title: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function OrderConfirmationPage() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Obtener parámetros de la URL que podrían venir de MercadoPago
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const paymentType = searchParams.get('payment_type');
    const merchantOrderId = searchParams.get('merchant_order_id');
    
    // En una implementación real, estos datos vendrían de la respuesta de la API de pago
    // o se recuperarían de Supabase después de registrar la orden.
    // Por ahora, simulamos datos para desarrollo.
    
    const mockOrder: OrderDetails = {
      id: merchantOrderId || 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString(),
      total: 904.77,
      paymentMethod: paymentType || 'MercadoPago',
      paymentStatus: (status as any) || 'approved',
      paymentId: paymentId,
      items: [
        { id: '1', title: 'Smartphone XYZ', quantity: 1, price: 599.99 },
        { id: '3', title: 'Auriculares inalámbricos', quantity: 2, price: 89.99 }
      ],
      shippingAddress: {
        name: 'Usuario de Prueba',
        address: 'Calle Ejemplo 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '01000',
        country: 'México'
      }
    };
    
    setOrderDetails(mockOrder);
    
    // En una implementación real, aquí vaciaríamos el carrito después de un pago exitoso
    // y guardaríamos los detalles de la orden en Supabase.
    
    // Ejemplo:
    // if (status === 'approved') {
    //   clearCart();
    //   saveOrderToSupabase(mockOrder);
    // }
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!orderDetails) {
    return (
      <div className="flex justify-center p-8">
        <p>Cargando detalles de la orden...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
      <div className="text-center py-6">
        {orderDetails.paymentStatus === 'approved' ? (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : orderDetails.paymentStatus === 'pending' || orderDetails.paymentStatus === 'in_process' ? (
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ) : (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        
        <PageHeader
          title={orderDetails.paymentStatus === 'approved' 
            ? "¡Pedido Confirmado!" 
            : orderDetails.paymentStatus === 'pending' || orderDetails.paymentStatus === 'in_process'
              ? "Pedido en Proceso"
              : "Pago Rechazado"}
          subtitle={`Tu número de pedido es: ${orderDetails.id}`}
        />
        
        {orderDetails.paymentId && (
          <p className="text-gray-500 mt-2">ID de pago: {orderDetails.paymentId}</p>
        )}
      </div>

      <Card className="p-6">
        <div className="flex justify-between border-b pb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Detalles del Pedido</h3>
            <p className="text-gray-500">Realizado el {formatDate(orderDetails.date)}</p>
          </div>
          <div>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Pago Completado
            </span>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Productos</h4>
          <div className="divide-y border-y">
            {orderDetails.items.map((item) => (
              <div key={item.id} className="py-4 flex justify-between">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  ${(item.quantity * item.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <p className="text-gray-500">Subtotal</p>
              <p>${orderDetails.total.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <p>Total</p>
              <p>${orderDetails.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t pt-6">
          <div>
            <h4 className="text-md font-medium mb-2">Dirección de Envío</h4>
            <div className="text-gray-600">
              <p>{orderDetails.shippingAddress.name}</p>
              <p>{orderDetails.shippingAddress.address}</p>
              <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}</p>
              <p>{orderDetails.shippingAddress.country}</p>
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium mb-2">Método de Pago</h4>
            <p className="text-gray-600">{orderDetails.paymentMethod}</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-center space-x-4 mt-8">
        <Button onClick={() => router.push('/')}>
          Volver al Inicio
        </Button>
        <Link href="/products">
          <Button variant="outline">
            Seguir Comprando
          </Button>
        </Link>
      </div>

      <p className="text-center text-gray-500 mt-4">
        Se ha enviado un correo electrónico con los detalles de tu pedido.
      </p>
    </div>
  );
}