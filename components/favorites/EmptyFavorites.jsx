import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '../../constants/colors';

/**
 * Componente para mostrar cuando no hay favoritos
 * @param {Function} onExplore - Función para navegar a explorar mascotas
 */
const EmptyFavorites = ({ onExplore }) => {
  return (
    <View style={styles.emptyContainer}>
      <AntDesign name="hearto" size={hp(10)} color={COLORS.primaryDark} />
      <Text style={styles.emptyTitle}>No tienes ninguna mascota en favoritos</Text>
      <Text style={styles.emptySubtitle}>Comienza a guardar tus posibles adopciones</Text>
      <TouchableOpacity style={styles.exploreButton} onPress={onExplore}>
        <Text style={styles.exploreText}>Explorar mascotas</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(10),
  },
  emptyTitle: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: hp(3),
    marginBottom: hp(1),
  },
  emptySubtitle: {
    fontSize: hp(1.8),
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: hp(3),
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: 8,
  },
  exploreText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: hp(1.8),
  },
});

export default EmptyFavorites;
