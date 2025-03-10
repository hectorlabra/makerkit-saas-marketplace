import { useUser } from '@kit/supabase/hooks/use-user';
import { supabaseClient } from '@kit/supabase/client';

export function useAuthRole() {
  const { data: user } = useUser();
  
  const isAdmin = async () => {
    if (!user) return false;
    
    const { data } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    return data?.role === 'admin';
  };
  
  const isSeller = async () => {
    if (!user) return false;
    
    const { data } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    return data?.role === 'seller';
  };
  
  return { isAdmin, isSeller };
}