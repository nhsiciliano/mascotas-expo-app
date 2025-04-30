import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { formatRelativeTime } from '../../utils/dateUtils';

/**
 * Componente que renderiza un ítem de notificación individual
 */
const NotificationItem = ({ notification, onPress }) => {
  // Determinar el icono correcto según el tipo de notificación
  let iconName = 'notifications';
  if (notification.type === 'adoption_request') iconName = 'pets';
  else if (notification.type === 'message') iconName = 'chat';
  else if (notification.type === 'system') iconName = 'info';

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !notification.read && styles.unreadNotification]}
      activeOpacity={0.7}
      onPress={() => onPress(notification)}
    >
      <View style={styles.notificationContent}>
        {notification.image_url ? (
          <Image source={{ uri: notification.image_url }} style={styles.notificationImage} />
        ) : (
          <View style={styles.notificationIcon}>
            <MaterialIcons name={iconName} size={24} color={COLORS.white} />
          </View>
        )}
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTime}>
            {formatRelativeTime(notification.created_at)}
          </Text>
        </View>
        {!notification.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default NotificationItem;
