import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente para el botón de adopción
 */
const AdoptButton = ({ onPress, loading }) => {
  return (
    <View style={styles.adoptButtonContainer}>
      <TouchableOpacity 
        style={styles.adoptButton}
        onPress={onPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <>
            <FontAwesome name="paw" size={18} color={COLORS.white} />
            <Text style={styles.adoptButtonText}>Solicitar adopción</Text>
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
  adoptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 10,
  },
});

export default AdoptButton;
