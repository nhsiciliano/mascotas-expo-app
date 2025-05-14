import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * Componente para seleccionar el tipo de adopción (permanente o tránsito)
 * @param {string} adoptionType - Tipo de adopción seleccionado ('permanent' o 'transit')
 * @param {function} setAdoptionType - Función para cambiar el tipo de adopción
 * @param {string} transitDays - Días de tránsito ingresados
 * @param {function} setTransitDays - Función para cambiar los días de tránsito
 */
export default function AdoptionTypeSelector({ 
  adoptionType, 
  setAdoptionType,
  transitDays,
  setTransitDays
}) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Tipo de Adopción</Text>
      <Text style={styles.sectionSubtitle}>Selecciona si buscas una adopción permanente o temporaria (tránsito)</Text>
      
      <View style={styles.typeButtons}>
        <TouchableOpacity 
          style={[
            styles.typeButton, 
            adoptionType === 'permanent' && styles.selectedButton
          ]}
          onPress={() => setAdoptionType('permanent')}
        >
          <Text style={[
            styles.typeButtonText,
            adoptionType === 'permanent' && styles.selectedButtonText
          ]}>Permanente</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.typeButton, 
            adoptionType === 'transit' && styles.selectedButton
          ]}
          onPress={() => setAdoptionType('transit')}
        >
          <Text style={[
            styles.typeButtonText,
            adoptionType === 'transit' && styles.selectedButtonText
          ]}>Tránsito</Text>
        </TouchableOpacity>
      </View>
      
      {/* Campo de días de tránsito - solo se muestra si el tipo es tránsito */}
      {adoptionType === 'transit' && (
        <View style={styles.transitDaysContainer}>
          <Text style={styles.inputLabel}>Días aproximados de tránsito</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 15 días o Tiempo indeterminado"
            placeholderTextColor="#666666"
            value={transitDays}
            onChangeText={setTransitDays}
          />
          <Text style={styles.helperText}>
            Si no conoces los días aproximados de tránsito ingresa: Tiempo indeterminado
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 15,
  },
  typeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  selectedButtonText: {
    color: COLORS.white,
  },
  transitDaysContainer: {
    marginTop: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
