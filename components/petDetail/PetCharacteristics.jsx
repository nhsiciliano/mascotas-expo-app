import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente para mostrar las características de la mascota
 */
const PetCharacteristics = ({ characteristics, description }) => {
  return (
    <>
      {/* Sección de características */}
      {characteristics && characteristics.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Características</Text>
          
          <View style={styles.characteristicsContainer}>
            {characteristics.map((item, index) => (
              <View key={index} style={styles.characteristicItem}>
                <MaterialIcons 
                  name={item.icon} 
                  size={20} 
                  color={COLORS.primary} 
                />
                <Text style={styles.characteristicText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Sección de descripción */}
      {description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  characteristicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  characteristicItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: COLORS.primaryLight,
    padding: 10,
    borderRadius: 10,
  },
  characteristicText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textLight,
  },
});

export default PetCharacteristics;
