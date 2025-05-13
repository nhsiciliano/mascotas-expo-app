import { View, Text, ActivityIndicator, RefreshControl, FlatList, StyleSheet } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// Custom hooks
import { useHome } from '../../hooks/useHome';

// Componentes
import UserHeader from '../../components/home/UserHeader';
import SearchBar from '../../components/home/SearchBar';
import LocationBar from '../../components/home/LocationBar';
import CategoryList from '../../components/home/CategoryList';
import PetsListHeader from '../../components/home/PetsListHeader';
import PetCard from '../../components/home/PetCard';

// Constantes
import { COLORS } from '../../constants/colors';

export default function HomeScreen() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const {
    loading,
    filteredPets,
    errorMsg,
    selectedCategory,
    searchQuery,
    changeCategory,
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
    // Aquí podrías implementar la funcionalidad para mostrar filtros avanzados
    // Por ejemplo, mostrar un modal con más opciones de filtrado
    console.log('Mostrar filtros avanzados');
  };
  
  /**
   * Maneja el evento de presionar Ver Todos
   */
  const handleSeeAllPress = () => {
    router.push('/explore');
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
      />

      {/* Barra de ubicación */}
      <LocationBar 
        locationName="Tu ubicación actual" 
        errorMsg={errorMsg} 
        onChangeLocation={handleChangeLocation} 
      />

      {/* Lista de categorías */}
      <CategoryList 
        selectedCategory={selectedCategory} 
        onSelectCategory={changeCategory} 
      />

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
