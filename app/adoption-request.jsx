import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Colors
const COLORS = {
  primary: '#24B24C',
  primaryDark: '#1E9D41',
  primaryLight: '#E8F5EA',
  secondary: '#34CCA9',
  inactive: '#7E7E7E',
  white: '#FFFFFF',
  background: '#F9F9F9',
  shadow: '#000000',
  text: '#333333',
  textLight: '#777777',
  danger: '#e53935',
  warning: '#FFA000',
  success: '#43A047',
};

export default function AdoptionRequestScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [pet, setPet] = useState(null);
  const [requesterProfile, setRequesterProfile] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequestData();
  }, [params.id]);

  const fetchRequestData = async () => {
    try {
      setLoading(true);
      
      if (!params.id) {
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
        .eq('id', params.id)
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

  const getFormattedDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
    } catch (error) {
      return 'Fecha desconocida';
    }
  };

  const getStatusBadge = () => {
    if (!request) return { text: 'Desconocido', color: COLORS.inactive, bgColor: '#f5f5f5' };
    
    switch (request.status) {
      case 'pending':
        return { text: 'Pendiente', color: COLORS.warning, bgColor: '#FFF8E1' };
      case 'accepted':
        return { text: 'Aceptada', color: COLORS.success, bgColor: '#E8F5E9' };
      case 'rejected':
        return { text: 'Rechazada', color: COLORS.danger, bgColor: '#FFEBEE' };
      case 'adopted':
        return { text: 'Finalizada', color: '#3498DB', bgColor: '#D6EAF8' };
      default:
        return { text: 'Desconocido', color: COLORS.inactive, bgColor: '#f5f5f5' };
    }
  };

  const getPetImage = () => {
    if (!pet || !pet.pet_images) return null;
    const mainImage = pet.pet_images.find(img => img.is_main) || pet.pet_images[0];
    return mainImage ? mainImage.url : null;
  };

  const statusBadge = getStatusBadge();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitud de Adopción</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando solicitud...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Estado de la solicitud */}
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
            <Text style={[styles.statusText, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </View>

          {/* Fecha de solicitud */}
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.dateText}>
              Solicitado el {getFormattedDate(request?.created_at)}
            </Text>
          </View>
          
          {/* Información de la mascota */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mascota</Text>
            <View style={styles.petCard}>
              {getPetImage() ? (
                <Image 
                  source={{ uri: getPetImage() }} 
                  style={styles.petImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.petImage, styles.noImage]}>
                  <MaterialIcons name="pets" size={40} color={COLORS.inactive} />
                </View>
              )}
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{pet?.name || 'Mascota'}</Text>
                <Text style={styles.petBreed}>
                  {pet?.breed || 'Sin especificar'} • {pet?.gender === 'male' ? 'Macho' : 'Hembra'}
                </Text>
                <Text style={styles.petAge}>{pet?.age || 'Edad desconocida'}</Text>
              </View>
            </View>
          </View>

          {/* Información del solicitante */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Solicitante</Text>
            <View style={styles.requesterCard}>
              {requesterProfile?.avatar_url ? (
                <Image 
                  source={{ uri: requesterProfile.avatar_url }} 
                  style={styles.requesterImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.requesterImage, styles.noAvatar]}>
                  <FontAwesome name="user" size={40} color={COLORS.inactive} />
                </View>
              )}
              <View style={styles.requesterInfo}>
                <Text style={styles.requesterName}>{requesterProfile?.full_name || 'Usuario'}</Text>
                {requesterProfile?.location && (
                  <View style={styles.requesterDetail}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.requesterDetailText}>{requesterProfile.location}</Text>
                  </View>
                )}
                {requesterProfile?.phone && (
                  <View style={styles.requesterDetail}>
                    <Ionicons name="call-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.requesterDetailText}>{requesterProfile.phone}</Text>
                  </View>
                )}
              </View>
            </View>
            {requesterProfile?.description && (
              <Text style={styles.requesterDescription}>{requesterProfile.description}</Text>
            )}
          </View>

          {/* Mensaje de solicitud */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mensaje</Text>
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{request?.message || 'Sin mensaje'}</Text>
            </View>
          </View>

          {/* Botones de acción (solo visibles para el dueño y si está pendiente) */}
          {request?.status === 'pending' && request?.owner_id === user?.id && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleResponseRequest(false)}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <MaterialIcons name="close" size={20} color={COLORS.white} />
                    <Text style={styles.actionButtonText}>Rechazar</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleResponseRequest(true)}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <MaterialIcons name="check" size={20} color={COLORS.white} />
                    <Text style={styles.actionButtonText}>Aceptar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Botón de chat (visible si la solicitud fue aceptada o rechazada, pero NO si ya fue adoptada) */}
          {(request?.status === 'accepted' || request?.status === 'rejected') && (
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => router.push(`/chat?adoption_request=${request.id}`)}
            >
              <MaterialIcons name="chat" size={20} color={COLORS.white} />
              <Text style={styles.chatButtonText}>Ir al chat</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
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
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.textLight,
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
  petCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  noImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  petBreed: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  petAge: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  requesterCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  requesterImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  noAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requesterInfo: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  requesterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  requesterDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requesterDetailText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.textLight,
  },
  requesterDescription: {
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  messageBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  rejectButton: {
    backgroundColor: COLORS.danger,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  chatButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
