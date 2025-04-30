import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Modal para mostrar cuando se intenta acceder a un chat de una adopción ya finalizada
 * @param {object} content - Contenido del modal (visible, title, message, petImage, petName, buttonText)
 */
const FinishedAdoptionModal = ({ content }) => {
  if (!content || !content.visible) return null;
  
  return (
    <Modal
      visible={content.visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalIconContainer}>
            <MaterialIcons name="pets" size={40} color={COLORS.primary} />
          </View>
          
          <Text style={styles.modalTitle}>{content.title}</Text>
          
          {content.petImage && (
            <View style={styles.petImageContainer}>
              <Image 
                source={{ uri: content.petImage }} 
                style={styles.petImage}
                resizeMode="cover"
              />
              <Text style={styles.petName}>{content.petName}</Text>
            </View>
          )}
          
          <Text style={styles.modalMessage}>{content.message}</Text>
          
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={content.onButtonPress}
          >
            <Text style={styles.modalButtonText}>
              {content.buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  petImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalMessage: {
    fontSize: 15,
    textAlign: 'center',
    color: COLORS.textLight,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  modalButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FinishedAdoptionModal;
