'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@kit/supabase/client';
import { PageHeader, Button, Card, Input } from '@kit/ui';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  images?: string[];
  seller: {
    name: string;
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
            seller: { name: 'Tech Store' }
          },
          {
            id: '2',
            title: 'Laptop Pro',
            price: 1299.99,
            description: 'Ideal para trabajo y gaming',
            images: ['https://via.placeholder.com/300x300.png?text=Laptop+Pro'],
            seller: { name: 'Tech Store' }
          },
          {
            id: '3',
            title: 'Auriculares inalámbricos',
            price: 89.99,
            description: 'Calidad de sonido premium',
            images: ['https://via.placeholder.com/300x300.png?text=Auriculares'],
            seller: { name: 'Audio Shop' }
          },
          {
            id: '4',
            title: 'Camisa casual',
            price: 39.99,
            description: 'Algodón 100%, varios colores',
            images: ['https://via.placeholder.com/300x300.png?text=Camisa'],
            seller: { name: 'Fashion Store' }
          },
          {
            id: '5',
            title: 'Jeans clásicos',
            price: 49.99,
            description: 'Denim resistente, corte regular',
            images: ['https://via.placeholder.com/300x300.png?text=Jeans'],
            seller: { name: 'Fashion Store' }
          },
          {
            id: '6',
            title: 'Zapatillas deportivas',
            price: 79.99,
            description: 'Ideales para running y entrenamiento',
            images: ['https://via.placeholder.com/300x300.png?text=Zapatillas'],
            seller: { name: 'Sports World' }
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
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">{product.title}</h3>
                  <p className="mt-1 text-gray-500 truncate">{product.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{product.seller.name}</p>
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