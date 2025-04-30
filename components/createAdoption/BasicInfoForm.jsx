import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

// Color adicional para los placeholders que no está en el archivo centralizado
const PLACEHOLDER_COLOR = '#666666';

// Types of pets
const PET_TYPES = [
  { id: 'Perro', name: 'Perro', icon: 'dog' },
  { id: 'Gato', name: 'Gato', icon: 'cat' },
  { id: 'Ave', name: 'Ave', icon: 'dove' },
  { id: 'Otro', name: 'Otro', icon: 'paw' },
];

/**
 * Componente para ingresar la información básica de la mascota
 */
const BasicInfoForm = ({ 
  petName, 
  setPetName, 
  selectedType,
  setSelectedType,
  breed, 
  setBreed, 
  age, 
  setAge, 
  size, 
  setSize, 
  handleFocus
}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Información Básica</Text>
      
      {/* Nombre de la mascota */}
      <Text style={styles.inputLabel}>Nombre de la mascota</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ej: Luna, Rocky, etc."
          placeholderTextColor={PLACEHOLDER_COLOR}
          value={petName}
          onChangeText={setPetName}
          onFocus={() => handleFocus('petName', 0)}
        />
      </View>
      
      {/* Tipo de mascota */}
      <Text style={styles.inputLabel}>Tipo de mascota</Text>
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
              size={18}
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
      
      {/* Raza */}
      <Text style={styles.inputLabel}>Raza</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ej: Labrador, Siamés, etc."
          placeholderTextColor={PLACEHOLDER_COLOR}
          value={breed}
          onChangeText={setBreed}
          onFocus={() => handleFocus('breed', 0)}
        />
      </View>
      
      {/* Edad y Tamaño (en fila) */}
      <View style={styles.rowInputs}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>Edad</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 2 años"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={age}
            onChangeText={setAge}
            onFocus={() => handleFocus('age', 0)}
          />
        </View>
        
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Tamaño</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Mediano"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={size}
            onChangeText={setSize}
            onFocus={() => handleFocus('size', 0)}
          />
        </View>
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
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 15,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 12,
    fontSize: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textAreaContainer: {
    marginBottom: 15,
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
});

export default BasicInfoForm;
