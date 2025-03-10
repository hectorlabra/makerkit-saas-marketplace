'use client';

import { useEffect, useState } from 'react';
import { PageHeader, Card, Button } from '@kit/ui';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@kit/supabase/client';
import { useAuthRole } from '@kit/features/auth/hooks/use-auth-role';
import { useUser } from '@kit/supabase/hooks/use-user';

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  buyer: {
    name: string;
    email: string;
  };
  items: {
    product_id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }[];
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const { data: user } = useUser();
  const { isSeller } = useAuthRole();

  useEffect(() => {
    async function checkAuthorizationAndLoadOrders() {
      const authorized = await isSeller();
      setIsAuthorized(authorized);
      
      if (!authorized) {
        return;
      }

      try {
        // En el futuro, esto sería:
        // const { data } = await supabaseClient
        //   .from('orders')
        //   .select(`
        //     id, 
        //     created_at, 
        //     status, 
        //     total,
        //     buyer:profiles!buyer_id(name, email),
        //     items:order_items(product_id, title, quantity, unit_price)
        //   `)
        //   .eq('seller_id', user?.id)
        //   .order('created_at', { ascending: false });

        // Simulamos datos para desarrollo
        const mockOrders: Order[] = [
          {
            id: 'ord_123456',
            created_at: '2023-11-15T08:30:00Z',
            total: 1299.99,
            status: 'completed',
            buyer: {
              name: 'Juan Pérez',
              email: 'juan.perez@example.com'
            },
            items: [
              {
                product_id: '2',
                title: 'Laptop Pro',
                quantity: 1,
                unit_price: 1299.99
              }
            ]
          },
          {
            id: 'ord_123457',
            created_at: '2023-11-14T15:45:00Z',
            total: 149.97,
            status: 'processing',
            buyer: {
              name: 'María López',
              email: 'maria.lopez@example.com'
            },
            items: [
              {
                product_id: '4',
                title: 'Camisa casual',
                quantity: 3,
                unit_price: 49.99
              }
            ]
          },
          {
            id: 'ord_123458',
            created_at: '2023-11-13T10:20:00Z',
            total: 89.99,
            status: 'pending',
            buyer: {
              name: 'Carlos Rodríguez',
              email: 'carlos.rodriguez@example.com'
            },
            items: [
              {
                product_id: '3',
                title: 'Auriculares inalámbricos',
                quantity: 1,
                unit_price: 89.99
              }
            ]
          }
        ];

        setOrders(mockOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    }

    checkAuthorizationAndLoadOrders();
  }, [isSeller, user?.id]);

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'En proceso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

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

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-medium mb-4">Acceso no autorizado</h2>
        <p className="text-gray-500 mb-4">
          Necesitas ser un vendedor para acceder a esta página.
        </p>
        <Button onClick={() => router.push('/products')}>
          Volver a la tienda
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="Órdenes"
        subtitle="Administra las órdenes de tus productos"
      />

      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center p-8">
            <p>Cargando órdenes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No tienes órdenes aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm">{order.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.buyer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.buyer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${order.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/dashboard/seller/orders/${order.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}