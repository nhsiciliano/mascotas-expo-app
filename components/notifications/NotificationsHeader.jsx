import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente para la cabecera de la pantalla de notificaciones
 */
const NotificationsHeader = ({ hasNotifications, onMarkAllAsRead }) => {
  const handleMarkAllAsRead = () => {
    if (!hasNotifications) return;
    
    Alert.alert(
      'Marcar todas como leídas',
      '¿Quieres marcar todas tus notificaciones como leídas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aceptar', onPress: onMarkAllAsRead }
      ]
    );
  };

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Notificaciones</Text>
      <TouchableOpacity
        style={[
          styles.settingsButton,
          !hasNotifications && styles.disabledButton
        ]}
        onPress={handleMarkAllAsRead}
        disabled={!hasNotifications}
      >
        <MaterialIcons 
          name="done-all" 
          size={24} 
          color={hasNotifications ? COLORS.text : COLORS.inactive} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  disabledButton: {
    opacity: 0.5,
  }
});

export default NotificationsHeader;
