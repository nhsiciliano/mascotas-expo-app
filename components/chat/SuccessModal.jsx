import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Modal de éxito para mostrar después de completar una adopción
 * @param {object} content - Contenido del modal (title, message, petImage, buttonText)
 * @param {function} onButtonPress - Función para manejar el botón
 */
const SuccessModal = ({ content, onButtonPress }) => {
  if (!content || !content.visible) return null;
  
  return (
    <Modal
      visible={content.visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.successModalContainer}>
          <View style={styles.successModalHeader}>
            <Text style={styles.successModalTitle}>{content.title}</Text>
          </View>
          
          {content.petImage && (
            <View style={styles.petImageContainer}>
              <Image 
                source={{ uri: content.petImage }} 
                style={styles.petImage}
                resizeMode="cover"
              />
            </View>
          )}
          
          <Text style={styles.successModalMessage}>
            {content.message}
          </Text>
          
          <TouchableOpacity 
            style={styles.successModalButton}
            onPress={() => {
              if (typeof content.onButtonPress === 'function') {
                content.onButtonPress();
              } else if (typeof onButtonPress === 'function') {
                onButtonPress();
              }
            }}
          >
            <Ionicons name="home-outline" size={18} color={COLORS.white} />
            <Text style={styles.successModalButtonText}>
              {content.buttonText || 'Volver al inicio'}
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
  successModalContainer: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successModalHeader: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  successModalTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  petImageContainer: {
    width: '100%',
    height: 180,
    marginBottom: 16,
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  successModalMessage: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 24,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  successModalButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successModalButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default SuccessModal;
