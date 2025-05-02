import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para obtener estadísticas del perfil de usuario
 * @returns {Object} Estadísticas del usuario
 */
export const useProfileStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    adoptions: 0,
    favorites: 0,
    posts: 0
  });
  const [loading, setLoading] = useState(true);

  // Obtener estadísticas del usuario
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Contador de adopciones realizadas - mascotas adoptadas por el usuario
        const { data: adoptionsData, error: adoptionsError } = await supabase
          .from('pets')
          .select('id', { count: 'exact' })
          .eq('adopted_by', user.id);

        // Contador de favoritos del usuario
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('favorites')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        // Contador de mascotas publicadas para adopción por el usuario
        const { data: postsData, error: postsError } = await supabase
          .from('pets')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        if (adoptionsError) console.error('Error al obtener adopciones:', adoptionsError);
        if (favoritesError) console.error('Error al obtener favoritos:', favoritesError);
        if (postsError) console.error('Error al obtener publicaciones:', postsError);

        setStats({
          adoptions: adoptionsData?.length || 0,
          favorites: favoritesData?.length || 0,
          posts: postsData?.length || 0
        });
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return {
    stats,
    loading
  };
};
