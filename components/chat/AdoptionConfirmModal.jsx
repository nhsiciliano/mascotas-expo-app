import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * Modal de confirmación para acciones de adopción
 * @param {boolean} visible - Indica si el modal está visible
 * @param {string} action - Acción a confirmar ('concretar' o 'desestimar')
 * @param {function} onConfirm - Función para confirmar la acción
 * @param {function} onCancel - Función para cancelar la acción
 * @param {boolean} processing - Indica si se está procesando la acción
 */
const AdoptionConfirmModal = ({ visible, action, onConfirm, onCancel, processing }) => {
  const isConfirm = action === 'concretar';
  
  const title = isConfirm 
    ? '¿Concretar adopción?' 
    : '¿Desestimar adopción?';
    
  const message = isConfirm
    ? 'Al confirmar, estarás marcando esta adopción como completada. La mascota ya no aparecerá como disponible y se registrará como adoptada. ¿Estás seguro?'
    : 'Al desestimar, estarás rechazando esta solicitud. La mascota seguirá apareciendo como disponible para adopción. ¿Estás seguro?';
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={onCancel}
              disabled={processing}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.modalButton, 
                isConfirm ? styles.modalButtonConfirm : styles.modalButtonReject
              ]}
              onPress={onConfirm}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={[styles.modalButtonText, { color: COLORS.white }]}>
                  {isConfirm ? 'Confirmar' : 'Desestimar'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.text,
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 20,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    marginLeft: 10,
  },
  modalButtonCancel: {
    backgroundColor: '#F0F0F0',
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.primary,
  },
  modalButtonReject: {
    backgroundColor: COLORS.danger || '#e53935',
  },
  modalButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.text,
  },
});

export default AdoptionConfirmModal;
