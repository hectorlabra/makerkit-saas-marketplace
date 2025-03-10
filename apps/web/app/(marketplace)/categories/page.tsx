'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@kit/ui/page';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  product_count?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        // Simulación de categorías (se implementará cuando creemos la tabla)
        const mockCategories = [
          { id: '1', name: 'Electrónica', slug: 'electronica', product_count: 42 },
          { id: '2', name: 'Ropa', slug: 'ropa', product_count: 38 },
          { id: '3', name: 'Hogar', slug: 'hogar', product_count: 25 },
          { id: '4', name: 'Deportes', slug: 'deportes', product_count: 18 },
          { id: '5', name: 'Juguetes', slug: 'juguetes', product_count: 15 },
        ];
        
        setCategories(mockCategories);
        
        // En el futuro, esto sería:
        // const { data } = await supabaseClient
        //   .from('categories')
        //   .select('id, name, slug, products:products(id)')
        //   .eq('parent_id', null)
        //   .order('name');
        
        // const processedCategories = data?.map(cat => ({
        //   ...cat,
        //   product_count: cat.products ? cat.products.length : 0
        // })) || [];
        
        // setCategories(processedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="Categorías"
        subtitle="Explora productos por categoría"
      />

      {loading ? (
        <div className="flex justify-center p-8">
          <p>Cargando categorías...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/categories/${category.slug}`}
              className="block no-underline"
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="p-6 flex flex-col h-full">
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                  <p className="text-gray-500 mt-2">
                    {category.product_count} {category.product_count === 1 ? 'producto' : 'productos'}
                  </p>
                  <div className="flex justify-end mt-auto">
                    <Button variant="outline" size="sm" className="mt-4">
                      Ver productos
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}