import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente para mostrar las acciones de adopción (concretar o desestimar)
 * @param {function} onConcretar - Función para manejar la acción de concretar adopción
 * @param {function} onDesestimar - Función para manejar la acción de desestimar adopción
 */
const AdoptionActions = ({ onConcretar, onDesestimar }) => {
  return (
    <View style={styles.adoptionActions}>
      <TouchableOpacity
        style={[styles.adoptionButton, styles.adoptionButtonDesestimar]}
        onPress={onDesestimar}
      >
        <MaterialIcons name="close" size={16} color={COLORS.white} />
        <Text style={styles.adoptionButtonText}>Desestimar adopción</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.adoptionButton, styles.adoptionButtonConcretar]}
        onPress={onConcretar}
      >
        <MaterialIcons name="check" size={16} color={COLORS.white} />
        <Text style={styles.adoptionButtonText}>Concretar adopción</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  adoptionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  adoptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  adoptionButtonConcretar: {
    backgroundColor: COLORS.primary,
  },
  adoptionButtonDesestimar: {
    backgroundColor: COLORS.danger || '#e53935',
  },
  adoptionButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
});

export default AdoptionActions;
