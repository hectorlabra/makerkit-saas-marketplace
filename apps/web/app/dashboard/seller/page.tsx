'use client';

import { useState, useEffect } from 'react';
import { Button } from '@kit/ui/shadcn/button';
import { Card } from '@kit/ui/shadcn/card';
import { PageHeader } from '@kit/ui/makerkit/page';
import { useRouter } from 'next/navigation';

// Temporal hasta que implementemos el hook real
const useAuthRole = () => {
  return {
    isSeller: async () => true
  };
};

interface Product {
  id: string;
  title: string;
  price: number;
  status: string;
  description?: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { isSeller } = useAuthRole();

  useEffect(() => {
    async function checkAuthorization() {
      const authorized = await isSeller();
      setIsAuthorized(authorized);
      
      if (!authorized) {
        return;
      }

      try {
        // Aquí cargaríamos los productos del vendedor cuando tengamos la tabla
        // const { data } = await supabaseClient
        //   .from('products')
        //   .select('*')
        //   .eq('seller_id', session.user.id);
        
        // setProducts(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading products:', error);
        setLoading(false);
      }
    }

    checkAuthorization();
  }, [isSeller]);

  const handleCreateProduct = () => {
    router.push('/dashboard/seller/products/new');
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-medium mb-4">Acceso no autorizado</h2>
        <p className="text-gray-500 mb-4">
          Necesitas ser un vendedor para acceder a este panel.
        </p>
        <Button onClick={() => router.push('/products')}>
          Volver a la tienda
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Panel de Vendedor"
          subtitle="Gestiona tus productos y ventas"
        />
        <Button onClick={handleCreateProduct}>Crear Producto</Button>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-medium mb-4">Resumen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="text-gray-500 text-sm">Productos</h3>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="text-gray-500 text-sm">Ventas (mes)</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="text-gray-500 text-sm">Ingresos (mes)</h3>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-medium mb-4">Mis Productos</h2>
        {loading ? (
          <p>Cargando productos...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No tienes productos publicados.</p>
            <Button onClick={handleCreateProduct}>Crear tu primer producto</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
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
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${product.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/dashboard/seller/products/${product.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => console.log('Eliminar', product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
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