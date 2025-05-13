import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

// Componentes personalizados
import AdoptionSuccessMessage from '../components/adoption-request/AdoptionSuccessMessage';
import AdoptionCancelledMessage from '../components/adoption-request/AdoptionCancelledMessage';

/**
 * Hook personalizado para manejar la lógica de solicitudes de adopción
 * @param {string} requestId - ID de la solicitud de adopción
 * @param {object} user - Usuario actual autenticado
 */
export default function useAdoptionRequest(requestId, user) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [request, setRequest] = useState(null);
  const [pet, setPet] = useState(null);
  const [requesterProfile, setRequesterProfile] = useState(null);
  
  // Estados para los modales personalizados
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCancelledMessage, setShowCancelledMessage] = useState(false);

  // Cargar datos de la solicitud al iniciar
  useEffect(() => {
    if (requestId) {
      fetchRequestData();
    }
  }, [requestId, user]);

  /**
   * Obtiene todos los datos relacionados con la solicitud de adopción
   */
  const fetchRequestData = async () => {
    try {
      setLoading(true);

      if (!requestId) {
        Alert.alert('Error', 'No se pudo identificar la solicitud');
        router.back();
        return;
      }

      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para ver esta solicitud');
        router.push('/welcome');
        return;
      }

      // Obtener datos de la solicitud
      const { data: requestData, error: requestError } = await supabase
        .from('adoption_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) {
        if (requestError.code === '42P01') {
          Alert.alert('Error', 'La funcionalidad de solicitudes de adopción no está configurada');
          router.back();
          return;
        }
        throw requestError;
      }

      // Verificar permisos (solo el dueño de la mascota o el solicitante pueden ver la solicitud)
      if (requestData.owner_id !== user.id && requestData.requester_id !== user.id) {
        Alert.alert('Error', 'No tienes permiso para ver esta solicitud');
        router.back();
        return;
      }

      setRequest(requestData);

      // Obtener datos de la mascota
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select(`
          id,
          name,
          type,
          breed,
          gender,
          age,
          description,
          user_id,
          pet_images (url, is_main)
        `)
        .eq('id', requestData.pet_id)
        .single();

      if (petError) throw petError;
      setPet(petData);

      // Obtener datos del perfil del solicitante
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone, location, description')
        .eq('id', requestData.requester_id)
        .single();

      if (profileError) throw profileError;
      setRequesterProfile(profileData);

    } catch (error) {
      console.error('Error al obtener datos de la solicitud:', error.message);
      Alert.alert('Error', 'No se pudieron cargar los datos de la solicitud: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la respuesta a una solicitud (aceptar/rechazar)
   * @param {boolean} accept - Indica si la solicitud es aceptada (true) o rechazada (false)
   */
  const handleResponseRequest = async (accept) => {
    try {
      if (!request || !user) return;

      // Solo el dueño puede aceptar/rechazar
      if (request.owner_id !== user.id) {
        Alert.alert('Error', 'Solo el dueño de la mascota puede responder a esta solicitud');
        return;
      }

      // No se puede responder si ya fue aceptada o rechazada
      if (request.status !== 'pending') {
        Alert.alert('Información', 'Esta solicitud ya ha sido ' + 
          (request.status === 'accepted' ? 'aceptada' : 'rechazada'));
        return;
      }

      setProcessing(true);

      // Actualizar estado de la solicitud
      const newStatus = accept ? 'accepted' : 'rejected';
      const { error: updateError } = await supabase
        .from('adoption_requests')
        .update({ status: newStatus })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Enviar notificación al solicitante
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: request.requester_id,
          type: accept ? 'adoption_accepted' : 'adoption_rejected',
          title: accept ? 'Solicitud de adopción aceptada' : 'Solicitud de adopción rechazada',
          message: accept 
            ? `Tu solicitud para adoptar a ${pet.name} ha sido aceptada. Ponte en contacto con el dueño.` 
            : `Tu solicitud para adoptar a ${pet.name} ha sido rechazada.`,
          data: {
            pet_id: pet.id,
            pet_name: pet.name,
            request_id: request.id
          },
          action_url: accept ? `/chat?adoption_request=${request.id}` : null
        });

      if (notificationError) {
        console.error('Error al enviar notificación:', notificationError);
        // Continuamos aunque haya un error en la notificación
      }

      // Si se acepta, crear un chat entre el dueño y el solicitante
      if (accept) {
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .insert({
            user1_id: request.owner_id,
            user2_id: request.requester_id,
            adoption_request_id: request.id
          })
          .select();

        if (chatError) {
          console.error('Error al crear chat:', chatError);
          // Continuamos aunque haya un error en la creación del chat
        } else {
          // Enviar primer mensaje automático
          const { error: messageError } = await supabase
            .from('chat_messages')
            .insert({
              chat_id: chatData[0].id,
              user_id: request.owner_id,
              message: `¡Hola! Tu solicitud para adoptar a ${pet.name} ha sido aceptada. Podemos coordinar la adopción a través de este chat.`
            });

          if (messageError) {
            console.error('Error al enviar mensaje inicial:', messageError);
          }
        }
      }

      // Actualizar estado local
      setRequest({
        ...request,
        status: newStatus
      });

      Alert.alert(
        accept ? 'Solicitud aceptada' : 'Solicitud rechazada',
        accept 
          ? `Has aceptado la solicitud para adoptar a ${pet.name}. Se ha creado un chat para que puedan comunicarse.` 
          : `Has rechazado la solicitud para adoptar a ${pet.name}.`,
        [
          { 
            text: accept ? 'Ir al chat' : 'Entendido', 
            onPress: () => {
              if (accept) {
                router.push(`/chat?adoption_request=${request.id}`);
              }
            } 
          }
        ]
      );

    } catch (error) {
      console.error('Error al procesar solicitud:', error.message);
      Alert.alert('Error', 'No se pudo procesar la solicitud: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Obtiene la imagen principal de la mascota o la primera disponible
   */
  const getPetImage = () => {
    if (!pet || !pet.pet_images) return null;
    const mainImage = pet.pet_images.find(img => img.is_main) || pet.pet_images[0];
    return mainImage ? mainImage.url : null;
  };

  /**
   * Determina el estilo y texto del badge de estado
   */
  const getStatusBadge = () => {
    if (!request) return { text: 'Desconocido', color: '#9E9E9E', bgColor: '#f5f5f5' };
    
    switch (request.status) {
      case 'pending':
        return { text: 'Pendiente', color: '#FF9800', bgColor: '#FFF8E1' };
      case 'accepted':
        return { text: 'Aceptada', color: '#4CAF50', bgColor: '#E8F5E9' };
      case 'rejected':
        return { text: 'Rechazada', color: '#F44336', bgColor: '#FFEBEE' };
      case 'adopted':
        return { text: 'Finalizada', color: '#3498DB', bgColor: '#D6EAF8' };
      default:
        return { text: 'Desconocido', color: '#9E9E9E', bgColor: '#f5f5f5' };
    }
  };
  
  /**
   * Muestra confirmación y maneja la concretación de una adopción
   */
  const handleCompleteAdoption = async () => {
    try {
      if (!request || !user || !pet) return;
      
      // Verificar que es el dueño de la mascota
      if (request.owner_id !== user.id) {
        Alert.alert('Error', 'Solo el dueño de la mascota puede concretar la adopción');
        return;
      }
      
      // Verificar que la solicitud está aceptada
      if (request.status !== 'accepted') {
        Alert.alert('Información', 'Solo se pueden concretar solicitudes que estén en estado aceptado');
        return;
      }
      
      // El mensaje de confirmación ahora lo maneja AdoptionManagementButtons
      try {
              setProcessing(true);
              
              try {
                // 1. Actualizar estado de la solicitud
                const { error: requestError } = await supabase
                  .from('adoption_requests')
                  .update({
                    status: 'adopted',
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', request.id);
                
                if (requestError) throw requestError;
                
                // 2. Actualizar estado de la mascota
                const { error: petError } = await supabase
                  .from('pets')
                  .update({
                    status: 'adoptada',
                    adopted_by: request.requester_id
                  })
                  .eq('id', pet.id);
                
                if (petError) {
                  // Si falla por campos que no existen, intentamos solo con status
                  const { error: retryPetError } = await supabase
                    .from('pets')
                    .update({ status: 'adoptada' })
                    .eq('id', pet.id);
                    
                  if (retryPetError) throw retryPetError;
                }
                
                // 3. Registrar la adopción
                const adoptionData = {
                  pet_id: pet.id,
                  owner_id: request.owner_id,
                  adopter_id: request.requester_id,
                  user_id: user.id,
                  created_at: new Date().toISOString(),
                  status: 'completada'
                };
                
                const { error: adoptionError } = await supabase
                  .from('adoptions')
                  .insert(adoptionData);
                  
                // 4. Crear notificación para el adoptante
                await supabase
                  .from('notifications')
                  .insert({
                    user_id: request.requester_id,
                    type: 'adoption_completed',
                    title: '¡Adopción finalizada!',
                    message: `Tu proceso de adopción para ${pet.name} ha sido completado exitosamente. ¡Felicidades por tu nueva mascota!`,
                    data: {
                      pet_id: pet.id,
                      pet_name: pet.name,
                      request_id: request.id,
                      status: 'adopted'
                    },
                    created_at: new Date().toISOString(),
                    read: false
                  });
                  
                // 5. Enviar mensaje automático al chat
                const { data: chatData } = await supabase
                  .from('chats')
                  .select('id')
                  .eq('adoption_request_id', request.id)
                  .single();
                  
                if (chatData) {
                  await supabase
                    .from('chat_messages')
                    .insert({
                      chat_id: chatData.id,
                      user_id: user.id,
                      message: '¡Adopción concretada exitosamente! 🎉 La mascota ha sido marcada como adoptada. Este chat ya no estará disponible.',
                      created_at: new Date().toISOString(),
                      read: false,
                      system_message: true
                    });
                }
                
                // Actualizar estado local
                setRequest({
                  ...request,
                  status: 'adopted'
                });
                
                // Mostrar mensaje personalizado de éxito
                setShowSuccessMessage(true);
                
                // Detener el procesamiento para que se pueda cerrar el modal de confirmación
                // Esto es importante para que el modal no se cierre automáticamente
                setProcessing(false);
                return; // Salimos para evitar que se ejecute el setProcessing(false) de abajo
                
              } catch (error) {
                console.error('Error al concretar adopción:', error.message);
                Alert.alert('Error', 'No se pudo concretar la adopción: ' + error.message);
              } finally {
                setProcessing(false);
              }
      } catch (error) {
        console.error('Error al concretar adopción:', error.message);
        Alert.alert('Error', 'No se pudo concretar la adopción: ' + error.message);
      }
      
    } catch (error) {
      console.error('Error al preparar concretación de adopción:', error.message);
      Alert.alert('Error', 'Ocurrió un error inesperado: ' + error.message);
    }
  };

  /**
   * Muestra confirmación y maneja la desestimación de una adopción
   */
  const handleCancelAdoption = async () => {
    try {
      if (!request || !user || !pet) return;
      
      // Verificar que es el dueño de la mascota
      if (request.owner_id !== user.id) {
        Alert.alert('Error', 'Solo el dueño de la mascota puede desestimar la adopción');
        return;
      }
      
      // Verificar que la solicitud está aceptada
      if (request.status !== 'accepted') {
        Alert.alert('Información', 'Solo se pueden desestimar solicitudes que estén en estado aceptado');
        return;
      }
      
      // El mensaje de confirmación ahora lo maneja AdoptionManagementButtons
      try {
              setProcessing(true);
              
              try {
                // 1. Actualizar estado de la solicitud
                const { error: requestError } = await supabase
                  .from('adoption_requests')
                  .update({
                    status: 'rejected',
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', request.id);
                
                if (requestError) throw requestError;
                
                // 2. Crear notificación para el adoptante
                await supabase
                  .from('notifications')
                  .insert({
                    user_id: request.requester_id,
                    type: 'adoption_rejected',
                    title: 'Proceso de adopción cancelado',
                    message: `El proceso de adopción para ${pet.name} ha sido cancelado por el propietario.`,
                    data: {
                      pet_id: pet.id,
                      pet_name: pet.name,
                      request_id: request.id
                    },
                    created_at: new Date().toISOString(),
                    read: false
                  });
                  
                // 3. Enviar mensaje automático al chat
                const { data: chatData } = await supabase
                  .from('chats')
                  .select('id')
                  .eq('adoption_request_id', request.id)
                  .single();
                  
                if (chatData) {
                  await supabase
                    .from('chat_messages')
                    .insert({
                      chat_id: chatData.id,
                      user_id: user.id,
                      message: 'Proceso de adopción desestimado. La mascota sigue disponible para adopción.',
                      created_at: new Date().toISOString(),
                      read: false,
                      system_message: true
                    });
                }
                
                // Actualizar estado local
                setRequest({
                  ...request,
                  status: 'rejected'
                });
                
                // Mostrar mensaje personalizado de cancelación
                setShowCancelledMessage(true);
                
                // Detener el procesamiento para que se pueda cerrar el modal de confirmación
                // Esto es importante para que el modal no se cierre automáticamente
                setProcessing(false);
                return; // Salimos para evitar que se ejecute el setProcessing(false) de abajo
                
              } catch (error) {
                console.error('Error al desestimar adopción:', error.message);
                Alert.alert('Error', 'No se pudo desestimar la adopción: ' + error.message);
              } finally {
                setProcessing(false);
              }
      } catch (error) {
        console.error('Error al desestimar adopción:', error.message);
        Alert.alert('Error', 'No se pudo desestimar la adopción: ' + error.message);
      }
      
    } catch (error) {
      console.error('Error al preparar desestimación de adopción:', error.message);
      Alert.alert('Error', 'Ocurrió un error inesperado: ' + error.message);
    }
  };
  
  // Exponer todas las funcionalidades y estados necesarios
  // Funciones para controlar los modales personalizados
  const handleCloseSuccessMessage = () => {
    // Navegar al inicio después de cerrar el modal
    router.push('/(tabs)/home');
    // Cerramos el modal después de la navegación
    setTimeout(() => setShowSuccessMessage(false), 500);
  };
  
  const handleCloseCancelledMessage = () => {
    setShowCancelledMessage(false);
  };
  
  return {
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
    refreshData: fetchRequestData
  };
}
