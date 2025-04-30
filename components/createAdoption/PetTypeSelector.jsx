import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

// Types of pets
const PET_TYPES = [
  { id: 'Perro', name: 'Perro', icon: 'dog' },
  { id: 'Gato', name: 'Gato', icon: 'cat' },
  { id: 'Ave', name: 'Ave', icon: 'dove' },
  { id: 'Otro', name: 'Otro', icon: 'paw' },
];

/**
 * Componente para seleccionar el tipo de mascota
 */
const PetTypeSelector = ({ selectedType, setSelectedType }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Tipo de mascota</Text>
      
      <View style={styles.typeButtonsContainer}>
        {PET_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              selectedType === type.id && styles.selectedTypeButton
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <FontAwesome5 
              name={type.icon} 
              size={16} 
              color={selectedType === type.id ? COLORS.white : COLORS.primary} 
            />
            <Text 
              style={[
                styles.typeButtonText,
                selectedType === type.id && styles.selectedTypeText
              ]}
            >
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedTypeButton: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
  },
  selectedTypeText: {
    color: COLORS.white,
  },
});

export default PetTypeSelector;
