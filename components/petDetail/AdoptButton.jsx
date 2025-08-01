import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente para el botón de adopción
 * @param {Function} onPress - Función a ejecutar al presionar el botón
 * @param {Boolean} loading - Indicador de carga
 * @param {Boolean} alreadyRequested - Indicador de si ya se ha solicitado la adopción
 */
const AdoptButton = ({ onPress, loading, alreadyRequested = false }) => {
  return (
    <View style={styles.adoptButtonContainer}>
      <TouchableOpacity 
        style={[styles.adoptButton, alreadyRequested && styles.alreadyRequestedButton]}
        onPress={onPress}
        disabled={loading || alreadyRequested}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <>
            <FontAwesome 
              name={alreadyRequested ? "check-circle" : "paw"} 
              size={18} 
              color={COLORS.white} 
            />
            <Text style={styles.adoptButtonText}>
              {alreadyRequested ? "Adopción solicitada" : "Solicitar adopción"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  adoptButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  adoptButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 15,
  },
  alreadyRequestedButton: {
    backgroundColor: '#7F8C8D', // Color gris para indicar que ya se ha solicitado
    opacity: 0.9,
  },
  adoptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 10,
  },
});

export default AdoptButton;
