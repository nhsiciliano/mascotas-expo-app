import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { format, formatDistance } from 'date-fns'
import { es } from 'date-fns/locale'

// Colors matching petDetail.jsx
const COLORS = {
  primary: '#24B24C',
  primaryDark: '#1E9D41',
  primaryLight: '#E8F5EA',
  secondary: '#34CCA9',
  inactive: '#7E7E7E',
  white: '#FFFFFF',
  background: '#F9F9F9',
  shadow: '#000000',
  text: '#333333',
  textLight: '#777777',
};

// Formatear la hora relativa (ej: hace 2 horas, hace 3 días)
const formatRelativeTime = (dateString) => {
  try {
    const date = new Date(dateString);
    return formatDistance(date, new Date(), { addSuffix: true, locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'hace un tiempo';
  }
};

export default function Notifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [user]);

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  const renderNotificationItem = ({ item }) => {
    // Determinar el icono correcto según el tipo de notificación
    let iconName = 'notifications';
    if (item.type === 'adoption_request') iconName = 'pets';
    else if (item.type === 'message') iconName = 'chat';
    else if (item.type === 'system') iconName = 'info';

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadNotification]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationContent}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.notificationImage} />
          ) : (
            <View style={styles.notificationIcon}>
              <MaterialIcons name={iconName} size={24} color={COLORS.white} />
            </View>
          )}
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>{formatRelativeTime(item.created_at)}</Text>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            // Marcar todas como leídas
            if (notifications.length > 0) {
              Alert.alert(
                'Marcar todas como leídas',
                '¿Quieres marcar todas tus notificaciones como leídas?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Aceptar',
                    onPress: async () => {
                      try {
                        setLoading(true);
                        const { error } = await supabase
                          .from('notifications')
                          .update({ read: true })
                          .eq('user_id', user.id);

                        if (error) throw error;

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
                    }
                  }
                ]
              );
            }
          }}
        >
          <MaterialIcons name="done-all" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.notificationsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              title="Actualizando..."
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="notifications-off" size={64} color={COLORS.inactive} />
          <Text style={styles.emptyStateTitle}>No tienes notificaciones</Text>
          <Text style={styles.emptyStateSubtitle}>Aquí aparecerán tus notificaciones sobre adopciones y mascotas cercanas</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  settingsButton: {
    padding: 8,
  },
  notificationsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  notificationItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.inactive,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});