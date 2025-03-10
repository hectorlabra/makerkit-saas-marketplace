'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@kit/supabase/client';
import { PageHeader, Button } from '@kit/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  images?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { slug } = params;

  useEffect(() => {
    async function loadCategoryAndProducts() {
      try {
        // Simulando datos para desarrollo
        // Estos datos serían reemplazados por consultas reales a la base de datos
        const mockCategories: Record<string, Category> = {
          'electronica': { id: '1', name: 'Electrónica', slug: 'electronica' },
          'ropa': { id: '2', name: 'Ropa', slug: 'ropa' },
          'hogar': { id: '3', name: 'Hogar', slug: 'hogar' },
          'deportes': { id: '4', name: 'Deportes', slug: 'deportes' },
          'juguetes': { id: '5', name: 'Juguetes', slug: 'juguetes' },
        };

        const mockProducts: Record<string, Product[]> = {
          'electronica': [
            { id: '1', title: 'Smartphone XYZ', price: 599.99, description: 'Último modelo con gran rendimiento' },
            { id: '2', title: 'Laptop Pro', price: 1299.99, description: 'Ideal para trabajo y gaming' },
            { id: '3', title: 'Auriculares inalámbricos', price: 89.99, description: 'Calidad de sonido premium' },
          ],
          'ropa': [
            { id: '4', title: 'Camisa casual', price: 39.99, description: 'Algodón 100%, varios colores' },
            { id: '5', title: 'Jeans clásicos', price: 49.99, description: 'Denim resistente, corte regular' },
          ],
        };

        const selectedCategory = mockCategories[slug];
        
        if (selectedCategory) {
          setCategory(selectedCategory);
          setProducts(mockProducts[slug] || []);
        } else {
          // La categoría no existe
          router.push('/categories');
        }

        // En el futuro, esto sería:
        // const { data: categoryData } = await supabaseClient
        //   .from('categories')
        //   .select('*')
        //   .eq('slug', slug)
        //   .single();
        
        // if (categoryData) {
        //   setCategory(categoryData);
        //   
        //   const { data: productsData } = await supabaseClient
        //     .from('products')
        //     .select('*')
        //     .eq('category_id', categoryData.id)
        //     .order('created_at', { ascending: false });
        //   
        //   setProducts(productsData || []);
        // } else {
        //   router.push('/categories');
        // }
      } catch (error) {
        console.error('Error loading category:', error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadCategoryAndProducts();
    }
  }, [slug, router]);

  if (loading) {
    return <div className="flex justify-center p-8">Cargando productos...</div>;
  }

  if (!category) {
    return <div className="flex justify-center p-8">Categoría no encontrada</div>;
  }

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title={category.name}
        subtitle={`Explora todos los productos en ${category.name}`}
      />

      <div className="mb-4">
        <Link href="/categories">
          <Button variant="outline" size="sm">
            ← Todas las categorías
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-gray-500">No hay productos disponibles en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
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
                  <p className="mt-1 text-gray-500 line-clamp-2">{product.description}</p>
                  <p className="mt-2 text-lg font-bold">${product.price.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}