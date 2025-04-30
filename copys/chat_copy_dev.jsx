import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    InputAccessoryView,
    Modal
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Configuraciones para Supabase Realtime
const REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = 'postgres_changes';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { COLORS } from '../constants/colors'

export default function ChatScreen() {
    const params = useLocalSearchParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [adoptionRequest, setAdoptionRequest] = useState(null);
    const [pet, setPet] = useState(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [adoptionModalVisible, setAdoptionModalVisible] = useState(false);
    const [adoptionAction, setAdoptionAction] = useState(null); // 'concretar' o 'desestimar'
    const [processingAdoption, setProcessingAdoption] = useState(false);

    // Estado para el modal de éxito de adopción
    const [successModalContent, setSuccessModalContent] = useState({
        visible: false,
        title: '',
        message: '',
        petImage: null,
        buttonText: '',
        onButtonPress: () => { }
    });

    // Estado para el modal de adopción finalizada
    const [finishedAdoptionModalContent, setFinishedAdoptionModalContent] = useState({
        visible: false,
        title: '',
        message: '',
        petImage: null,
        petName: '',
        buttonText: '',
        onButtonPress: () => { }
    });
    const flatListRef = useRef();
    const messageSubscription = useRef(null);
    const isInitialMount = useRef(true);
    const requestIdRef = useRef(params.adoption_request || params.id);
    const inputAccessoryID = 'chatInput';

    useEffect(() => {
        console.log('Inicializando componente de chat...');
        // Solo cargar datos cuando el componente se monta por primera vez
        // o cuando cambia realmente el ID del chat/solicitud
        if (isInitialMount.current ||
            requestIdRef.current !== (params.adoption_request || params.id)) {
            requestIdRef.current = params.adoption_request || params.id;
            fetchChatData();
            isInitialMount.current = false;
        }

        // Configurar escuchas para eventos de teclado
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
                scrollToBottom(false);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            // Limpiar suscripción al salir de la pantalla
            if (messageSubscription.current) {
                messageSubscription.current.unsubscribe();
                messageSubscription.current = null;
            }
            // Eliminar escuchas de eventos de teclado
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [params]);

    const fetchChatData = async () => {
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
        } finally {
            setLoading(false);
        }
    };

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

        // Suscribirse a nuevos mensajes con un pequeño retraso para asegurar
        // que la conexión con Supabase esté establecida
        setTimeout(() => {
            subscribeToMessages(chatId);
        }, 500);
    };

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

    // Forzar scroll al final cuando cambia keyboardVisible
    useEffect(() => {
        if (keyboardVisible) {
            setTimeout(() => {
                scrollToBottom(true);
            }, 150);
        }
    }, [keyboardVisible, scrollToBottom]);

    const subscribeToMessages = (chatId) => {
        // Limpiar suscripción anterior si existe
        if (messageSubscription.current) {
            console.log('Limpiando suscripción anterior...');
            messageSubscription.current.unsubscribe();
            messageSubscription.current = null;
        }

        console.log('Configurando nueva suscripción para chat ID:', chatId);

        try {
            // Crear un canal con nombre simple
            const channel = supabase.channel(`chat_${chatId}`);

            // Configurar listener para nuevos mensajes (enfoque básico)
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
                        setTimeout(() => scrollToBottom(true), 100);

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

            // Activar la suscripción
            channel.subscribe((status) => {
                console.log(`Canal status: ${status}`);
            });

            // Guardar la referencia de la suscripción para poder limpiarla
            messageSubscription.current = channel;

            // Prueba para confirmar que podemos recibir eventos
            console.log('Canal de chat configurado correctamente:', chatId);
        } catch (error) {
            console.error('Error al configurar suscripción realtime:', error);
            Alert.alert(
                'Error de conexión',
                'No se pudo establecer la conexión en tiempo real. Los mensajes pueden no actualizarse automáticamente.'
            );
        }
    };


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

            // Scroll hacia abajo para mostrar el mensaje enviado
            setTimeout(() => scrollToBottom(true), 50);

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
                console.error('Error al enviar mensaje:', error);
                throw error;
            }

            console.log('Mensaje enviado exitosamente, esperando evento Realtime...');

            // Reemplazar mensaje temporal con el real en la UI (aunque Realtime debería actualizar esto)
            if (data && data.length > 0) {
                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === tempMessage.id ? data[0] : msg
                    )
                );
            }
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

    // Función para hacer scroll al final de la lista
    const scrollToBottom = useCallback((animated = false) => {
        if (messages.length > 0 && flatListRef.current) {
            try {
                // Usar un timer más largo para asegurar que el scroll funcione correctamente
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated });
                }, 300);
            } catch (error) {
                console.error('Error al hacer scroll:', error);
            }
        }
    }, [messages.length]);

    // Verificar estado de Supabase Realtime cada 30 segundos y reconectar si es necesario
    useEffect(() => {
        const interval = setInterval(() => {
            if (chat && !messageSubscription.current) {
                console.log('Reconectando a Supabase Realtime...');
                subscribeToMessages(chat.id);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [chat]);

    const getFormattedTime = (dateString) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'HH:mm', { locale: es });
        } catch (error) {
            console.error('Error al formatear hora:', error);
            // Fallback básico
            const date = new Date(dateString);
            return date.getHours().toString().padStart(2, '0') + ':' +
                date.getMinutes().toString().padStart(2, '0');
        }
    };

    const getFormattedDate = (dateString) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), "dd 'de' MMMM", { locale: es });
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            // Fallback básico
            const date = new Date(dateString);
            const day = date.getDate();
            const month = date.toLocaleString('es', { month: 'long' });
            return `${day} de ${month}`;
        }
    };

    const renderMessage = ({ item, index }) => {
        const isUserMessage = item.user_id === user.id;
        const showDate = index === 0 ||
            getFormattedDate(messages[index - 1]?.created_at) !== getFormattedDate(item.created_at);

        return (
            <>
                {showDate && (
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>{getFormattedDate(item.created_at)}</Text>
                    </View>
                )}
                <View style={[
                    styles.messageContainer,
                    isUserMessage ? styles.userMessageContainer : styles.otherMessageContainer
                ]}>
                    <View style={[
                        styles.messageBubble,
                        isUserMessage ? styles.userMessageBubble : styles.otherMessageBubble
                    ]}>
                        <Text style={[
                            styles.messageText,
                            isUserMessage ? styles.userMessageText : styles.otherMessageText
                        ]}>{item.message}</Text>
                        <Text style={[
                            styles.messageTime,
                            isUserMessage ? styles.userMessageTime : styles.otherMessageTime
                        ]}>{getFormattedTime(item.created_at)}</Text>
                    </View>
                </View>
            </>
        );
    };

    // Obtener imagen de mascota del objeto pet (estado del componente)
    const getPetImage = () => {
        if (!pet || !pet.pet_images) return null;
        const mainImage = pet.pet_images.find(img => img.is_main) || pet.pet_images[0];
        return mainImage ? mainImage.url : null;
    };

    // Función auxiliar para extraer imagen de un objeto mascota genérico
    const extractPetImage = (petData) => {
        if (!petData || !petData.pet_images) return null;
        const mainImage = petData.pet_images.find(img => img.is_main) || petData.pet_images[0];
        return mainImage ? mainImage.url : null;
    };

    // Funciones para concretar o desestimar adopción
    const handleShowAdoptionModal = (action) => {
        setAdoptionAction(action);
        setAdoptionModalVisible(true);
    };

    const handleConfirmAdoption = async () => {
        try {
            setProcessingAdoption(true);

            // Verificaciones mínimas, evitando validaciones adicionales
            if (!adoptionRequest) {
                throw new Error('No se encontró la solicitud de adopción');
            }
            if (!pet) {
                throw new Error('No se encontró la mascota');
            }
            if (!user) {
                throw new Error('No se encontró la información del usuario');
            }

            // Mostrar los datos completos para depuración
            console.log('DATOS DE ADOPCIÓN (SIN VALIDACIÓN):', {
                adoptionRequestId: adoptionRequest?.id,
                petId: pet?.id,
                ownerId: adoptionRequest?.owner_id,
                requesterId: adoptionRequest?.requester_id,
                userId: user?.id
            });

            // Determinar si es una adopción concretada o desestimada
            const adoptionStatus = adoptionAction === 'concretar' ? 'adopted' : 'rejected';

            console.log(`Procesando solicitud de ${adoptionAction} con estado final ${adoptionStatus}`);

            // Actualizar el estado de la solicitud de adopción
            const { error: requestError } = await supabase
                .from('adoption_requests')
                .update({
                    status: adoptionStatus,
                    // La columna resolved_at no existe en la tabla
                    updated_at: new Date().toISOString()  // Usando updated_at en su lugar
                })
                .eq('id', adoptionRequest.id);

            if (requestError) throw requestError;

            // Si la adopción se concretó, actualizar el estado de la mascota
            if (adoptionAction === 'concretar') {
                // Registrar los valores para depuración
                console.log('Valores para actualización de mascota:', {
                    petId: pet?.id,
                    adopterId: adoptionRequest?.user_id
                });

                // Verificar que tengamos un requester_id válido para el adoptante (campo correcto)
                if (!adoptionRequest?.requester_id) {
                    console.error('Error: requester_id es null', adoptionRequest);
                    throw new Error('No se pudo completar la adopción: Falta ID del solicitante');
                }

                console.log('ID del adoptante verificado correctamente:', adoptionRequest.requester_id);

                // 1. Actualizamos el status de la mascota en la tabla pets
                const { error: petError } = await supabase
                    .from('pets')
                    .update({
                        status: 'adoptada',                          // Para mostrar que la mascota ya no está disponible
                        adopted_by: adoptionRequest.requester_id     // Guardamos quién la adoptó
                    })
                    .eq('id', pet.id);

                if (petError) {
                    console.error('Error al actualizar el estado de la mascota:', petError);
                    // Si falla por campos que no existen, intentamos solo con status
                    const { error: retryPetError } = await supabase
                        .from('pets')
                        .update({ status: 'adoptada' })
                        .eq('id', pet.id);

                    if (retryPetError) throw retryPetError;
                }

                // 2. Registramos la adopción en la tabla adoptions
                const adoptionData = {
                    pet_id: pet.id,
                    owner_id: adoptionRequest.owner_id,
                    adopter_id: adoptionRequest.requester_id,
                    user_id: user.id,
                    created_at: new Date().toISOString(),
                    status: 'completada'
                };

                const { error: adoptionError } = await supabase
                    .from('adoptions')
                    .insert(adoptionData);

                if (adoptionError) {
                    console.error('Error al registrar la adopción:', adoptionError);
                    // Continuamos a pesar del error para no bloquear el proceso
                    // La solicitud ya se marcó como adopted, lo cual es lo más importante
                } else {
                    console.log('Adopción registrada con éxito en la tabla adoptions');
                }

                // Registramos información completa del proceso
                console.log('Adopción completada con éxito:', {
                    mascota: {
                        id: pet.id,
                        nombre: pet.name,
                        nuevoEstado: 'adoptada'
                    },
                    adoptante: {
                        id: adoptionRequest.requester_id
                    },
                    dueñoAnterior: {
                        id: adoptionRequest.owner_id
                    }
                });

                // Registro final del proceso completo
                console.log('Proceso de adopción completado con éxito:', {
                    fecha: new Date().toISOString(),
                    estado: 'completado',
                    solicitudId: adoptionRequest.id
                });
            }

            // Si es una adopción concretada, crear una notificación para el adoptante
            if (adoptionAction === 'concretar') {
                try {
                    // Crear notificación para el adoptante
                    const { error: notificationError } = await supabase
                        .from('notifications')
                        .insert({
                            user_id: adoptionRequest.requester_id,   // ID del adoptante
                            type: 'adoption_completed',
                            title: '¡Adopción finalizada!',
                            message: `Tu proceso de adopción para ${pet.name} ha sido completado exitosamente. ¡Felicidades por tu nueva mascota!`,
                            data: {
                                pet_id: pet.id,
                                pet_name: pet.name,
                                request_id: adoptionRequest.id,
                                status: 'adopted'
                            },
                            created_at: new Date().toISOString(),
                            read: false
                        });

                    if (notificationError) {
                        console.error('Error al enviar notificación al adoptante:', notificationError);
                        // Continuamos a pesar del error
                    } else {
                        console.log('Notificación de adopción finalizada enviada al adoptante');
                    }
                } catch (error) {
                    console.error('Error al crear notificación de adopción finalizada:', error);
                    // Continuamos aunque haya un error
                }
            }

            // Enviar un mensaje automático al chat
            const messageText = adoptionAction === 'concretar'
                ? '¡Adopción concretada exitosamente! 🎉 La mascota ha sido marcada como adoptada. Este chat ya no estará disponible.'
                : 'Proceso de adopción desestimado. La mascota sigue disponible para adopción.';

            await supabase
                .from('chat_messages')
                .insert({
                    chat_id: chat.id,
                    user_id: user.id,
                    message: messageText,
                    created_at: new Date().toISOString(),
                    read: false,
                    system_message: true
                });

            // Registrar el resultado final del proceso de adopción
            console.log(`Proceso de adopción '${adoptionAction}' completado con éxito`, {
                pet_id: pet.id,
                status: adoptionStatus,
                request_id: adoptionRequest.id
            });

            // En lugar de un simple Alert, usamos un modal personalizado para adopción exitosa
            if (adoptionAction === 'concretar') {
                // Configurar el modal de éxito para adopción concretada
                setSuccessModalContent({
                    visible: true,
                    title: '¡Adopción Exitosa! 🎉',
                    message: `¡Felicidades! La adopción de ${pet?.name || 'la mascota'} ha sido completada exitosamente. ¡Has cambiado una vida para siempre!`,
                    petImage: getPetImage(),
                    buttonText: 'Volver al inicio',
                    onButtonPress: () => {
                        setSuccessModalContent(prev => ({ ...prev, visible: false }));
                        // Redirigir al usuario a la pantalla principal
                        setTimeout(() => router.push('/(tabs)/home'), 500);
                    }
                });
            } else {
                // Para adopción desestimada usamos un alert simple
                Alert.alert(
                    'Adopción Desestimada',
                    'El proceso de adopción ha sido desestimado. La mascota sigue disponible para adopción.',
                    [{ text: 'Entendido' }]
                );
            }

        } catch (error) {
            console.error('Error en proceso de adopción:', error.message);
            Alert.alert('Error', `Ocurrió un error al procesar la adopción: ${error.message}`);
        } finally {
            setProcessingAdoption(false);
            setAdoptionModalVisible(false);
        }
    };

    // Verificar si el usuario actual es el dueño de la mascota
    // Necesitamos usar adoptionRequest.owner_id porque es más confiable que pet.user_id
    const isPetOwner = adoptionRequest && user && String(adoptionRequest.owner_id) === String(user.id);
    console.log('Verificación de dueño de mascota:', {
        'ID usuario actual': user?.id,
        'ID dueño mascota (desde pet)': pet?.user_id,
        'ID dueño mascota (desde request)': adoptionRequest?.owner_id,
        'Son iguales (usando owner_id)': adoptionRequest && String(adoptionRequest.owner_id) === String(user?.id)
    });

    // Debugging para botones de adopción
    useEffect(() => {
        if (pet && adoptionRequest) {
            console.log('Estado de visibilidad de botones de adopción:');
            console.log('- Pet:', !!pet);
            console.log('- AdoptionRequest:', !!adoptionRequest);
            console.log('- Usuario es dueño:', isPetOwner);
            console.log('- Estado de solicitud:', adoptionRequest?.status);
            console.log('- Condición final:', pet && adoptionRequest && isPetOwner &&
                (adoptionRequest.status === 'pending' || adoptionRequest.status === 'accepted'));
        }
    }, [pet, adoptionRequest, isPetOwner]);

    // Componente Modal de Éxito para la adopción
    const SuccessModal = () => (
        <Modal
            visible={successModalContent.visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.successModalContainer}>
                    <View style={styles.successModalHeader}>
                        <Text style={styles.successModalTitle}>{successModalContent.title}</Text>
                    </View>

                    {successModalContent.petImage && (
                        <View style={styles.successModalImageContainer}>
                            <Image
                                source={{ uri: successModalContent.petImage }}
                                style={styles.successModalImage}
                                resizeMode="cover"
                            />
                        </View>
                    )}

                    <Text style={styles.successModalMessage}>{successModalContent.message}</Text>

                    <TouchableOpacity
                        style={styles.successModalButton}
                        onPress={successModalContent.onButtonPress}
                    >
                        <Text style={styles.successModalButtonText}>{successModalContent.buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // Componente Modal para Adopción Finalizada
    const FinishedAdoptionModal = () => (
        <Modal
            visible={finishedAdoptionModalContent.visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.successModalContainer}>
                    <View style={[styles.successModalHeader, { backgroundColor: '#3498DB' }]}>
                        <Text style={styles.successModalTitle}>{finishedAdoptionModalContent.title}</Text>
                    </View>

                    {finishedAdoptionModalContent.petImage && (
                        <View style={styles.successModalImageContainer}>
                            <Image
                                source={{ uri: finishedAdoptionModalContent.petImage }}
                                style={styles.successModalImage}
                                resizeMode="cover"
                            />
                        </View>
                    )}

                    <View style={styles.finishedAdoptionContent}>
                        {finishedAdoptionModalContent.petName && (
                            <Text style={styles.finishedAdoptionPetName}>
                                {finishedAdoptionModalContent.petName}
                            </Text>
                        )}
                        <Text style={styles.successModalMessage}>{finishedAdoptionModalContent.message}</Text>

                    </View>

                    <TouchableOpacity
                        style={[styles.successModalButton, { backgroundColor: '#3498DB' }]}
                        onPress={finishedAdoptionModalContent.onButtonPress}
                    >
                        <Text style={styles.successModalButtonText}>{finishedAdoptionModalContent.buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Modal de Éxito */}
            <SuccessModal />

            {/* Modal de Adopción Finalizada */}
            <FinishedAdoptionModal />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    {otherUser ? (
                        <>
                            {otherUser.avatar_url ? (
                                <Image
                                    source={{ uri: otherUser.avatar_url }}
                                    style={styles.avatarImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <FontAwesome name="user" size={16} color={COLORS.inactive} />
                                </View>
                            )}
                            <Text style={styles.headerTitle}>{otherUser.full_name || 'Usuario'}</Text>
                        </>
                    ) : (
                        <Text style={styles.headerTitle}>Chat</Text>
                    )}
                </View>

                <View style={{ width: 40 }} />
            </View>

            {/* Chat Info Banner (solo para chats de adopción) */}
            {pet && (
                <View style={styles.adoptionBanner}>
                    <View style={styles.petInfoWrapper}>
                        {getPetImage() ? (
                            <Image
                                source={{ uri: getPetImage() }}
                                style={styles.petThumbnail}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.petThumbnailPlaceholder}>
                                <MaterialIcons name="pets" size={16} color={COLORS.white} />
                            </View>
                        )}
                        <View>
                            <Text style={styles.bannerTitle}>Adopción de {pet.name}</Text>
                            <Text style={styles.bannerSubtitle}>{pet.breed}, {pet.gender === 'male' ? 'Macho' : 'Hembra'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.bannerButton}
                        onPress={() => router.push(`/adoption-request?id=${adoptionRequest.id}`)}
                    >
                        <Text style={styles.bannerButtonText}>Detalles</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Botones de acción para adopción (Solo visible para el dueño de la mascota) */}
            {console.log('Renderizando botones:', { pet: !!pet, adoptionRequest: !!adoptionRequest, isPetOwner, status: adoptionRequest?.status })}
            {pet && adoptionRequest && isPetOwner && (adoptionRequest?.status === 'pending' || adoptionRequest?.status === 'accepted') && (
                <View style={styles.adoptionActions}>
                    <TouchableOpacity
                        style={[styles.adoptionButton, styles.adoptionButtonConcretar]}
                        onPress={() => handleShowAdoptionModal('concretar')}
                    >
                        <MaterialIcons name="check-circle" size={18} color={COLORS.white} />
                        <Text style={styles.adoptionButtonText}>Concretar adopción</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.adoptionButton, styles.adoptionButtonDesestimar]}
                        onPress={() => handleShowAdoptionModal('desestimar')}
                    >
                        <MaterialIcons name="cancel" size={18} color={COLORS.white} />
                        <Text style={styles.adoptionButtonText}>Desestimar adopción</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Cargando chat...</Text>
                </View>
            ) : (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 20}
                >
                    {/* Lista de mensajes */}
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.messagesContainer}
                        style={{ flex: 1 }}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={scrollToBottom}
                        onLayout={scrollToBottom}
                        maintainVisibleContentPosition={{
                            minIndexForVisible: 0,
                            autoscrollToTopThreshold: 100
                        }}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <MaterialIcons name="chat" size={64} color={COLORS.primaryLight} />
                                <Text style={styles.emptyText}>Envía el primer mensaje para comenzar</Text>
                            </View>
                        )}
                    />

                    {/* Input para nuevo mensaje */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Escribe un mensaje..."
                            placeholderTextColor={COLORS.textLight}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline={true}
                            maxLength={500}
                            inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryID : undefined}
                            onFocus={() => scrollToBottom(true)}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!newMessage.trim() || sending) && styles.disabledSendButton
                            ]}
                            onPress={() => {
                                sendMessage();
                                Keyboard.dismiss();
                            }}
                            disabled={!newMessage.trim() || sending}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <Ionicons name="send" size={20} color={COLORS.white} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {Platform.OS === 'ios' && (
                        <InputAccessoryView nativeID={inputAccessoryID}>
                            <View style={styles.accessoryBar}>
                                <TouchableOpacity
                                    style={styles.accessoryButton}
                                    onPress={() => Keyboard.dismiss()}
                                >
                                    <Text style={styles.accessoryButtonText}>Cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        </InputAccessoryView>
                    )}
                </KeyboardAvoidingView>
            )}

            {/* Modal de confirmación para concretar/desestimar adopción */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={adoptionModalVisible}
                onRequestClose={() => setAdoptionModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {adoptionAction === 'concretar' ? 'Concretar Adopción' : 'Desestimar Adopción'}
                        </Text>

                        <Text style={styles.modalMessage}>
                            {adoptionAction === 'concretar'
                                ? '¿Estás seguro que quieres finalizar el proceso de adopción? Esta acción marcará la mascota como adoptada y no estará disponible para otros adoptantes.'
                                : '¿Estás seguro que quieres desestimar esta adopción? La mascota seguirá disponible para que otros usuarios puedan adoptarla.'}
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setAdoptionModalVisible(false)}
                                disabled={processingAdoption}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonConfirm]}
                                onPress={handleConfirmAdoption}
                                disabled={processingAdoption}
                            >
                                {processingAdoption ? (
                                    <ActivityIndicator size="small" color={COLORS.white} />
                                ) : (
                                    <Text style={styles.modalButtonText}>
                                        {adoptionAction === 'concretar' ? 'Confirmar' : 'Desestimar'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Modal de Éxito Estilos
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    successModalContainer: {
        width: '90%',
        backgroundColor: COLORS.white,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    successModalHeader: {
        backgroundColor: COLORS.primary,
        padding: 15,
        alignItems: 'center',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    successModalTitle: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: 'bold',
    },
    successModalImageContainer: {
        height: 200,
        width: '100%',
        backgroundColor: COLORS.lightGray,
    },
    successModalImage: {
        height: '100%',
        width: '100%',
    },
    successModalMessage: {
        padding: 20,
        fontSize: 16,
        color: COLORS.text,
        textAlign: 'center',
        lineHeight: 24,
    },
    successModalButton: {
        backgroundColor: COLORS.secondary,
        margin: 20,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    successModalButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Estilos para el modal de adopción finalizada
    finishedAdoptionContent: {
        padding: 15,
        alignItems: 'center',
    },
    finishedAdoptionPetName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    adoptionCompletedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3498DB',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginTop: 15,
    },
    adoptionCompletedText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 5,
    },

    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    accessoryBar: {
        height: 45,
        backgroundColor: '#f8f8f8',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    accessoryButton: {
        padding: 10,
    },
    accessoryButtonText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    backButton: {
        padding: 8,
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    adoptionBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    petInfoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    petThumbnail: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    petThumbnailPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bannerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    bannerSubtitle: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    bannerButton: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    bannerButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.primary,
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
    messagesContainer: {
        padding: 16,
        paddingBottom: 100, // Asegurar suficiente espacio al final
        flexGrow: 1, // Esto permite que el contenedor crezca y se desplace adecuadamente
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'center',
    },
    adoptionActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    adoptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 4,
    },
    adoptionButtonConcretar: {
        backgroundColor: COLORS.primary,
    },
    adoptionButtonDesestimar: {
        backgroundColor: COLORS.danger || '#e53935',
    },
    adoptionButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 6,
    },
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
    modalButtonText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: COLORS.text,
    },
    dateContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    dateText: {
        fontSize: 12,
        color: COLORS.textLight,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    messageContainer: {
        marginBottom: 12,
        flexDirection: 'row',
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    otherMessageContainer: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 18,
    },
    userMessageBubble: {
        backgroundColor: COLORS.primaryDark,
        borderBottomRightRadius: 4,
    },
    otherMessageBubble: {
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userMessageText: {
        color: COLORS.white,
    },
    otherMessageText: {
        color: COLORS.text,
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    userMessageTime: {
        color: 'rgba(255,255,255,0.7)',
    },
    otherMessageTime: {
        color: COLORS.textLight,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 120,
        color: COLORS.text,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    disabledSendButton: {
        opacity: 0.6,
    },
});
