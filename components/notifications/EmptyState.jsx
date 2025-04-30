import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente para mostrar cuando no hay notificaciones
 */
const EmptyState = () => {
  return (
    <View style={styles.emptyState}>
      <MaterialIcons name="notifications-off" size={64} color={COLORS.inactive} />
      <Text style={styles.emptyStateTitle}>No tienes notificaciones</Text>
      <Text style={styles.emptyStateSubtitle}>
        Aquí aparecerán tus notificaciones sobre adopciones y mascotas cercanas
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default EmptyState;
