import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const isOwner = params.isOwner === 'true'; // Verificar si el usuario es el propietario
  const insets = useSafeAreaInsets(); // Obtener los insets para conocer la altura del status bar
  
  const {
    petData,
    currentPhotoIndex,
    setCurrentPhotoIndex,
    isFavorite,
    loading,
    loadingInitial,
    loadingAdoptionRequest,
    isAvailable,
    hasRequestedAdoption,
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
    <View style={styles.container}>
      {/* Usar StatusBar transparente para que se vea la imagen detrás */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Barra de navegación flotante */}
      <View style={[styles.navBar, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleGoBack}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <FavoriteButton 
          isFavorite={isFavorite}
          onPress={toggleFavorite}
          loading={loading}
        />
      </View>

      {/* Contenido principal en scroll con imagen incorporada */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        
        {/* Carrusel de fotos que cubre toda la parte superior */}
        <TouchableOpacity
          activeOpacity={0.7}
          delayPressIn={0}
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
            fullscreen={true}
          />
        </TouchableOpacity>

        {/* Contenedor en forma de tarjeta para el resto del contenido */}
        <View style={styles.contentCard}>
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
          
          {/* Espacio adicional al final */}
          <View style={{ height: 70 }} />
        </View>
      </ScrollView>

      {/* Botón de adopción - solo visible si la mascota está disponible y el usuario NO es el propietario */}
      {isAvailable && !isOwner && (
        <View style={styles.adoptButtonContainer}>
          <AdoptButton
            onPress={requestAdoption}
            loading={loadingAdoptionRequest}
            alreadyRequested={hasRequestedAdoption}
            pet={petData} // Pasamos los datos de la mascota para saber si es tránsito o permanente
          />
        </View>
      )}
    </View>
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
    left: 15,
    right: 15,
    zIndex: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',  // Fondo semi-transparente para contraste
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0, // Sin padding horizontal para que la imagen ocupe todo el ancho
  },
  contentCard: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20, // Superposición ligera sobre la imagen para efecto de tarjeta
    paddingHorizontal: 15,
    paddingTop: 20,
    // Efecto de sombra sutil en la tarjeta
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  adoptButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  }
});
