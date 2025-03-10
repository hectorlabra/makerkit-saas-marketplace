'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@kit/ui/page';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@kit/supabase/client';
import { useUser } from '@kit/supabase/hooks/use-user';
import { getUserOrders, formatOrderStatus, formatPaymentStatus } from '~/lib/marketplace/orders';
import Link from 'next/link';

interface OrderItem {
  id: string;
  product_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Payment {
  id: string;
  payment_id: string;
  status: string;
  payment_method: string;
  amount: number;
  created_at: string;
}

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  payments: Payment[];
  shipping_name?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip_code?: string;
  shipping_country?: string;
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: user } = useUser();

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        return;
      }

      try {
        setLoading(true);
        
        // Intentar obtener órdenes reales desde Supabase
        try {
          const userOrders = await getUserOrders();
          if (userOrders && userOrders.length > 0) {
            setOrders(userOrders);
            return;
          }
        } catch (error) {
          console.error('Error al cargar órdenes desde Supabase:', error);
          // Continuamos con datos de prueba
        }

        // Simulamos datos para desarrollo si no hay órdenes reales
        const mockOrders: Order[] = [
          {
            id: 'ord_123456',
            created_at: '2023-11-15T08:30:00Z',
            updated_at: '2023-11-15T10:30:00Z',
            status: 'completed',
            total_amount: 1299.99,
            items: [
              {
                id: 'item_1',
                product_id: '2',
                title: 'Laptop Pro',
                quantity: 1,
                unit_price: 1299.99,
                total_price: 1299.99
              }
            ],
            payments: [
              {
                id: 'pay_1',
                payment_id: 'mp_12345',
                status: 'approved',
                payment_method: 'credit_card',
                amount: 1299.99,
                created_at: '2023-11-15T08:35:00Z'
              }
            ],
            shipping_name: 'Mi Nombre',
            shipping_address: 'Calle Principal 123',
            shipping_city: 'Ciudad de México',
            shipping_state: 'CDMX',
            shipping_zip_code: '01000',
            shipping_country: 'México'
          },
          {
            id: 'ord_123457',
            created_at: '2023-11-14T15:45:00Z',
            updated_at: '2023-11-14T16:00:00Z',
            status: 'processing',
            total_amount: 149.97,
            items: [
              {
                id: 'item_2',
                product_id: '4',
                title: 'Camisa casual',
                quantity: 3,
                unit_price: 49.99,
                total_price: 149.97
              }
            ],
            payments: [
              {
                id: 'pay_2',
                payment_id: 'mp_12346',
                status: 'approved',
                payment_method: 'mercado_pago',
                amount: 149.97,
                created_at: '2023-11-14T15:50:00Z'
              }
            ],
            shipping_name: 'Mi Nombre',
            shipping_address: 'Calle Principal 123',
            shipping_city: 'Ciudad de México',
            shipping_state: 'CDMX',
            shipping_zip_code: '01000',
            shipping_country: 'México'
          },
          {
            id: 'ord_123458',
            created_at: '2023-11-13T10:20:00Z',
            updated_at: '2023-11-13T10:25:00Z',
            status: 'pending_payment',
            total_amount: 89.99,
            items: [
              {
                id: 'item_3',
                product_id: '3',
                title: 'Auriculares inalámbricos',
                quantity: 1,
                unit_price: 89.99,
                total_price: 89.99
              }
            ],
            payments: [
              {
                id: 'pay_3',
                payment_id: 'mp_12347',
                status: 'pending',
                payment_method: 'mercado_pago',
                amount: 89.99,
                created_at: '2023-11-13T10:22:00Z'
              }
            ],
            shipping_name: 'Mi Nombre',
            shipping_address: 'Calle Principal 123',
            shipping_city: 'Ciudad de México',
            shipping_state: 'CDMX',
            shipping_zip_code: '01000',
            shipping_country: 'México'
          }
        ];

        setOrders(mockOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-medium mb-4">Acceso no autorizado</h2>
        <p className="text-gray-500 mb-4">
          Necesitas iniciar sesión para ver tus pedidos.
        </p>
        <Button onClick={() => router.push('/auth/sign-in')}>
          Iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="Mis Pedidos"
        subtitle="Historial de tus compras y estado de tus pedidos"
      />

      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center p-8">
            <p>Cargando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No tienes pedidos aún.</p>
            <Button onClick={() => router.push('/products')}>
              Explorar productos
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const orderStatus = formatOrderStatus(order.status);
                  const paymentStatus = order.payments && order.payments.length > 0 
                    ? formatPaymentStatus(order.payments[0].status)
                    : { label: 'No disponible', color: 'gray' };
                  
                  return (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                        <div className="text-sm text-gray-500">{order.items.length} producto(s)</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${orderStatus.color}-100 text-${orderStatus.color}-800`}>
                          {orderStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${paymentStatus.color}-100 text-${paymentStatus.color}-800`}>
                          {paymentStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/checkout/confirmation?order_id=${order.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Ver detalles
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
