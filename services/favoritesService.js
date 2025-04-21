import { supabase } from '../lib/supabase';

/**
 * Servicio para gestionar operaciones con favoritos en Supabase
 */
export const favoritesService = {
  /**
   * Verifica si existe la tabla de favoritos y la crea si no existe
   * @returns {Promise<boolean>} - True si la tabla existe o se creó correctamente
   */
  async checkAndCreateFavoritesTable() {
    try {
      // Intentamos hacer una consulta básica a la tabla favorites
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .limit(1);
      
      // Si no hay error, la tabla existe
      if (!error) {
        return true;
      }
      
      // Si hay un error y es porque la tabla no existe (código 42P01)
      if (error && error.code === '42P01') {
        console.log('La tabla favorites no existe, intentando crearla...');
        
        // Intentamos crear la tabla usando una función RPC en Supabase
        // En producción, esto debería hacerse mediante migraciones o desde el panel de Supabase
        const { error: createError } = await supabase
          .rpc('create_favorites_table');
        
        if (createError) {
          console.error('Error al crear la tabla favorites:', createError.message);
          return false;
        }
        
        console.log('Tabla favorites creada correctamente');
        return true;
      }
      
      console.error('Error al verificar la tabla favorites:', error.message);
      return false;
    } catch (error) {
      console.error('Error en checkAndCreateFavoritesTable:', error.message);
      return false;
    }
  },

  /**
   * Obtiene las mascotas favoritas del usuario actual
   * @param {string} userId - ID del usuario actual
   * @returns {Promise<Array>} - Array de mascotas favoritas
   */
  async getFavorites(userId) {
    try {
      // Verificar si existe la tabla de favoritos
      await this.checkAndCreateFavoritesTable();
      
      // Obtener los IDs de mascotas favoritas del usuario
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('pet_id')
        .eq('user_id', userId);
      
      if (favoritesError) {
        throw favoritesError;
      }
      
      // Si no hay favoritos, devolver array vacío
      if (!favoritesData || favoritesData.length === 0) {
        return [];
      }
      
      // Extraer IDs de mascotas
      const petIds = favoritesData.map(fav => fav.pet_id);
      
      // Obtener detalles de las mascotas favoritas
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select(`
          id, 
          name, 
          type, 
          breed, 
          age, 
          gender,
          description,
          pet_images (
            id,
            url,
            is_main
          )
        `)
        .in('id', petIds);
      
      if (petsError) {
        throw petsError;
      }
      
      // Procesar los datos para un formato más amigable
      return petsData.map(pet => {
        // Encontrar la imagen principal o la primera disponible
        const mainImage = pet.pet_images && pet.pet_images.length > 0
          ? pet.pet_images.find(img => img.is_main) || pet.pet_images[0]
          : null;
        
        return {
          id: pet.id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          age: pet.age,
          gender: pet.gender,
          description: pet.description,
          image_url: mainImage ? mainImage.url : null
        };
      });
    } catch (error) {
      console.error('Error en getFavorites:', error.message);
      throw error;
    }
  },

  /**
   * Elimina una mascota de los favoritos
   * @param {string} userId - ID del usuario actual
   * @param {string} petId - ID de la mascota a eliminar
   * @returns {Promise<boolean>} - True si se eliminó correctamente
   */
  async removeFavorite(userId, petId) {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: userId, pet_id: petId });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error en removeFavorite:', error.message);
      throw error;
    }
  },

  /**
   * Agrega una mascota a favoritos
   * @param {string} userId - ID del usuario actual
   * @param {string} petId - ID de la mascota a agregar
   * @returns {Promise<boolean>} - True si se agregó correctamente
   */
  async addFavorite(userId, petId) {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, pet_id: petId });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error en addFavorite:', error.message);
      throw error;
    }
  },

  /**
   * Verifica si una mascota está en favoritos
   * @param {string} userId - ID del usuario actual
   * @param {string} petId - ID de la mascota a verificar
   * @returns {Promise<boolean>} - True si la mascota está en favoritos
   */
  async isFavorite(userId, petId) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .match({ user_id: userId, pet_id: petId });
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error en isFavorite:', error.message);
      throw error;
    }
  }
};
