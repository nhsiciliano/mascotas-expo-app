import React, { useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

/**
 * Componente para mostrar el carrusel de fotos de la mascota con transiciones suaves
 */
const PhotoCarousel = ({ photos, currentIndex }) => {
  // Referencia para la animación de opacidad
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevIndexRef = useRef(currentIndex);
  
  // Efecto para animar la transición entre fotos
  useEffect(() => {
    // Solo animar si el índice cambió
    if (prevIndexRef.current !== currentIndex) {
      // Animar desvanecimiento
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 120,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true
        })
      ]).start();
      
      prevIndexRef.current = currentIndex;
    }
  }, [currentIndex, fadeAnim]);
  
  return (
    <View style={styles.photoContainer} nativeID="photoContainer">
      {photos && photos.length > 0 ? (
        <Animated.Image 
          source={{ uri: photos[currentIndex] }} 
          style={[styles.photo, { opacity: fadeAnim }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.photo, styles.placeholder]}>
          {/* Placeholder para cuando no hay imagen */}
        </View>
      )}
      
      {/* Indicadores de fotos */}
      {photos && photos.length > 1 && (
        <View style={styles.indicatorContainer}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width,
    height: 300,
  },
  placeholder: {
    backgroundColor: COLORS.primaryLight,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: COLORS.white,
    width: 20,
  },
});

export default PhotoCarousel;
