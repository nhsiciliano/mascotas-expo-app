import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Barra que muestra la ubicación actual
 */
const LocationBar = ({ locationName, errorMsg, onChangeLocation }) => {
  const displayText = errorMsg 
    ? errorMsg 
    : (locationName || 'Obteniendo ubicación...');

  return (
    <View style={styles.locationContainer}>
      <MaterialIcons name="place" size={20} color={COLORS.primary} />
      <Text 
        style={styles.locationText}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {displayText}
      </Text>
      <TouchableOpacity onPress={onChangeLocation}>
        <Text style={styles.changeLocationText}>Cambiar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  locationText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  changeLocationText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
});

export default LocationBar;
