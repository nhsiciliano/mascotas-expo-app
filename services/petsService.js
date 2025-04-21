import { supabase } from '../lib/supabase';

/**
 * Servicio para gestionar operaciones con mascotas en Supabase
 */
export const petsService = {
  /**
   * Obtiene las mascotas disponibles para adopción
   * @param {string} [currentUserId] - ID del usuario actual para excluir sus propias mascotas
   * @returns {Promise<Array>} Lista de mascotas procesadas con sus imágenes
   */
  async getPets(currentUserId = null) {
    try {
      let query = supabase
        .from('pets')
        .select(`
          id, name, type, breed, age, gender, size, description, 
          phone, latitude, longitude, location_name, created_at,
          status, adopted_by, user_id,
          pet_images(url, is_main)
        `)
        .or('status.is.null,status.neq.adoptada')  // Excluir mascotas con status="adoptada"
        .is('adopted_by', null);                  // Excluir mascotas que tienen adoptante
      
      // Si hay un usuario actual, excluir sus mascotas
      if (currentUserId) {
        query = query.neq('user_id', currentUserId); // Excluir mascotas del usuario actual
      }
      
      const { data: pets, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Procesar las mascotas para añadir la imagen principal
      return this.processPetsData(pets);
    } catch (error) {
      console.error('Error al obtener mascotas:', error.message);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de una mascota específica
   * @param {string} petId - ID de la mascota
   * @returns {Promise<Object>} - Datos de la mascota con su imagen principal
   */
  async getPetById(petId) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select(`
          id, name, type, breed, age, gender, size, description, 
          phone, latitude, longitude, location_name, created_at,
          status, adopted_by,
          pet_images(url, is_main)
        `)
        .eq('id', petId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Procesar las imágenes
      const processedPets = this.processPetsData([data]);
      return processedPets[0];
    } catch (error) {
      console.error(`Error al obtener mascota con ID ${petId}:`, error.message);
      throw error;
    }
  },

  /**
   * Busca mascotas según diferentes criterios
   * @param {Object} filters - Filtros a aplicar
   * @param {string} filters.searchQuery - Texto de búsqueda (nombre, tipo, raza)
   * @param {string} filters.category - Categoría (tipo) de mascota
   * @returns {Promise<Array>} - Lista de mascotas filtradas
   */
  async searchPets(filters = {}) {
    try {
      const { searchQuery, category } = filters;

      let query = supabase
        .from('pets')
        .select(`
          id, name, type, breed, age, gender, size, description, 
          phone, latitude, longitude, location_name, created_at,
          status, adopted_by,
          pet_images(url, is_main)
        `)
        .or('status.is.null,status.neq.adoptada')
        .is('adopted_by', null)
        .order('created_at', { ascending: false });
      
      // Filtrar por categoría si no es "Todos"
      if (category && category !== '1') {
        const categoryMap = {
          '2': 'Perro',
          '3': 'Gato',
          '4': 'Ave',
          '5': 'Otro',
        };
        
        const petType = categoryMap[category];
        if (petType) {
          query = query.eq('type', petType);
        }
      }
      
      // Filtrar por texto si hay búsqueda
      if (searchQuery && searchQuery.trim() !== '') {
        const searchTerm = searchQuery.trim().toLowerCase();
        query = query.or(`name.ilike.%${searchTerm}%,breed.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`);
      }
      
      const { data: pets, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return this.processPetsData(pets);
    } catch (error) {
      console.error('Error al buscar mascotas:', error.message);
      throw error;
    }
  },

  /**
   * Procesa los datos de mascotas para añadir imagen principal y calcular distancia
   * @param {Array} pets - Lista de mascotas a procesar
   * @param {Object} userLocation - Ubicación del usuario para calcular distancia
   * @returns {Array} - Lista de mascotas procesadas
   */
  processPetsData(pets, userLocation = null) {
    return pets.map(pet => {
      // Encontrar la imagen principal o usar la primera disponible
      const mainImage = pet.pet_images.find(img => img.is_main) || pet.pet_images[0];
      
      // Calcular distancia si tenemos ubicación actual
      let distance = null;
      if (userLocation && pet.latitude && pet.longitude) {
        // Calcular distancia usando la fórmula de Haversine
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.deg2rad(pet.latitude - userLocation.latitude);
        const dLon = this.deg2rad(pet.longitude - userLocation.longitude);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.deg2rad(userLocation.latitude)) * Math.cos(this.deg2rad(pet.latitude)) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        distance = R * c; // Distancia en km
      }
      
      return {
        ...pet,
        distance,
        mainImageUrl: mainImage ? mainImage.url : null,
      };
    });
  },

  /**
   * Convierte grados a radianes
   * @param {number} deg - Grados
   * @returns {number} - Radianes
   */
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }
};
