import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, AppState } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { sendChatNotification } from '../utils/notificationService';

// Configuraciones para Supabase Realtime
const REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = 'postgres_changes';

/**
 * Hook personalizado para manejar la lógica de chat
 * @param {object} user - Usuario autenticado
 * @param {object} params - Parámetros de la ruta (id, adoption_request)
 */
export default function useChat(user, params) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [adoptionRequest, setAdoptionRequest] = useState(null);
  const [pet, setPet] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Estados de adopción movidos a useAdoptionRequest

  const messageSubscription = useRef(null);
  const isInitialMount = useRef(true);
  const requestIdRef = useRef(params.adoption_request || params.id);
  const flatListRef = useRef(null);

  /**
   * Función principal para cargar datos del chat
   */
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para acceder al chat');
        router.push('/welcome');
        return;
      }

      // Si tenemos un ID de solicitud de adopción
      if (params.adoption_request) {
        await loadChatByAdoptionRequest(params.adoption_request);
      } 
      // Si tenemos un ID de chat directo
      else if (params.id) {
        await loadChatById(params.id);
      } else {
        Alert.alert('Error', 'No se pudo identificar el chat');
        router.back();
        return;
      }
    } catch (error) {
      console.error('Error al cargar el chat:', error.message);
      Alert.alert('Error', 'No se pudo cargar el chat: ' + error.message);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga un chat basado en el ID de solicitud de adopción
   * @param {string} requestId - ID de la solicitud de adopción
   */
  const loadChatByAdoptionRequest = async (requestId) => {
    // Verificar si la solicitud existe y está aceptada
    const { data: requestData, error: requestError } = await supabase
      .from('adoption_requests')
      .select(`
        *,
        pets:pet_id (
          id, 
          name,
          type,
          breed,
          gender,
          age,
          pet_images (url, is_main)
        )
      `)
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

    // Verificar permisos (solo el dueño o el solicitante pueden acceder)
    if (requestData.owner_id !== user.id && requestData.requester_id !== user.id) {
      Alert.alert('Error', 'No tienes permiso para acceder a este chat');
      router.back();
      return;
    }

    // Verificar si la solicitud está aceptada y no ha sido finalizada
    if (requestData.status === 'adopted') {
      // Obtener la imagen de la mascota para mostrarla en el modal
      const petImage = extractPetImage(requestData.pets);
      
      // Mostrar modal personalizado en lugar de un Alert
      setFinishedAdoptionModalContent({
        visible: true,
        title: '¡Adopción Finalizada!',
        petName: requestData.pets?.name || 'La mascota',
        message: 'Esta adopción ya ha sido completada con éxito. El chat no está disponible para solicitudes finalizadas. ¡Disfruta de tu nueva mascota!',
        petImage: petImage,
        buttonText: 'Volver al inicio',
        onButtonPress: () => {
          setFinishedAdoptionModalContent(prev => ({ ...prev, visible: false }));
          // Redirigir al usuario a la pantalla principal
          setTimeout(() => router.push('/(tabs)/home'), 500);
        }
      });
      return;
    } else if (requestData.status !== 'accepted') {
      Alert.alert(
        'Chat no disponible', 
        'El chat solo está disponible para solicitudes aceptadas.',
        [{ text: 'Volver', onPress: () => router.back() }]
      );
      return;
    }

    setAdoptionRequest(requestData);
    setPet(requestData.pets);
    
    // Obtener o crear el chat
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('adoption_request_id', requestId);
    
    if (chatError) throw chatError;

    let chatId;

    if (chatData && chatData.length > 0) {
      // El chat ya existe
      setChat(chatData[0]);
      chatId = chatData[0].id;
    } else {
      // Crear un nuevo chat si no existe
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          user1_id: requestData.owner_id,
          user2_id: requestData.requester_id,
          adoption_request_id: requestId
        })
        .select();

      if (createError) throw createError;
      
      setChat(newChat[0]);
      chatId = newChat[0].id;

      // Enviar mensaje automático de bienvenida
      await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          user_id: requestData.owner_id,
          message: `¡Hola! Tu solicitud para adoptar a ${requestData.pets?.name || 'la mascota'} ha sido aceptada. Podemos coordinar la adopción a través de este chat.`
        });
    }

    // Obtener datos del otro usuario
    const otherUserId = user.id === requestData.owner_id 
      ? requestData.requester_id 
      : requestData.owner_id;
    
    await loadOtherUserProfile(otherUserId);

    // Cargar mensajes
    await loadMessages(chatId);

    // Suscribirse a nuevos mensajes con un pequeño retraso para asegurar
    // que la conexión con Supabase esté establecida
    setTimeout(() => {
      subscribeToMessages(chatId);
    }, 500);
  };

  /**
   * Carga un chat basado en su ID
   * @param {string} chatId - ID del chat
   */
  const loadChatById = async (chatId) => {
    // Obtener datos del chat
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();
    
    if (chatError) throw chatError;

    // Verificar permisos
    if (chatData.user1_id !== user.id && chatData.user2_id !== user.id) {
      Alert.alert('Error', 'No tienes permiso para acceder a este chat');
      router.back();
      return;
    }

    setChat(chatData);

    // Obtener datos del otro usuario
    const otherUserId = user.id === chatData.user1_id 
      ? chatData.user2_id 
      : chatData.user1_id;
    
    await loadOtherUserProfile(otherUserId);

    // Si es un chat de adopción, obtener datos de la solicitud y la mascota
    if (chatData.adoption_request_id) {
      const { data: requestData, error: requestError } = await supabase
        .from('adoption_requests')
        .select(`
          id,
          status,
          requester_id,
          owner_id,
          pet_id,
          pets:pet_id (
            id, 
            name,
            type,
            breed,
            gender,
            age,
            pet_images (url, is_main)
          )
        `)
        .eq('id', chatData.adoption_request_id)
        .single();

      if (!requestError) {
        setAdoptionRequest(requestData);
        setPet(requestData.pets);
      }
    }

    // Cargar mensajes
    await loadMessages(chatId);
    
    // Suscribirse a nuevos mensajes
    setTimeout(() => {
      subscribeToMessages(chatId);
    }, 500);
  };

  /**
   * Carga el perfil del otro usuario del chat
   * @param {string} userId - ID del otro usuario
   */
  const loadOtherUserProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', userId)
      .single();
    
    if (!error) {
      setOtherUser(data);
    }
  };

  /**
   * Carga los mensajes del chat y los marca como leídos
   * @param {string} chatId - ID del chat
   */
  const loadMessages = async (chatId) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    setMessages(data || []);

    // Marcar todos los mensajes del otro usuario como leídos
    if (data && data.length > 0) {
      const unreadMessages = data.filter(msg => msg.user_id !== user.id && !msg.read);
      
      if (unreadMessages.length > 0) {
        const unreadIds = unreadMessages.map(msg => msg.id);
        
        await supabase
          .from('chat_messages')
          .update({ read: true })
          .in('id', unreadIds);
      }
    }
  };

  /**
   * Limpiar suscripción al canal actual
   */
  const cleanupSubscription = useCallback(() => {
    if (messageSubscription.current) {
      console.log('Limpiando suscripción anterior...');
      try {
        messageSubscription.current.unsubscribe();
      } catch (err) {
        console.error('Error al desuscribirse del canal anterior:', err);
      }
      messageSubscription.current = null;
    }
  }, []);

  /**
   * Configurar suscripción para recibir mensajes en tiempo real
   * @param {string} chatId - ID del chat
   */
  const subscribeToMessages = useCallback((chatId) => {
    if (!chatId) {
      console.log('No se puede suscribir sin un ID de chat válido');
      return;
    }
    
    // Limpiar suscripción anterior si existe
    cleanupSubscription();
    
    try {
      console.log('Configurando nueva suscripción para chat ID:', chatId);
      
      // Crear un canal con nombre simple como en la implementación original
      const channel = supabase.channel(`chat_${chatId}`);
      
      // Configurar listener para nuevos mensajes (igual que en la versión original)
      channel.on(
        REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        }, 
        async (payload) => {
          console.log('Evento recibido de Supabase!', payload);
          const newMessage = payload.new;
          
          // Verificar si es un mensaje propio o de otro usuario
          if (newMessage.user_id === user.id) {
            console.log('Mensaje propio recibido via Realtime');
            // Actualizar el mensaje optimista si existe
            setMessages(prevMessages => {
              const hasOptimisticVersion = prevMessages.some(msg => 
                msg.isOptimistic && msg.message === newMessage.message
              );
              
              if (hasOptimisticVersion) {
                // Reemplazar mensaje optimista con el real
                return prevMessages.map(msg => 
                  (msg.isOptimistic && msg.message === newMessage.message) ? newMessage : msg
                );
              }
              
              // Verificar si ya existe
              const exists = prevMessages.some(msg => msg.id === newMessage.id);
              if (exists) return prevMessages;
              
              return [...prevMessages, newMessage];
            });
          } else {
            console.log('Mensaje de otro usuario recibido!');
            
            // Agregar mensaje a la lista si no existe
            setMessages(currentMessages => {
              // Verificar si el mensaje ya existe
              const exists = currentMessages.some(msg => msg.id === newMessage.id);
              if (exists) {
                console.log('Mensaje ya existe en la lista');
                return currentMessages;
              }
              
              console.log('Añadiendo nuevo mensaje a la lista');
              return [...currentMessages, newMessage];
            });
            
            // Scroll hacia abajo para mostrar el nuevo mensaje
            setTimeout(() => {
              if (flatListRef.current) {
                try {
                  flatListRef.current.scrollToEnd({ animated: true });
                } catch (error) {
                  console.error('Error al hacer scroll automático:', error);
                }
              }
            }, 100);
            
            // Marcar como leído
            try {
              await supabase
                .from('chat_messages')
                .update({ read: true })
                .eq('id', newMessage.id);
            } catch (error) {
              console.error('Error al marcar mensaje como leído:', error);
            }
          }
        }
      );
      
      // Activar la suscripción de forma simple como en la versión original
      channel.subscribe((status) => {
        console.log(`Canal status: ${status}`);
      });
      
      // Guardar la referencia de la suscripción para poder limpiarla
      messageSubscription.current = channel;
      
      // Confirmar que el canal se configuró correctamente
      console.log('Canal de chat configurado correctamente:', chatId);
    } catch (error) {
      console.error('Error al configurar suscripción realtime:', error);
      Alert.alert(
        'Error de conexión', 
        'No se pudo establecer la conexión en tiempo real. Los mensajes pueden no actualizarse automáticamente.'
      );
    }
  }, [user, cleanupSubscription]);

  /**
   * Envía un nuevo mensaje
   */
  const sendMessage = async () => {
    if (!newMessage.trim() || !chat) return;
    
    try {
      setSending(true);
      
      // Preparar el mensaje
      const messageText = newMessage.trim();
      
      // Actualizar UI inmediatamente con un mensaje optimista
      const tempMessage = {
        id: `temp-${Date.now()}`,
        chat_id: chat.id,
        user_id: user.id,
        message: messageText,
        created_at: new Date().toISOString(),
        read: false,
        // Agregar propiedad para identificar mensaje temporal
        isOptimistic: true
      };
      
      // Agregar mensaje a la UI inmediatamente
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Limpiar campo de mensaje antes de la petición
      setNewMessage('');
      
      // Enviar mensaje real a Supabase
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chat.id,
          user_id: user.id,
          message: messageText
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      // Reemplazar mensaje temporal con el real en la UI
      if (data && data.length > 0) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempMessage.id ? data[0] : msg
          )
        );
        
        // Identificar al destinatario (el otro usuario del chat)
        const recipientId = chat.owner_id === user.id ? chat.requester_id : chat.owner_id;
        
        // Obtener el nombre del usuario actual para mostrarlo en la notificación
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (!userError && userData) {
          // Preparar datos para la notificación
          const chatData = {
            chatId: chat.id,
            petId: pet?.id || null,
            senderId: user.id,
            adoptionRequestId: chat.adoption_request_id || null
          };
          
          // Enviar notificación push al destinatario
          // No esperamos a que termine para no bloquear la UI
          sendChatNotification(
            recipientId,
            userData.full_name || 'Usuario',
            messageText,
            chatData
          ).catch(notifError => {
            console.log('Error al enviar notificación push (no crítico):', notifError);
          });
        }
      }
      
      // Hacer scroll al final de la lista
      scrollToBottom(true);
    } catch (error) {
      console.error('Error al enviar mensaje:', error.message);
      Alert.alert('Error', 'No se pudo enviar el mensaje: ' + error.message);
      
      // Eliminar mensaje optimista en caso de error
      setMessages(prevMessages => 
        prevMessages.filter(msg => !msg.isOptimistic)
      );
    } finally {
      setSending(false);
    }
  };

  /**
   * Función para hacer scroll al final de la lista
   * @param {boolean} animated - Indica si el scroll debe ser animado
   */
  const scrollToBottom = useCallback((animated = false) => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated });
      }, 300);
    }
  }, [messages.length]);

  /**
   * Obtiene la imagen principal de la mascota desde el estado
   * @returns {string|null} URL de la imagen principal o null
   */
  const getPetImage = () => {
    if (!pet || !pet.pet_images) return null;
    const mainImage = pet.pet_images.find(img => img.is_main) || pet.pet_images[0];
    return mainImage ? mainImage.url : null;
  };

  /**
   * Extrae la imagen principal de un objeto mascota genérico
   * @param {object} petData - Datos de la mascota
   * @returns {string|null} URL de la imagen principal o null
   */
  const extractPetImage = (petData) => {
    if (!petData || !petData.pet_images) return null;
    const mainImage = petData.pet_images.find(img => img.is_main) || petData.pet_images[0];
    return mainImage ? mainImage.url : null;
  };

    // Funciones de gestión de adopción movidas a useAdoptionRequest

  // Efecto para manejar cambios de estado de la app (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      // Cuando la app vuelve a primer plano
      if (nextAppState === 'active' && chat) {
        console.log('App vuelve a primer plano, verificando conexión del chat');
        
        // Si el chat está cargado pero no hay suscripción activa, reconectar
        if (!messageSubscription.current) {
          console.log('Reconectando canal de chat:', chat.id);
          subscribeToMessages(chat.id);
          // Actualizar mensajes
          loadMessages(chat.id).catch(error => {
            console.error('Error al recargar mensajes:', error);
          });
        }
      }
    };
    
    // Suscribirse a cambios de estado de la app
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [chat, subscribeToMessages, loadMessages]);
  
  // Verificar estado de Supabase Realtime cada 3 segundos y reconectar si es necesario
  // como estaba implementado en la versión original
  useEffect(() => {
    const interval = setInterval(() => {
      if (chat && !messageSubscription.current) {
        console.log('Verificación periódica: Reconectando a Supabase Realtime...');
        subscribeToMessages(chat.id);
      }
    }, 3000); // 3 segundos igual que en el original

    return () => clearInterval(interval);
  }, [chat, subscribeToMessages]);

  useEffect(() => {
    // Solo cargar datos cuando el componente se monta por primera vez
    // o cuando cambia realmente el ID del chat/solicitud
    if (isInitialMount.current || 
        requestIdRef.current !== (params.adoption_request || params.id)) {
      requestIdRef.current = params.adoption_request || params.id;
      loadInitialData();
      isInitialMount.current = false;
    }

    // Limpiar al desmontar
    return () => {
      cleanupSubscription();
    };
  }, [params, loadInitialData, cleanupSubscription]);

  // Verificar si el usuario actual es el dueño de la mascota
  const isPetOwner = adoptionRequest && user && 
    String(adoptionRequest.owner_id) === String(user.id);

  // Verificar estado de Supabase Realtime periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (chat && !messageSubscription.current) {
        subscribeToMessages(chat.id);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [chat]);
    
  return {
    // Estados
    loading,
    sending,
    chat,
    messages,
    newMessage,
    otherUser,
    adoptionRequest,
    pet,
    keyboardVisible,
    isPetOwner,

    // Métodos para la UI
    setNewMessage,
    setKeyboardVisible,
    flatListRef,
    
    // Acciones
    sendMessage,
    scrollToBottom,
    getPetImage
  };
}
