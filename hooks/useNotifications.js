import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para manejar la lógica de notificaciones
 * @returns {Object} Estado y funciones relacionadas con notificaciones
 */
export const useNotifications = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Efecto para cargar notificaciones al iniciar
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [user]);

  /**
   * Obtiene las notificaciones del usuario desde Supabase
   * @param {boolean} isRefreshing - Indica si se está refrescando la lista
   */
  const fetchNotifications = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      if (!user) {
        return;
      }

      // Verificar si la tabla notifications existe
      const { error: tableCheckError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        console.log('Error al verificar tabla notifications:', tableCheckError.message);
        if (tableCheckError.code === '42P01') {
          setNotifications([]);
          return; // La tabla no existe todavía
        }
      }

      // Obtener notificaciones del usuario
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error.message);
      Alert.alert('Error', 'No se pudieron cargar las notificaciones: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Marca una notificación como leída
   * @param {string} notificationId - ID de la notificación a marcar
   */
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Actualizar estado local
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error al marcar como leída:', error.message);
    }
  };

  /**
   * Marca todas las notificaciones como leídas
   */
  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id);

      if (error) throw error;

      // Actualizar estado local
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          read: true
        }))
      );
    } catch (error) {
      console.error('Error:', error.message);
      Alert.alert('Error', 'No se pudieron marcar las notificaciones como leídas.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la acción al presionar una notificación
   * @param {Object} notification - Objeto de notificación
   */
  const handleNotificationPress = async (notification) => {
    // Marcar como leída
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Manejar la navegación según el tipo de notificación
    if (notification.type === 'adoption_request') {
      const data = notification.data;
      if (data && data.request_id) {
        router.push(`/adoption-request?id=${data.request_id}`);
      }
    } else if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  /**
   * Maneja la acción de refrescar la lista
   */
  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  return {
    notifications,
    loading,
    refreshing,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    handleNotificationPress,
    handleRefresh
  };
};
