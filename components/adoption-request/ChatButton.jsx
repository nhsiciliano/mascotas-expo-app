import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../constants/colors';

/**
 * Botón para navegar al chat relacionado con la solicitud
 * @param {string} requestId - ID de la solicitud para construir la URL del chat
 */
export default function ChatButton({ requestId }) {
  if (!requestId) return null;
  
  return (
    <TouchableOpacity 
      style={styles.chatButton}
      onPress={() => router.push(`/chat?adoption_request=${requestId}`)}
    >
      <MaterialIcons name="chat" size={20} color={COLORS.white} />
      <Text style={styles.chatButtonText}>Ir al chat</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  chatButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
