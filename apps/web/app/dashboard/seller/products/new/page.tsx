'use client';

import { useState } from 'react';
import { Button } from '@kit/ui/shadcn/button';
import { Card } from '@kit/ui/shadcn/card';
import { PageHeader } from '@kit/ui/makerkit/page';
import { useRouter } from 'next/navigation';
import { useAuthRole } from '@kit/auth/hooks/use-auth-role';
import { useUser } from '@kit/supabase/hooks/use-user';

export default function CreateProductPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    images: []
  });
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: user } = useUser();
  const { isSeller } = useAuthRole();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? value.replace(/[^0-9.]/g, '') : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implementación futura: Subir imágenes a Supabase Storage
    console.log('Imágenes seleccionadas:', e.target.files);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError('Debes iniciar sesión para crear un producto');
      return;
    }
    
    const authorized = await isSeller();
    if (!authorized) {
      setError('No tienes permisos para crear productos');
      return;
    }

    if (!formData.title || !formData.price) {
      setError('Los campos Título y Precio son obligatorios');
      return;
    }

    try {
      setLoading(true);
      
      // Cuando tengamos la tabla, realizaríamos la inserción:
      // const { data, error } = await supabaseClient
      //   .from('products')
      //   .insert({
      //     title: formData.title,
      //     description: formData.description,
      //     price: parseFloat(formData.price),
      //     seller_id: user.id,
      //     category_id: formData.category_id || null,
      //     images: formData.images
      //   });

      // if (error) throw error;
      
      // Simulamos éxito
      setTimeout(() => {
        setLoading(false);
        router.push('/dashboard/seller');
      }, 1000);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError('Error al crear el producto: ' + errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        title="Crear Producto"
        subtitle="Añade un nuevo producto a tu catálogo"
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Precio *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="block w-full pl-7 border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
              Imágenes
            </label>
            <input
              type="file"
              id="images"
              name="images"
              onChange={handleImageUpload}
              multiple
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <p className="mt-1 text-sm text-gray-500">
              Puedes subir hasta 5 imágenes. Tamaño máximo: 5MB cada una.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push('/dashboard/seller')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}