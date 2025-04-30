import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Componente para mostrar el estado de la solicitud con un badge coloreado
 * @param {object} statusInfo - Información del estado {text, color, bgColor}
 */
export default function StatusBadge({ statusInfo }) {
  if (!statusInfo) return null;
  
  return (
    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
      <Text style={[styles.statusText, { color: statusInfo.color }]}>
        {statusInfo.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
