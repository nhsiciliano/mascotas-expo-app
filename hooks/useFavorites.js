import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { favoritesService } from '../services/favoritesService';

/**
 * Hook personalizado para manejar la lógica de favoritos
 * @returns {Object} Funciones y estados para manejar los favoritos
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  /**
   * Obtiene los favoritos del usuario
   * @param {boolean} isRefreshing - Indica si es un refresh manual
   * @returns {Promise<Array>} - Array de mascotas favoritas
   */
  const fetchFavorites = async (isRefreshing = false) => {
    try {
      if (!user) {
        setLoading(false);
        return [];
      }
      
      if (!isRefreshing) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      // Usar el servicio para obtener favoritos
      const favoritesData = await favoritesService.getFavorites(user.id);
      setFavorites(favoritesData);
      return favoritesData;
    } catch (error) {
      console.error('Error al obtener favoritos:', error.message);
      Alert.alert('Error', 'No se pudieron cargar tus mascotas favoritas');
      setFavorites([]);
      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Elimina una mascota de favoritos
   * @param {string} petId - ID de la mascota a eliminar
   * @returns {Promise<boolean>} - True si se eliminó correctamente
   */
  const removeFavorite = async (petId) => {
    try {
      if (!user) return false;
      
      setLoading(true);
      await favoritesService.removeFavorite(user.id, petId);
      
      // Actualizar la lista local de favoritos
      setFavorites(prevFavorites => prevFavorites.filter(pet => pet.id !== petId));
      return true;
    } catch (error) {
      console.error('Error al eliminar favorito:', error.message);
      Alert.alert('Error', 'No se pudo eliminar la mascota de favoritos');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Agrega una mascota a favoritos
   * @param {string} petId - ID de la mascota a agregar
   * @returns {Promise<boolean>} - True si se agregó correctamente
   */
  const addFavorite = async (petId) => {
    try {
      if (!user) return false;
      
      setLoading(true);
      await favoritesService.addFavorite(user.id, petId);
      
      // Refrescar la lista de favoritos para incluir la nueva mascota
      await fetchFavorites();
      return true;
    } catch (error) {
      console.error('Error al agregar favorito:', error.message);
      Alert.alert('Error', 'No se pudo agregar la mascota a favoritos');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifica si una mascota está en favoritos
   * @param {string} petId - ID de la mascota
   * @returns {Promise<boolean>} - True si está en favoritos
   */
  const isFavorite = async (petId) => {
    try {
      if (!user) return false;
      return await favoritesService.isFavorite(user.id, petId);
    } catch (error) {
      console.error('Error al verificar favorito:', error.message);
      return false;
    }
  };

  return {
    favorites,
    loading,
    refreshing,
    fetchFavorites,
    removeFavorite,
    addFavorite,
    isFavorite,
  };
};
