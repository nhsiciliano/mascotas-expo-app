import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

// Color adicional para los placeholders que no está en el archivo centralizado
const PLACEHOLDER_COLOR = '#666666';

/**
 * Componente para seleccionar el género de la mascota
 */
const GenderSelector = ({ gender, setGender }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.genderSelectionContainer}>
        <Text style={styles.inputLabel}>Género</Text>
        <View style={styles.genderButtons}>
          {/* Botón para género masculino */}
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'male' && styles.selectedGenderButton
            ]}
            onPress={() => setGender('male')}
          >
            <FontAwesome
              name="mars"
              size={24}
              color={gender === 'male' ? COLORS.white : COLORS.primary}
            />
            <Text
              style={[
                styles.genderText,
                gender === 'male' && styles.selectedGenderText
              ]}
            >
              Macho
            </Text>
          </TouchableOpacity>
          
          {/* Botón para género femenino */}
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'female' && styles.selectedGenderButton
            ]}
            onPress={() => setGender('female')}
          >
            <FontAwesome
              name="venus"
              size={24}
              color={gender === 'female' ? COLORS.white : COLORS.primary}
            />
            <Text
              style={[
                styles.genderText,
                gender === 'female' && styles.selectedGenderText
              ]}
            >
              Hembra
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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
  genderSelectionContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '48%',
  },
  selectedGenderButton: {
    backgroundColor: COLORS.primary,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 10,
  },
  selectedGenderText: {
    color: COLORS.white,
  },
});

export default GenderSelector;
