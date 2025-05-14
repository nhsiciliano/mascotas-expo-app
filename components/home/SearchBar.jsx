import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Barra de búsqueda con botón de filtro
 * @param {string} searchQuery - Texto de búsqueda
 * @param {Function} onSearch - Función para actualizar el texto de búsqueda
 * @param {Function} onFilterPress - Función para mostrar/ocultar filtros
 * @param {boolean} filtersActive - Indica si los filtros están activos
 */
const SearchBar = ({ searchQuery, onSearch, onFilterPress, filtersActive = false }) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons 
          name="search-outline" 
          size={20} 
          color={COLORS.inactive} 
          style={styles.searchIcon} 
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar mascotas..."
          placeholderTextColor={COLORS.inactive}
          value={searchQuery}
          onChangeText={onSearch}
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.filterButton, filtersActive && styles.filterButtonActive]} 
        onPress={onFilterPress}
      >
        <MaterialIcons name="tune" size={24} color={COLORS.white} />
        {filtersActive && (
          <View style={styles.filterActiveDot} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    height: 36,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginRight: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: COLORS.text,
  },
  filterButton: {
    width: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 6,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primaryDark,
  },
  filterActiveDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
});

export default SearchBar;
