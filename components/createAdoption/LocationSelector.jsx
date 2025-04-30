import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

// Color adicional para los placeholders que no está en el archivo centralizado
const PLACEHOLDER_COLOR = '#666666';

/**
 * Componente para seleccionar la ubicación de la mascota
 */
const LocationSelector = ({ location, locationName, gettingLocation, getCurrentLocation }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Ubicación</Text>
      <Text style={styles.sectionSubtitle}>¿Dónde se encuentra la mascota?</Text>
      
      {!location ? (
        <TouchableOpacity 
          style={styles.locationButton} 
          onPress={getCurrentLocation}
          disabled={gettingLocation}
        >
          <Ionicons name="location-outline" size={24} color={COLORS.primary} />
          <Text style={styles.locationButtonText}>
            {gettingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
          </Text>
          {gettingLocation && <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />}
        </TouchableOpacity>
      ) : (
        <View style={styles.locationContainer}>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.locationText}>{locationName || 'Ubicación seleccionada'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.changeLocationButton} 
            onPress={getCurrentLocation}
            disabled={gettingLocation}
          >
            <Text style={styles.changeLocationText}>Cambiar</Text>
            {gettingLocation && <ActivityIndicator size="small" color={COLORS.primary} style={styles.smallLoader} />}
          </TouchableOpacity>
        </View>
      )}
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
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 12,
  },
  locationButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: 8,
    color: COLORS.text,
    flex: 1,
  },
  changeLocationButton: {
    backgroundColor: COLORS.white,
    borderRadius: 6,
    padding: 6,
    paddingHorizontal: 10,
  },
  changeLocationText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default LocationSelector;
