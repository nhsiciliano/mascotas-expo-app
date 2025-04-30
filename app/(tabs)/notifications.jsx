import { View, StyleSheet, FlatList, ActivityIndicator, Text, RefreshControl } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '../../constants/colors'

// Hook personalizado
import { useNotifications } from '../../hooks/useNotifications'

// Componentes
import NotificationItem from '../../components/notifications/NotificationItem'
import NotificationsHeader from '../../components/notifications/NotificationsHeader'
import EmptyState from '../../components/notifications/EmptyState'

/**
 * Pantalla principal de notificaciones
 */
export default function Notifications() {
  // Usamos el hook personalizado para toda la lógica de notificaciones
  const {
    notifications,
    loading,
    refreshing,
    handleNotificationPress,
    handleRefresh,
    markAllAsRead
  } = useNotifications();

  /**
   * Renderiza cada ítem de notificación
   */
  const renderNotificationItem = ({ item }) => (
    <NotificationItem 
      notification={item} 
      onPress={handleNotificationPress}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con botón para marcar todas como leídas */}
      <NotificationsHeader 
        hasNotifications={notifications.length > 0} 
        onMarkAllAsRead={markAllAsRead} 
      />

      {/* Contenido principal - Estado de carga, lista o estado vacío */}
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
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              title="Actualizando..."
            />
          }
        />
      ) : (
        <EmptyState />
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
  notificationsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  }
});