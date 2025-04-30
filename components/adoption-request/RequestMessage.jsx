import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * Componente para mostrar el mensaje de la solicitud de adopción
 * @param {string} message - Texto del mensaje de la solicitud
 */
export default function RequestMessage({ message }) {
  return (
    <View style={styles.messageBox}>
      <Text style={styles.messageText}>{message || 'Sin mensaje'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  messageBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
});
