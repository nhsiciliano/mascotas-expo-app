import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { COLORS } from '../../constants/colors';

/**
 * Tarjeta que muestra información de una mascota
 */
const PetCard = ({ pet, onPress, onFavoriteToggle, isFavorite }) => {
  const formattedDistance = pet.distance 
    ? pet.distance < 1
      ? `${Math.round(pet.distance * 1000)} m` // Menos de 1km, mostrar en metros
      : `${pet.distance.toFixed(1)} km` 
    : null;

  const getAgeText = (age) => {
    if (!age) return '';
    
    if (age === 1) {
      return '1 año';
    } else if (age < 1) {
      return 'Cachorro';
    } else {
      return `${age}`;
    }
  };

  // Determinar si el tipo de adopción es permanente o tránsito
  // Si no existe el campo adoption_type, asumimos que es permanente (valor por defecto)
  const adoptionType = pet.adoption_type || 'permanent';
  const isTransit = adoptionType === 'transit';
  
  // Obtener el texto para los días de tránsito si corresponde
  const transitDaysText = isTransit && pet.transit_days ? `(${pet.transit_days})` : '';

  return (
    <TouchableOpacity 
      style={styles.petCard}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Imagen de la mascota */}
      <Image 
        source={{ uri: pet.mainImageUrl || 'https://placehold.co/600x400/png' }} 
        style={styles.petImage}
        resizeMode="cover"
      />
      
      {/* Badge de distancia si está disponible */}
      {formattedDistance && (
        <View style={styles.distanceBadge}>
          <MaterialIcons name="place" size={12} color={COLORS.primary} />
          <Text style={styles.distanceText}>{formattedDistance}</Text>
        </View>
      )}
      
      {/* Información de la mascota */}
      <View style={styles.petInfo}>
        <View style={styles.petNameContainer}>
          <View style={styles.nameAndTypeContainer}>
            <Text style={styles.petName}>{pet.name}</Text>
            
            {/* Tipo de adopción */}
            <View style={[styles.adoptionTypeBadge, isTransit ? styles.transitBadge : styles.permanentBadge]}>
              <Text style={[styles.adoptionTypeText, isTransit ? styles.transitText : styles.permanentText]}>
                {isTransit 
                  ? `Tránsito ${transitDaysText}` 
                  : 'Adopción permanente'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={onFavoriteToggle}
          >
            <MaterialIcons 
              name={isFavorite ? "favorite" : "favorite-border"} 
              size={24} 
              color={isFavorite ? COLORS.danger : COLORS.inactive} 
            />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.petBreed}>{pet.breed}</Text>
        
        <View style={styles.petDetailRow}>
          {pet.gender && (
            <View style={styles.petDetail}>
              <Text style={styles.petDetailText}>
                {pet.gender === 'male' ? '♂ Macho' : '♀ Hembra'}
              </Text>
            </View>
          )}
          
          {pet.age !== null && pet.age !== undefined && (
            <View style={styles.petDetail}>
              <Text style={styles.petDetailText}>{getAgeText(pet.age)}</Text>
            </View>
          )}
          
          {pet.size && (
            <View style={styles.petDetail}>
              <Text style={styles.petDetailText}>{pet.size}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  petCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  petImage: {
    width: '100%',
    height: hp(20), // Altura responsiva
    backgroundColor: COLORS.primaryLight, // Color de fondo mientras carga
  },
  distanceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  petInfo: {
    padding: 12,
  },
  petNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameAndTypeContainer: {
    flex: 1,
    flexDirection: 'column'
  },
  adoptionTypeBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  permanentBadge: {
    backgroundColor: COLORS.primaryLight,
  },
  transitBadge: {
    backgroundColor: COLORS.transitLight,
  },
  adoptionTypeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  permanentText: {
    color: COLORS.primary,
  },
  transitText: {
    color: COLORS.transit,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  favoriteButton: {
    padding: 4,
  },
  petBreed: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  petDetailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  petDetail: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  petDetailText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default PetCard;
