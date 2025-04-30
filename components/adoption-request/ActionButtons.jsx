import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente para los botones de acción (aceptar/rechazar solicitud)
 * @param {function} onAccept - Función para aceptar la solicitud
 * @param {function} onReject - Función para rechazar la solicitud
 * @param {boolean} processing - Indica si hay una solicitud en proceso
 */
export default function ActionButtons({ onAccept, onReject, processing }) {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.rejectButton]}
        onPress={onReject}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <>
            <MaterialIcons name="close" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Rechazar</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.actionButton, styles.acceptButton]}
        onPress={onAccept}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <>
            <MaterialIcons name="check" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Aceptar</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  rejectButton: {
    backgroundColor: COLORS.danger,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
