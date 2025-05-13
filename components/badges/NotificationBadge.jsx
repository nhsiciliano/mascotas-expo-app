import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * Componente que muestra una burbuja con el número de notificaciones no leídas
 * @param {number} count - Número de notificaciones no leídas
 * @returns {JSX.Element|null} - Componente de burbuja o null si count es 0
 */
const NotificationBadge = ({ count }) => {
  if (!count || count <= 0) return null;
  
  // Si el conteo es mayor a 99, mostrar 99+
  const displayCount = count > 99 ? '99+' : count.toString();
  
  return (
    <View style={styles.badgeContainer}>
      <Text style={styles.badgeText}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    top: 4,
    right: -4,
    backgroundColor: '#E74C3C', // Color rojo para la burbuja
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default NotificationBadge;
