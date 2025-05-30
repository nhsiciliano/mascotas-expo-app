import { View, Text, ActivityIndicator, RefreshControl, FlatList, StyleSheet, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';  
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// Custom hooks
import { useHome } from '../../hooks/useHome';

// Componentes
import UserHeader from '../../components/home/UserHeader';
import SearchBar from '../../components/home/SearchBar';
import LocationBar from '../../components/home/LocationBar';
import AdoptionTypeFilter from '../../components/home/AdoptionTypeFilter';
import CategoryList from '../../components/home/CategoryList';
import PetsListHeader from '../../components/home/PetsListHeader';
import PetCard from '../../components/home/PetCard';

// Constantes
import { COLORS } from '../../constants/colors';

export default function HomeScreen() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false); // Estado para controlar la visibilidad de los filtros
  
  // Valores animados para la transición de los filtros
  const filterHeight = useRef(new Animated.Value(0)).current;
  const filterOpacity = useRef(new Animated.Value(0)).current;
  
  // Animación cuando cambia el estado de los filtros
  useEffect(() => {
    if (showFilters) {
      // Animar para mostrar los filtros
      Animated.parallel([
        Animated.timing(filterHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(filterOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false
        })
      ]).start();
    } else {
      // Animar para ocultar los filtros
      Animated.parallel([
        Animated.timing(filterHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false
        }),
        Animated.timing(filterOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false
        })
      ]).start();
    }
  }, [showFilters]);
  const {
    loading,
    filteredPets,
    errorMsg,
    selectedCategory,
    selectedAdoptionType,
    searchQuery,
    changeCategory,
    changeAdoptionType,
    updateSearchQuery,
    toggleFavorite: handleToggleFavorite,
    isFavorite,
    refreshData
  } = useHome();
  
  /**
   * Maneja la navegación a los detalles de una mascota
   * @param {string} petId - ID de la mascota
   */
  const handlePetPress = (petId) => {
    router.push({
      pathname: '/petDetail',
      params: { id: petId }
    });
  };
  
  /**
   * Maneja el cambio de ubicación
   */
  const handleChangeLocation = () => {
    // Aquí podrías implementar la funcionalidad para cambiar la ubicación
    // Por ejemplo, mostrar un modal con opciones de ubicación
    router.push('/change-location');
  };
  
  /**
   * Maneja el evento de presionar el botón de filtro
   */
  const handleFilterPress = () => {
    // Alternar la visibilidad de los filtros
    setShowFilters(!showFilters);
  };
  
  /**
   * Maneja el evento de presionar Ver Todos
   * Restablece todos los filtros para mostrar todas las mascotas disponibles
   */
  const handleSeeAllPress = () => {
    // Restablecer el tipo de adopción a 'all' (Todos)
    changeAdoptionType('all');
    
    // Restablecer la categoría a '1' (Todos)
    changeCategory('1');
    
    // Limpiar la búsqueda
    updateSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado con información del usuario */}
      <UserHeader 
        profile={profile} 
      />

      {/* Barra de búsqueda */}
      <SearchBar 
        searchQuery={searchQuery} 
        onSearch={updateSearchQuery} 
        onFilterPress={handleFilterPress}
        filtersActive={showFilters} 
      />

      {/* Barra de ubicación */}
      <LocationBar 
        locationName="Tu ubicación actual" 
        errorMsg={errorMsg} 
        onChangeLocation={handleChangeLocation} 
      />

      {/* Sección de filtros - con animación */}
      <Animated.View style={[
        styles.filtersContainer,
        {
          maxHeight: filterHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 300] // Altura máxima estimada, ajustar según contenido
          }),
          opacity: filterOpacity,
          overflow: 'hidden',
          marginBottom: filterHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 15]
          })
        }
      ]}>
        {/* Filtro por tipo de adopción */}
        <AdoptionTypeFilter
          selectedAdoptionType={selectedAdoptionType}
          onSelectAdoptionType={changeAdoptionType}
        />

        {/* Lista de categorías */}
        <CategoryList 
          selectedCategory={selectedCategory} 
          onSelectCategory={changeCategory} 
        />
      </Animated.View>

      {/* Encabezado de la lista de mascotas */}
      <PetsListHeader 
        title={searchQuery ? 'Resultados de búsqueda' : 'Mascotas disponibles'} 
        onSeeAllPress={handleSeeAllPress} 
      />

      {/* Lista de mascotas */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando mascotas...</Text>
        </View>
      ) : filteredPets.length > 0 ? (
        <FlatList
          data={filteredPets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PetCard
              pet={item}
              onPress={() => handlePetPress(item.id)}
              onFavoriteToggle={() => handleToggleFavorite(item.id)}
              isFavorite={isFavorite(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.petsList}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshData}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No se encontraron mascotas que coincidan con tu búsqueda.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filtersContainer: {
    paddingTop: 10,
    paddingBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  petsList: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  }
});
