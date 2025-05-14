import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { petsService } from '../services/petsService';
import { favoritesService } from '../services/favoritesService';

/**
 * Hook personalizado para la lógica de la pantalla Home
 * @returns {Object} Estados y funciones para manejar la pantalla Home
 */
export const useHome = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('1'); // "Todos" por defecto
  const [selectedAdoptionType, setSelectedAdoptionType] = useState('all'); // 'all', 'permanent', 'transit'
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPets, setFilteredPets] = useState([]);
  const [allPets, setAllPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Obtener ubicación actual del usuario
  useEffect(() => {
    fetchUserLocation();
  }, []);

  // Cargar mascotas cuando cambia la ubicación
  useEffect(() => {
    fetchPets();
  }, [location]);

  // Cargar favoritos del usuario si está autenticado
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // Filtrar mascotas cuando cambia la categoría, tipo de adopción o la búsqueda
  useEffect(() => {
    filterPets();
  }, [selectedCategory, selectedAdoptionType, searchQuery, allPets]);

  /**
   * Obtiene la ubicación actual del usuario
   */
  const fetchUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Se requiere permiso para acceder a la ubicación');
        // Cargar mascotas de todas formas, pero sin distancia
        fetchPets();
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    } catch (error) {
      console.error('Error al obtener ubicación:', error.message);
      setErrorMsg('No se pudo obtener la ubicación: ' + error.message);
      // Cargar mascotas de todas formas, pero sin distancia
      fetchPets();
    }
  };

  /**
   * Carga las mascotas disponibles para adopción
   * Excluye las mascotas que pertenecen al usuario actual
   */
  const fetchPets = async () => {
    try {
      setLoading(true);
      
      // Pasar el ID del usuario para excluir sus propias mascotas
      const userId = user ? user.id : null;
      const petsData = await petsService.getPets(userId);
      
      // Procesar distancias si tenemos ubicación
      const processedPets = location 
        ? petsService.processPetsData(petsData, location)
        : petsData;
      
      setAllPets(processedPets);
      
      // Aplicar filtros actuales
      filterPets(processedPets);
      
      console.log(`Mascotas cargadas: ${processedPets.length} (excluyendo las propias del usuario)`);
    } catch (error) {
      console.error('Error al cargar mascotas:', error.message);
      Alert.alert('Error', 'No se pudieron cargar las mascotas disponibles');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene los favoritos del usuario actual
   */
  const fetchFavorites = async () => {
    try {
      if (!user) return;
      
      const favoritesData = await favoritesService.getFavorites(user.id);
      // Extraer solo los IDs de las mascotas favoritas
      const favoriteIds = favoritesData.map(pet => pet.id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error al cargar favoritos:', error.message);
      // No mostramos alerta para no interrumpir la experiencia
    }
  };

  /**
   * Filtra las mascotas según la categoría, tipo de adopción y búsqueda
   * @param {Array} pets - Lista de mascotas a filtrar (opcional)
   */
  const filterPets = (pets = allPets) => {
    if (!pets || pets.length === 0) {
      setFilteredPets([]);
      return;
    }
  
    let filtered = [...pets];
    
    // Filtrar por categoría
    if (selectedCategory !== '1') { // Si no es "Todos"
      const categoryMap = {
        '2': 'Perro',
        '3': 'Gato',
        '4': 'Ave',
        '5': 'Otro',
      };
      
      filtered = filtered.filter(pet => pet.type === categoryMap[selectedCategory]);
    }
    
    // Filtrar por tipo de adopción
    if (selectedAdoptionType !== 'all') {
      filtered = filtered.filter(pet => {
        const adoptionType = pet.adoption_type || 'permanent'; // Valor por defecto si no tiene
        return adoptionType === selectedAdoptionType;
      });
    }
    
    // Filtrar por búsqueda
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(pet => 
        pet.name.toLowerCase().includes(query) ||
        pet.breed.toLowerCase().includes(query) ||
        pet.type.toLowerCase().includes(query)
      );
    }
    
    setFilteredPets(filtered);
  };

  /**
   * Cambia la categoría seleccionada
   * @param {string} categoryId - ID de la categoría
   */
  const changeCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };
  
  /**
   * Cambia el tipo de adopción seleccionado
   * @param {string} adoptionType - Tipo de adopción ('all', 'permanent', 'transit')
   */
  const changeAdoptionType = (adoptionType) => {
    setSelectedAdoptionType(adoptionType);
  };

  /**
   * Actualiza el texto de búsqueda
   * @param {string} text - Texto de búsqueda
   */
  const updateSearchQuery = (text) => {
    setSearchQuery(text);
  };

  /**
   * Añade o quita una mascota de favoritos
   * @param {string} petId - ID de la mascota
   */
  const toggleFavorite = async (petId) => {
    if (!user) {
      Alert.alert(
        'Iniciar sesión',
        'Debes iniciar sesión para agregar mascotas a favoritos',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar sesión', onPress: () => router.push('/login') }
        ]
      );
      return;
    }
    
    try {
      const isFavorite = favorites.includes(petId);
      
      if (isFavorite) {
        // Eliminar de favoritos usando el servicio
        await favoritesService.removeFavorite(user.id, petId);
        
        // Actualizar estado local
        setFavorites(favorites.filter(id => id !== petId));
      } else {
        try {
          // Añadir a favoritos usando el servicio
          await favoritesService.addFavorite(user.id, petId);
          
          // Actualizar estado local
          setFavorites([...favorites, petId]);
        } catch (error) {
          // Manejar error de duplicación
          if (error.code === '23505') {
            // Ya está en favoritos, solo actualizamos el estado local si es necesario
            if (!favorites.includes(petId)) {
              setFavorites([...favorites, petId]);
            }
          } else {
            throw error; // Re-lanzar otros errores
          }
        }
      }
    } catch (error) {
      console.error('Error al gestionar favoritos:', error);
      Alert.alert('Error', 'No se pudo actualizar tus favoritos: ' + error.message);
    }
  };

  /**
   * Verifica si una mascota está en favoritos
   * @param {string} petId - ID de la mascota
   * @returns {boolean} - true si está en favoritos
   */
  const isFavorite = (petId) => {
    return favorites.includes(petId);
  };

  /**
   * Refresca todos los datos
   */
  const refreshData = async () => {
    await fetchUserLocation();
    await fetchPets();
    if (user) {
      await fetchFavorites();
    }
  };

  return {
    loading,
    allPets,
    filteredPets,
    location,
    errorMsg,
    favorites,
    selectedCategory,
    selectedAdoptionType,
    searchQuery,
    changeCategory,
    changeAdoptionType,
    updateSearchQuery,
    fetchPets,
    toggleFavorite,
    isFavorite,
    refreshData
  };
};
