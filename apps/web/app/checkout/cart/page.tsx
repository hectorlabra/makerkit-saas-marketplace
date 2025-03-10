'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@kit/ui/page';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CartItem {
  id: string;
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Aquí cargaríamos los items del carrito desde localStorage o una tabla de Supabase
    // Por ahora simulamos datos para desarrollo
    const mockCartItems: CartItem[] = [
      {
        id: 'cart_1',
        product_id: '1',
        title: 'Smartphone XYZ',
        price: 599.99,
        quantity: 1,
        image: 'https://via.placeholder.com/150x150.png?text=Smartphone+XYZ'
      },
      {
        id: 'cart_2',
        product_id: '3',
        title: 'Auriculares inalámbricos',
        price: 89.99,
        quantity: 2,
        image: 'https://via.placeholder.com/150x150.png?text=Auriculares'
      }
    ];

    setCartItems(mockCartItems);
    setLoading(false);
  }, []);

  const handleQuantityChange = (itemId: string, change: number) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleProceedToCheckout = () => {
    setIsProcessing(true);
    // Simular proceso de checkout
    setTimeout(() => {
      router.push('/checkout/payment');
    }, 1000);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  // Impuestos (ejemplo: 16% IVA)
  const taxRate = 0.16;
  const tax = subtotal * taxRate;
  
  // Total
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <p>Cargando carrito...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Carrito de Compras"
        subtitle="Revisa tus productos y procede al pago"
      />

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-4">Tu carrito está vacío</h3>
          <p className="text-gray-500 mb-6">
            Añade algunos productos para continuar comprando.
          </p>
          <Link href="/products">
            <Button>Explorar productos</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Producto
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cantidad
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Precio
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Subtotal
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 mr-4">
                            {item.image ? (
                              <img
                                className="h-16 w-16 object-cover"
                                src={item.image}
                                alt={item.title}
                              />
                            ) : (
                              <div className="h-16 w-16 bg-gray-200 flex items-center justify-center text-gray-400">
                                No img
                              </div>
                            )}
                          </div>
                          <div>
                            <Link href={`/products/${item.product_id}`} className="text-sm font-medium text-gray-900">
                              {item.title}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <button
                            className="w-8 h-8 border rounded-l flex items-center justify-center"
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            -
                          </button>
                          <div className="w-12 h-8 border-t border-b flex items-center justify-center">
                            {item.quantity}
                          </div>
                          <button
                            className="w-8 h-8 border rounded-r flex items-center justify-center"
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
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

            <div className="mt-4">
              <Link href="/products">
                <Button variant="outline" size="sm">
                  ← Seguir comprando
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Resumen de compra
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-500">Subtotal</p>
                  <p className="text-gray-900">${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-500">Impuestos (16%)</p>
                  <p className="text-gray-900">${tax.toFixed(2)}</p>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <p className="text-lg font-bold">Total</p>
                  <p className="text-lg font-bold">${total.toFixed(2)}</p>
                </div>
                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Procesando...' : 'Proceder al pago'}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  Al proceder, aceptas nuestros términos y condiciones de compra.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}