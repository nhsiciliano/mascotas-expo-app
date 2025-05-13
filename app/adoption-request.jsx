import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

// Componentes modulares
import Header from '../components/adoption-request/Header';
import StatusBadge from '../components/adoption-request/StatusBadge';
import RequestDate from '../components/adoption-request/RequestDate';
import PetCard from '../components/adoption-request/PetCard';
import RequesterProfile from '../components/adoption-request/RequesterProfile';
import RequestMessage from '../components/adoption-request/RequestMessage';
import ActionButtons from '../components/adoption-request/ActionButtons';
import ChatButton from '../components/adoption-request/ChatButton';
import AdoptionManagementButtons from '../components/adoption-request/AdoptionManagementButtons';
import AdoptionSuccessMessage from '../components/adoption-request/AdoptionSuccessMessage';
import AdoptionCancelledMessage from '../components/adoption-request/AdoptionCancelledMessage';

// Custom hook y constantes
import useAdoptionRequest from '../hooks/useAdoptionRequest';
import { COLORS } from '../constants/colors';

/**
 * Pantalla para visualizar y gestionar una solicitud de adopción
 */
export default function AdoptionRequestScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  // Usar el hook personalizado para toda la lógica
  const {
    loading,
    processing,
    request, 
    pet,
    requesterProfile,
    handleResponseRequest,
    handleCompleteAdoption,
    handleCancelAdoption,
    getPetImage,
    getStatusBadge,
    showSuccessMessage,
    showCancelledMessage,
    handleCloseSuccessMessage,
    handleCloseCancelledMessage,
  } = useAdoptionRequest(params.id, user);

  // Determinar estado visual para el badge
  const statusBadge = getStatusBadge();

  // Renderizar componente
  return (
    <SafeAreaView style={styles.container}>
      {/* Header con botón de regreso */}
      <Header />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando solicitud...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Estado de la solicitud */}
          <StatusBadge statusInfo={statusBadge} />

          {/* Fecha de solicitud */}
          <RequestDate date={request?.created_at} />
          
          {/* Sección: Información de la mascota */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mascota</Text>
            <PetCard pet={pet} imageUrl={getPetImage()} />
          </View>

          {/* Sección: Información del solicitante */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Solicitante</Text>
            <RequesterProfile profile={requesterProfile} />
          </View>

          {/* Sección: Mensaje de solicitud */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mensaje</Text>
            <RequestMessage message={request?.message} />
          </View>

          {/* Botones de acción (solo visibles para el dueño y si está pendiente) */}
          {request?.status === 'pending' && request?.owner_id === user?.id && (
            <ActionButtons 
              onAccept={() => handleResponseRequest(true)}
              onReject={() => handleResponseRequest(false)}
              processing={processing}
            />
          )}

          {/* Botón de chat (visible si la solicitud fue aceptada) */}
          {request?.status === 'accepted' && (
            <>
              <ChatButton requestId={request.id} />
              
              {/* Botones de gestión de adopción (solo para el dueño) */}
              {request.owner_id === user?.id && (
                <AdoptionManagementButtons
                  onConcretar={handleCompleteAdoption}
                  onDesestimar={handleCancelAdoption}
                  processing={processing}
                />
              )}
            </>
          )}

          <View style={{ height: 30 }} />
          
          {/* Modales personalizados para éxito y cancelación */}
          <AdoptionSuccessMessage
            visible={showSuccessMessage}
            onClose={handleCloseSuccessMessage}
            petName={pet?.name}
            petImage={getPetImage()}
          />
          
          <AdoptionCancelledMessage
            visible={showCancelledMessage}
            onClose={handleCloseCancelledMessage}
            petName={pet?.name}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Estilos para el componente principal
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
});
