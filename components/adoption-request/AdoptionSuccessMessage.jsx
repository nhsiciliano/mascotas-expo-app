import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Modal moderno y minimalista para mostrar mensaje de adopción exitosa
 * 
 * @param {boolean} visible - Estado de visibilidad del modal
 * @param {function} onClose - Función para cerrar el modal y navegar
 * @param {string} petName - Nombre de la mascota adoptada
 * @param {string} petImage - URL de la imagen de la mascota (opcional)
 */
export default function AdoptionSuccessMessage({ visible, onClose, petName, petImage }) {
  // Estado para controlar el tiempo mínimo que debe mostrarse el modal
  const [canClose, setCanClose] = useState(false);
  
  // Cuando el modal se hace visible, iniciar un temporizador para permitir el cierre
  useEffect(() => {
    if (visible) {
      setCanClose(false);
      const timer = setTimeout(() => {
        setCanClose(true);
      }, 5000); // Tiempo mínimo de 5 segundos
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  // Función para manejar el cierre controlado
  const handleClose = () => {
    if (canClose) {
      onClose();
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      // Deshabilitamos el cierre por toque fuera para garantizar el tiempo mínimo
      // El usuario debe usar el botón explícito para cerrar
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>

          
          <Text style={styles.title}>¡Adopción Exitosa!</Text>
          
          <Text style={styles.message}>
            La adopción de <Text style={styles.highlight}>{petName}</Text> ha sido completada exitosamente. 
            ¡Has cambiado una vida para siempre!
          </Text>
          
          {petImage && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: petImage }} style={styles.petImage} />
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.button, !canClose && styles.buttonDisabled]} 
            onPress={handleClose}
            disabled={!canClose}
          >
            <Text style={styles.buttonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  iconContainer: {
    marginBottom: 16,
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  highlight: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  imageContainer: {
    width: '80%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  petImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  }
});
