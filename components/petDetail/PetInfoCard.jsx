import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente para mostrar la información básica de la mascota
 */
const PetInfoCard = ({ pet }) => {
  if (!pet) return null;

  // Determinar el tipo de adopción (por defecto es permanente)
  const adoptionType = pet.adoption_type || 'permanent';
  const isTransit = adoptionType === 'transit';
  const transitDaysText = isTransit && pet.transit_days ? `(${pet.transit_days})` : '';

  return (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <View>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>{pet.breed}</Text>
          
          {/* Tipo de adopción */}
          <View style={[styles.adoptionTypeContainer, isTransit ? styles.transitContainer : styles.permanentContainer]}>
            <Text style={[styles.adoptionTypeText, isTransit ? styles.transitText : styles.permanentText]}>
              {isTransit ? `Tránsito ${transitDaysText}` : 'Adopción permanente'}
            </Text>
          </View>
        </View>

        <View style={styles.ageGenderContainer}>
          <View style={[styles.pill, { marginRight: 8 }]}>
            <Text style={styles.pillText}>{pet.age}</Text>
          </View>

          <View style={styles.pill}>
            <Text style={styles.pillText}>
              {pet.gender === 'male' ? 'Macho' :
                pet.gender === 'female' ? 'Hembra' : pet.gender}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <MaterialIcons name="place" size={16} color={COLORS.textLight} />
        <Text style={styles.locationText}>
          {pet.location && pet.location.length > 35 
            ? `${pet.location.substring(0, 35)}...` 
            : pet.location}
        </Text>
        {pet.distance && (
          <Text style={styles.distanceText}>{pet.distance}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    margin: 15,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  petBreed: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  ageGenderContainer: {
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 5,
  },
  distanceText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  adoptionTypeContainer: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  permanentContainer: {
    backgroundColor: COLORS.primaryLight,
  },
  transitContainer: {
    backgroundColor: COLORS.transitLight,
  },
  adoptionTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  permanentText: {
    color: COLORS.primary,
  },
  transitText: {
    color: COLORS.transit,
  },
});

export default PetInfoCard;
