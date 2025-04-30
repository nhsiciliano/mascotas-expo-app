import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

// Color adicional para los placeholders que no está en el archivo centralizado
const PLACEHOLDER_COLOR = '#666666';

/**
 * Componente para seleccionar imágenes de mascotas
 */
const ImageSelector = ({ images, uploadingImages, pickImage, takePhoto, removeImage }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Fotos</Text>
      <Text style={styles.sectionSubtitle}>Agrega hasta 5 fotos de tu mascota</Text>
      
      <View style={styles.photoGrid}>
        {/* Muestra las imágenes seleccionadas */}
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.petImage} />
            {uploadingImages ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color={COLORS.white} />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={22} color="#e53935" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {/* Muestra botones para agregar fotos si hay menos de 5 */}
        {images.length < 5 && (
          <View style={styles.addButtonsContainer}>
            <TouchableOpacity 
              style={styles.addPhotoButton}
              onPress={takePhoto}
            >
              <Ionicons name="camera-outline" size={28} color={COLORS.primary} />
              <Text style={styles.addPhotoText}>Cámara</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.addPhotoButton}
              onPress={pickImage}
            >
              <Ionicons name="images-outline" size={28} color={COLORS.primary} />
              <Text style={styles.addPhotoText}>Galería</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonsContainer: {
    flexDirection: 'row',
  },
  addPhotoButton: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  addPhotoText: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.primary,
  },
});

export default ImageSelector;
