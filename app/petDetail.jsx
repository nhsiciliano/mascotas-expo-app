import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Componentes
import PhotoCarousel from '../components/petDetail/PhotoCarousel';
import PetInfoCard from '../components/petDetail/PetInfoCard';
import PetCharacteristics from '../components/petDetail/PetCharacteristics';
import OwnerInfo from '../components/petDetail/OwnerInfo';
import AdoptButton from '../components/petDetail/AdoptButton';
import FavoriteButton from '../components/petDetail/FavoriteButton';

// Hooks
import { usePetDetail } from '../hooks/usePetDetail';

// Constantes
import { COLORS } from '../constants/colors';

export default function PetDetailScreen() {
  const params = useLocalSearchParams();
  const petId = params.id;
  
  const {
    petData,
    currentPhotoIndex,
    setCurrentPhotoIndex,
    isFavorite,
    loading,
    loadingInitial,
    loadingAdoptionRequest,
    toggleFavorite,
    requestAdoption
  } = usePetDetail(petId);

  /**
   * Maneja el contacto con el propietario de la mascota
   */
  const handleContactOwner = () => {
    // Implementación del contacto con el propietario
    // Podría abrir un chat o mostrar información de contacto
    console.log('Contactando al propietario...');
  };

  /**
   * Navega a la pantalla anterior
   */
  const handleGoBack = () => {
    router.back();
  };

  // Mostrar loading mientras se cargan los datos iniciales
  if (loadingInitial) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra de navegación */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleGoBack}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <FavoriteButton 
          isFavorite={isFavorite}
          onPress={toggleFavorite}
          loading={loading}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Carrusel de fotos */}
        <TouchableOpacity
          activeOpacity={0.7} // Hacerlo más reactivo
          delayPressIn={0} // Eliminar retraso al pulsar
          onPress={() => {
            if (petData?.photos?.length > 1) {
              const nextIndex = (currentPhotoIndex + 1) % petData.photos.length;
              setCurrentPhotoIndex(nextIndex);
            }
          }}
        >
          <PhotoCarousel
            photos={petData?.photos}
            currentIndex={currentPhotoIndex}
          />
        </TouchableOpacity>

        {/* Información básica de la mascota */}
        <PetInfoCard pet={petData} />

        {/* Características y descripción */}
        <PetCharacteristics
          characteristics={petData?.characteristics}
          description={petData?.description}
        />

        {/* Información del propietario */}
        <OwnerInfo
          ownerName={petData?.ownerName}
          ownerAvatar={petData?.ownerAvatar}
          onContactPress={handleContactOwner}
        />
      </ScrollView>

      {/* Botón de adopción */}
      <AdoptButton
        onPress={requestAdoption}
        loading={loadingAdoptionRequest}
      />
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
    backgroundColor: COLORS.background,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 70, // Ajustar la posición vertical para que esté dentro de la zona segura
    left: 15,
    right: 15,
    zIndex: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
