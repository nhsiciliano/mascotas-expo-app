import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '../../constants/colors';

/**
 * Componente de tarjeta para cada mascota favorita
 * @param {Object} pet - Datos de la mascota
 * @param {Function} onPress - Función para manejar el toque en la tarjeta
 * @param {Function} onRemoveFavorite - Función para eliminar de favoritos
 */
const FavoritePetCard = ({ pet, onPress, onRemoveFavorite }) => {
  return (
    <TouchableOpacity 
      style={styles.petCard} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: pet.image_url || 'https://via.placeholder.com/150x150?text=Pet' }} 
        style={styles.petImage} 
        resizeMode="cover"
      />
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petBreed}>{pet.breed}</Text>
        <View style={styles.petDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={hp(1.6)} color={COLORS.textLight} />
            <Text style={styles.detailText}>{pet.location || 'Desconocido'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="male-female-outline" size={hp(1.6)} color={COLORS.textLight} />
            <Text style={styles.detailText}>{pet.gender === 'male' ? 'Macho' : 'Hembra' || 'No especificado'}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.favoriteButton} 
        onPress={onRemoveFavorite}
      >
        <AntDesign name="heart" size={hp(2.5)} color={COLORS.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  petCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginBottom: hp(2),
    padding: wp(3),
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  petImage: {
    width: hp(10),
    height: hp(10),
    borderRadius: 10,
  },
  petInfo: {
    flex: 1,
    marginLeft: wp(3),
    justifyContent: 'center',
  },
  petName: {
    fontSize: hp(2),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  petBreed: {
    fontSize: hp(1.6),
    color: COLORS.textLight,
    marginBottom: 5,
  },
  petDetails: {
    flexDirection: 'row',
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(3),
  },
  detailText: {
    fontSize: hp(1.4),
    color: COLORS.textLight,
    marginLeft: 3,
  },
  favoriteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(2),
  },
});

export default FavoritePetCard;
