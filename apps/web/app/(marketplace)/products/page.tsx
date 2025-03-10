'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@kit/supabase/client';
import { PageHeader } from '@kit/ui/page';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  images?: string[];
  rating?: number;
  review_count?: number;
  stock?: number;
  seller: {
    id?: string;
    name: string;
    rating?: number;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');

  useEffect(() => {
    async function loadProducts() {
      try {
        // Simulación de datos para desarrollo
        const mockProducts: Product[] = [
          {
            id: '1',
            title: 'Smartphone XYZ',
            price: 599.99,
            description: 'Último modelo con gran rendimiento',
            images: ['https://via.placeholder.com/300x300.png?text=Smartphone+XYZ'],
            rating: 4.5,
            review_count: 128,
            stock: 3,
            seller: { id: 'seller1', name: 'Tech Store', rating: 4.8 }
          },
          {
            id: '2',
            title: 'Laptop Pro',
            price: 1299.99,
            description: 'Ideal para trabajo y gaming',
            images: ['https://via.placeholder.com/300x300.png?text=Laptop+Pro'],
            rating: 4.8,
            review_count: 75,
            stock: 10,
            seller: { id: 'seller1', name: 'Tech Store', rating: 4.8 }
          },
          {
            id: '3',
            title: 'Auriculares inalámbricos',
            price: 89.99,
            description: 'Calidad de sonido premium',
            images: ['https://via.placeholder.com/300x300.png?text=Auriculares'],
            rating: 4.2,
            review_count: 42,
            stock: 0,
            seller: { id: 'seller2', name: 'Audio Shop', rating: 4.5 }
          },
          {
            id: '4',
            title: 'Camisa casual',
            price: 39.99,
            description: 'Algodón 100%, varios colores',
            images: ['https://via.placeholder.com/300x300.png?text=Camisa'],
            rating: 3.9,
            review_count: 28,
            stock: 15,
            seller: { id: 'seller3', name: 'Fashion Store', rating: 4.1 }
          },
          {
            id: '5',
            title: 'Jeans clásicos',
            price: 49.99,
            description: 'Denim resistente, corte regular',
            images: ['https://via.placeholder.com/300x300.png?text=Jeans'],
            rating: 4.0,
            review_count: 35,
            stock: 8,
            seller: { id: 'seller3', name: 'Fashion Store', rating: 4.1 }
          },
          {
            id: '6',
            title: 'Zapatillas deportivas',
            price: 79.99,
            description: 'Ideales para running y entrenamiento',
            images: ['https://via.placeholder.com/300x300.png?text=Zapatillas'],
            rating: 4.7,
            review_count: 92,
            stock: 5,
            seller: { id: 'seller4', name: 'Sports World', rating: 4.6 }
          }
        ];
        
        setProducts(mockProducts);
        
        // En el futuro, esto sería:
        // const { data, error } = await supabaseClient
        //   .from('products')
        //   .select(`
        //     id,
        //     title,
        //     price,
        //     description,
        //     images,
        //     seller:profiles!seller_id(name)
        //   `)
        //   .order('created_at', { ascending: false });
        //
        // if (error) throw error;
        // setProducts(data || []);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Filtrar productos según el término de búsqueda
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    return (
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'recent':
      default:
        return 0; // Mantener el orden original (en una implementación real, ordenaríamos por fecha)
    }
  });

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="Productos"
        subtitle="Explora todos nuestros productos"
      />

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded p-2"
          >
            <option value="recent">Más recientes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p>Cargando productos...</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No se encontraron productos</h3>
          <p className="mt-2 text-gray-500">
            Intenta con otro término de búsqueda o explora nuestras categorías.
          </p>
          <Link href="/categories">
            <Button className="mt-4">Ver categorías</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <Link
              href={`/products/${product.id}`}
              key={product.id}
              className="block no-underline"
            >
              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-200 relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Sin imagen
                    </div>
                  )}
                  
                  {/* Badge de stock */}
                  {product.stock !== undefined && product.stock <= 5 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {product.stock === 0 ? 'Agotado' : `¡Solo ${product.stock} disponibles!`}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">{product.title}</h3>
                  <p className="mt-1 text-gray-500 truncate">{product.description}</p>
                  
                  {/* Estrellas de valoración si están disponibles */}
                  {product.rating !== undefined && (
                    <div className="mt-1 flex items-center">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg 
                            key={star}
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill={star <= Math.round(product.rating) ? "currentColor" : "none"}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      {product.review_count !== undefined && (
                        <span className="ml-1 text-xs text-gray-500">({product.review_count})</span>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-gray-500">{product.seller.name}</p>
                      {product.seller.rating && (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-yellow-400">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs ml-1">{product.seller.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}