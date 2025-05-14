import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * Componente para filtrar mascotas por tipo de adopción
 * @param {string} selectedAdoptionType - Tipo de adopción seleccionado ('all', 'permanent', 'transit')
 * @param {Function} onSelectAdoptionType - Función para cambiar el tipo de adopción
 */
const AdoptionTypeFilter = ({ selectedAdoptionType, onSelectAdoptionType }) => {
  // Opciones de filtro por tipo de adopción
  const adoptionTypes = [
    { id: 'all', name: 'Todos' },
    { id: 'permanent', name: 'Permanente' },
    { id: 'transit', name: 'Tránsito' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tipo de adopción:</Text>
      
      <View style={styles.chipContainer}>
        {adoptionTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.chip,
              selectedAdoptionType === type.id ? styles.selectedChip : null,
              type.id === 'transit' && selectedAdoptionType === type.id ? styles.transitSelected : null
            ]}
            onPress={() => onSelectAdoptionType(type.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedAdoptionType === type.id ? styles.selectedText : null,
                type.id === 'transit' && selectedAdoptionType === type.id ? styles.transitSelectedText : null
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
  container: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedChip: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  transitSelected: {
    backgroundColor: COLORS.transitLight,
    borderColor: COLORS.transit,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  selectedText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  transitSelectedText: {
    color: COLORS.transit,
    fontWeight: '500',
  },
});

export default AdoptionTypeFilter;
