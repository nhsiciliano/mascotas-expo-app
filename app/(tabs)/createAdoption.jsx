import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform, KeyboardAvoidingView, TextInput } from 'react-native';

// Color adicional para los placeholders que no está en el archivo centralizado
const PLACEHOLDER_COLOR = '#666666';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
// Componentes personalizados
import HeaderCreateAdoption from '../../components/createAdoption/HeaderCreateAdoption';
import { COLORS } from '../../constants/colors';

// Componentes
import ImageSelector from '../../components/createAdoption/ImageSelector';
import LocationSelector from '../../components/createAdoption/LocationSelector';
import GenderSelector from '../../components/createAdoption/GenderSelector';
import BasicInfoForm from '../../components/createAdoption/BasicInfoForm';

// Hook personalizado
import { useCreateAdoption } from '../../hooks/useCreateAdoption';

// El objeto COLORS ahora se importa desde constants/colors.js

/**
 * Pantalla para crear una nueva publicación de mascota en adopción
 */
export default function CreateAdoption() {
  const router = useRouter();
  
  // Usar el hook personalizado para toda la lógica del formulario
  const {
    // Estados del formulario
    petName,
    setPetName,
    selectedType,
    setSelectedType,
    breed,
    setBreed,
    age,
    setAge,
    size,
    setSize,
    gender,
    setGender,
    description,
    setDescription,
    phone,
    setPhone,
    
    // Estados de imágenes
    images,
    uploadingImages,
    
    // Estados de ubicación
    location,
    locationName,
    gettingLocation,
    
    // Estado general
    isSubmitting,
    
    // Funciones
    getCurrentLocation,
    pickImage,
    takePhoto,
    removeImage,
    handleCreateAdoption,
    handleFocus
  } = useCreateAdoption();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Cabecera usando el componente reutilizable */}
      <HeaderCreateAdoption isSubmitting={isSubmitting} />
      
      {/* Contenido principal */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {/* Selector de imágenes - El primer componente en el original */}
          <ImageSelector
            images={images}
            uploadingImages={uploadingImages}
            pickImage={pickImage}
            takePhoto={takePhoto}
            removeImage={removeImage}
          />
          
          {/* Formulario de información básica con nombre, tipo, raza, edad/tamaño */}
          <BasicInfoForm
            petName={petName}
            setPetName={setPetName}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            breed={breed}
            setBreed={setBreed}
            age={age}
            setAge={setAge}
            size={size}
            setSize={setSize}
            handleFocus={handleFocus}
          />
          
          {/* Selector de género */}
          <GenderSelector
            gender={gender}
            setGender={setGender}
          />
          
          {/* Descripción - Separado como en el original */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.sectionSubtitle}>Cuéntanos sobre la personalidad y características de tu mascota</Text>
            
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Ej: Luna es una perrita muy cariñosa y juguetona. Le encanta pasear y es muy buena con los niños..."
                placeholderTextColor={PLACEHOLDER_COLOR}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                onFocus={() => handleFocus('description', 0)}
              />
            </View>
          </View>
          
          {/* Selector de ubicación */}
          <LocationSelector
            location={location}
            locationName={locationName}
            gettingLocation={gettingLocation}
            getCurrentLocation={getCurrentLocation}
          />
          
          {/* Información de contacto - Separado como en el original */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Contacto</Text>
            <Text style={styles.sectionSubtitle}>¿Cómo pueden contactarte los interesados?</Text>
            
            <Text style={styles.inputLabel}>Teléfono</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ej. +54 9 11 1234-5678"
                placeholderTextColor={PLACEHOLDER_COLOR}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                onFocus={() => handleFocus('phone', 0)}
              />
            </View>
          </View>
          
          {/* Botón de publicar */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleCreateAdoption}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Publicar en adopción</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Estilos para contenedores de sección
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
  
  // Estilos para inputs
  inputContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  
  // Estilos para el contenedor de TextArea 
  textAreaContainer: {
    marginBottom: 15,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 120,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
