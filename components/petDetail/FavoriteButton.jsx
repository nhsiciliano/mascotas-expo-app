import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Botón para marcar/desmarcar como favorito
 */
const FavoriteButton = ({ isFavorite, onPress, loading }) => {
  return (
    <TouchableOpacity
      style={[
        styles.favoriteButton,
        isFavorite ? styles.favoriteFilled : styles.favoriteOutline
      ]}
      onPress={onPress}
      disabled={loading}
    >
      <MaterialIcons
        name={isFavorite ? 'favorite' : 'favorite-border'}
        size={22}
        color={isFavorite ? COLORS.white : COLORS.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  favoriteOutline: {
    backgroundColor: COLORS.white,
  },
  favoriteFilled: {
    backgroundColor: COLORS.primary,
  },
});

export default FavoriteButton;
