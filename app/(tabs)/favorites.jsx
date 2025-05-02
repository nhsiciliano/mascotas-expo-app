import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl, SafeAreaView } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

// Componentes
import FavoritePetCard from '../../components/favorites/FavoritePetCard';
import EmptyFavorites from '../../components/favorites/EmptyFavorites';
import HeaderFavorites from '../../components/favorites/HeaderFavorites';

// Custom hooks
import { useFavorites } from '../../hooks/useFavorites';

// Constantes
import { COLORS } from '../../constants/colors';

export default function Favorites() {
  const router = useRouter();
  const { favorites, loading, refreshing, fetchFavorites, removeFavorite } = useFavorites();

  /**
   * Cargar favoritos cuando se monta el componente
   */
  useEffect(() => {
    fetchFavorites();
  }, []);

  /**
   * Maneja la eliminación de una mascota de favoritos
   * @param {string} petId - ID de la mascota a eliminar
   */
  const handleRemovePet = (petId) => {
    Alert.alert(
      'Eliminar de favoritos',
      '¿Estás seguro que deseas eliminar esta mascota de tus favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            await removeFavorite(petId);
            Alert.alert('Éxito', 'Mascota eliminada de tus favoritos');
          }
        }
      ]
    );
  };

  // Función para navegar a la pantalla de detalles de mascota
  const navigateToPetDetail = (petId) => {
    router.push(`/petDetail?id=${petId}`);
  };

  // Función para navegar a explorar mascotas
  const navigateToExplore = () => {
    router.push('/(tabs)');
  };
  
  /**
   * Maneja el evento de pull-to-refresh
   */
  const onRefresh = () => {
    fetchFavorites(true);
  };

  return (
    <SafeAreaView style={styles.container}>
        <HeaderFavorites favoriteCount={favorites.length} />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#24B24C" />
            <Text style={styles.loadingText}>Cargando favoritos...</Text>
          </View>
        ) : favorites.length > 0 ? (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <FavoritePetCard
                pet={item}
                onPress={() => navigateToPetDetail(item.id)}
                onRemoveFavorite={() => handleRemovePet(item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]} // Color verde para Android
                tintColor={COLORS.primary} // Color verde para iOS
                title={'Actualizando...'} // Texto en iOS
              />
            }
          />
        ) : (
          <EmptyFavorites onExplore={navigateToExplore} />
        )}
      </SafeAreaView>
  );
}

/*
 * Código de ayuda para implementar toggle de favoritos en la vista de detalles de mascota
 * Ejemplo de uso:
 * 
 * const toggleFavorite = async (petId) => {
 *   try {
 *     setLoading(true);
 *     if (!user) {
 *       router.push('/login');
 *       return;
 *     }
 *
 *     const isFav = await favoritesService.isFavorite(user.id, petId);
 *     
 *     if (isFav) {
 *       await favoritesService.removeFavorite(user.id, petId);
 *       setIsFavorite(false);
 *     } else {
 *       await favoritesService.addFavorite(user.id, petId);
 *       setIsFavorite(true);
 *     }
 *   } catch (error) {
 *     console.error('Error al gestionar favorito:', error.message);
 *     Alert.alert('Error', 'No se pudo actualizar tus favoritos.');
 *   } finally {
 *     setLoading(false);
 *   }
 * };
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(3),
    paddingHorizontal: wp(5),
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  countText: {
    fontSize: hp(1.8),
    color: COLORS.textLight,
    paddingHorizontal: wp(5),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: hp(1.8),
    color: COLORS.textLight,
  },
  listContent: {
    paddingBottom: hp(2),
    paddingHorizontal: wp(3),
  }
});
