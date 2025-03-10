'use client';

import { useEffect, useState, use } from 'react';
// Comentamos esta importación ya que no se está utilizando actualmente
// import { supabaseClient } from '@kit/supabase/client';
import { PageHeader } from '@kit/ui/makerkit/page';
import { Button } from '@kit/ui/shadcn/button';
import { Card } from '@kit/ui/shadcn/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images?: string[];
  seller: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  created_at: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const router = useRouter();
  
  // Usar React.use() para desenvolver los parámetros de ruta
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { id } = resolvedParams;

  useEffect(() => {
    async function loadProduct() {
      try {
        // Simulación de datos para desarrollo
        if (id === '1') {
          setProduct({
            id: '1',
            title: 'Smartphone XYZ',
            description: 'Último modelo con gran rendimiento. Pantalla de 6.5 pulgadas, cámara de 108MP, batería de 5000mAh y procesador de última generación. Incluye cargador rápido y audífonos.',
            price: 599.99,
            images: [
              'https://via.placeholder.com/500x500.png?text=Smartphone+XYZ',
              'https://via.placeholder.com/500x500.png?text=Smartphone+XYZ+Side',
              'https://via.placeholder.com/500x500.png?text=Smartphone+XYZ+Back',
            ],
            seller: {
              id: 'seller_123',
              name: 'Tech Store'
            },
            category: {
              id: '1',
              name: 'Electrónica',
              slug: 'electronica'
            },
            created_at: '2023-11-10T12:00:00Z'
          });
        } else if (id === '2') {
          setProduct({
            id: '2',
            title: 'Laptop Pro',
            description: 'Ideal para trabajo y gaming. Procesador i7 de 12va generación, 16GB RAM, SSD 512GB, tarjeta gráfica dedicada, pantalla 15.6" Full HD.',
            price: 1299.99,
            images: [
              'https://via.placeholder.com/500x500.png?text=Laptop+Pro',
              'https://via.placeholder.com/500x500.png?text=Laptop+Pro+Open',
            ],
            seller: {
              id: 'seller_123',
              name: 'Tech Store'
            },
            category: {
              id: '1',
              name: 'Electrónica',
              slug: 'electronica'
            },
            created_at: '2023-11-08T14:30:00Z'
          });
        } else {
          // ID no encontrado
          setError('Producto no encontrado');
        }

        // En el futuro, esto sería:
        // const { data, error } = await supabaseClient
        //   .from('products')
        //   .select(`
        //     *,
        //     seller:profiles!seller_id(id, name),
        //     category:categories(id, name, slug)
        //   `)
        //   .eq('id', id)
        //   .single();
        //
        // if (error) throw error;
        // if (!data) throw new Error('Producto no encontrado');
        //
        // setProduct(data);
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    
    try {
      // Simulamos añadir al carrito
      // En una implementación real, guardaríamos en localStorage o en una tabla de carrito
      
      console.log(`Añadido al carrito: ${quantity} x ${product.title}`);
      
      // Simulamos un delay para dar feedback al usuario
      await new Promise(resolve => setTimeout(resolve, 800));
      
      alert(`${quantity} x ${product.title} añadido al carrito`);
      
      // Opcionalmente, podríamos redirigir al carrito
      // router.push('/checkout/cart');
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-medium mb-4">Error</h2>
        <p className="text-gray-500 mb-6">{error || 'Producto no encontrado'}</p>
        <Button onClick={() => router.push('/products')}>
          Volver a la tienda
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="mb-4">
        <Link href={`/categories/${product.category.slug}`}>
          <Button variant="outline" size="sm">
            ← Volver a {product.category.name}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="object-contain w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Sin imagen
              </div>
            )}
          </div>
          
          {/* Miniaturas */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 border-2 rounded ${
                    selectedImage === index
                      ? 'border-blue-500'
                      : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} - Vista ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
          
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Descripción</h2>
            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
          </div>
          
          <div className="mt-6 pb-6 border-b">
            <div className="flex items-center space-x-4">
              <div className="text-gray-700">Cantidad:</div>
              <div className="flex items-center">
                <button
                  className="w-8 h-8 border rounded-l flex items-center justify-center"
                  onClick={() => handleQuantityChange(quantity - 1)}
                >
                  -
                </button>
                <div className="w-12 h-8 border-t border-b flex items-center justify-center">
                  {quantity}
                </div>
                <button
                  className="w-8 h-8 border rounded-r flex items-center justify-center"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-6">
            <Button 
              className="flex-1" 
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? 'Añadiendo...' : 'Añadir al carrito'}
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => router.push('/checkout/cart')}
            >
              Ir al carrito
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <div className="text-sm text-gray-500">
              <p>Vendedor: {product.seller.name}</p>
              <p>Publicado el: {formatDate(product.created_at)}</p>
              <p>Categoría: {product.category.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}