import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente para mostrar información básica de la mascota en una solicitud
 * @param {object} pet - Objeto con datos de la mascota
 * @param {string} imageUrl - URL de la imagen principal de la mascota
 */
export default function PetCard({ pet, imageUrl }) {
  if (!pet) return null;
  
  return (
    <View style={styles.petCard}>
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.petImage} 
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.petImage, styles.noImage]}>
          <MaterialIcons name="pets" size={40} color={COLORS.inactive} />
        </View>
      )}
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{pet.name || 'Mascota'}</Text>
        <Text style={styles.petBreed}>
          {pet.breed || 'Sin especificar'} • {pet.gender === 'male' ? 'Macho' : 'Hembra'}
        </Text>
        <Text style={styles.petAge}>{pet.age || 'Edad desconocida'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  petCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  noImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  petBreed: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  petAge: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});
