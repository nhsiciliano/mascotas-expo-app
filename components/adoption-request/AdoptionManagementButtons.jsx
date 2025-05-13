import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente para mostrar los botones de gestión de adopción (concretar o desestimar)
 * Solo visible para el dueño de la mascota cuando la solicitud está aceptada
 * 
 * @param {function} onConcretar - Función para manejar la acción de concretar adopción
 * @param {function} onDesestimar - Función para manejar la acción de desestimar adopción
 * @param {boolean} processing - Indicador de procesamiento en curso
 */
export default function AdoptionManagementButtons({ onConcretar, onDesestimar, processing }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState(null); // 'concretar' o 'desestimar'
  
  const handleShowModal = (action) => {
    setCurrentAction(action);
    setModalVisible(true);
  };
  
  const handleConfirm = () => {
    // Cerramos este modal antes de ejecutar la acción
    // para evitar conflicto entre múltiples modales
    setModalVisible(false);
    
    // Pequeño retraso para permitir que el modal se cierre primero
    setTimeout(() => {
      if (currentAction === 'concretar') {
        onConcretar();
      } else {
        onDesestimar();
      }
    }, 300);
  };
  
  const handleCancel = () => {
    setModalVisible(false);
  };
  
  const isConfirm = currentAction === 'concretar';
    
  const title = isConfirm 
    ? '¿Concretar adopción?' 
    : '¿Desestimar adopción?';
    
  const message = isConfirm
    ? 'Al confirmar, estarás marcando esta adopción como completada. La mascota ya no aparecerá como disponible y se registrará como adoptada. ¿Estás seguro?'
    : 'Al desestimar, estarás rechazando esta solicitud. La mascota seguirá apareciendo como disponible para adopción. ¿Estás seguro?';
  
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Gestionar adopción</Text>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonDesestimar]}
          onPress={() => handleShowModal('desestimar')}
          disabled={processing}
        >
          {processing && currentAction === 'desestimar' ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <MaterialIcons name="close" size={18} color={COLORS.white} />
              <Text style={styles.buttonText}>Desestimar adopción</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.buttonConcretar]}
          onPress={() => handleShowModal('concretar')}
          disabled={processing}
        >
          {processing && currentAction === 'concretar' ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <MaterialIcons name="check" size={18} color={COLORS.white} />
              <Text style={styles.buttonText}>Concretar adopción</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Modal de confirmación */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalMessage}>{message}</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={handleCancel}
                disabled={processing}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  isConfirm ? styles.modalButtonConfirm : styles.modalButtonReject
                ]}
                onPress={handleConfirm}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: COLORS.shadow || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 52,
  },
  buttonConcretar: {
    backgroundColor: COLORS.primary,
  },
  buttonDesestimar: {
    backgroundColor: COLORS.danger || '#e53935',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  // Estilos para el modal de confirmación
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.shadow || '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    marginBottom: 24,
    color: COLORS.textLight,
    lineHeight: 22,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
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
    fontWeight: '600',
    fontSize: 15,
    color: COLORS.text,
  },
});
