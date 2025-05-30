import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { registerForPushNotificationsAsync } from './registerForPushNotificationsAsync';

// Configuración de notificaciones
export const configureNotifications = () => {
  // Configurar comportamiento de notificaciones cuando la app está en primer plano
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

/**
 * Guarda el token de notificación del usuario en Supabase
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>} - True si se guardó el token, false si hubo un error
 */
export const saveUserPushToken = async (userId) => {
  try {
    // No enviar notificaciones en emuladores o simuladores
    if (!Device.isDevice) {
      console.log('No se guardan tokens para dispositivos de desarrollo');
      return false;
    }
    
    // Obtener el token de notificaciones
    const token = await registerForPushNotificationsAsync();
    
    if (!token) {
      console.log('No se pudo obtener el token de notificaciones');
      return false;
    }
    
    // Guardar el token en la tabla de user_push_tokens
    // Si ya existe, se actualizará con upsert
    const { error } = await supabase
      .from('user_push_tokens')
      .upsert(
        {
          user_id: userId,
          push_token: token,
          device: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      
    if (error) {
      console.error('Error al guardar token de notificación:', error);
      return false;
    }
    
    console.log('Token de notificación guardado exitosamente:', token);
    return true;
  } catch (error) {
    console.error('Error en saveUserPushToken:', error);
    return false;
  }
};

/**
 * Envía una notificación push a un usuario específico
 * @param {string} userId - ID del usuario destinatario
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo de la notificación
 * @param {object} data - Datos adicionales para la notificación
 * @returns {Promise<boolean>} - True si se envió la notificación, false si hubo un error
 */
export const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    // Verificar si el usuario tiene token de notificación registrado
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_push_tokens')
      .select('push_token')
      .eq('user_id', userId)
      .single();
      
    if (tokenError || !tokenData || !tokenData.push_token) {
      console.log('El usuario no tiene token de notificación registrado');
      return false;
    }
    
    // Registrar la notificación en la base de datos
    const { data: notificationData, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: title,
        message: body,
        type: data.type || 'general',
        data: data,
        created_at: new Date().toISOString(),
        read: false
      });
      
    if (notificationError) {
      console.error('Error al registrar notificación en base de datos:', notificationError);
      // Continuamos de todos modos para intentar enviar la push notification
    }
    
    // Enviar la notificación usando Expo Push API
    const message = {
      to: tokenData.push_token,
      sound: 'default',
      title,
      body,
      data,
    };
    
    // Esta parte envía la notificación utilizando el servicio de Expo
    // No necesitamos implementar el servidor aquí, ya que Expo lo maneja
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    const responseData = await response.json();
    
    if (responseData.data && responseData.data.status === 'ok') {
      console.log('Notificación push enviada exitosamente');
      return true;
    } else {
      console.error('Error al enviar notificación push:', responseData);
      return false;
    }
  } catch (error) {
    console.error('Error en sendPushNotification:', error);
    return false;
  }
};

/**
 * Handler global para recibir notificaciones cuando la app está cerrada o en segundo plano
 */
export const registerBackgroundNotificationHandler = () => {
  // Este handler se ejecuta cuando la app está cerrada y el usuario toca una notificación
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

/**
 * Configura un listener para manejar notificaciones entrantes y toques en notificaciones
 * @param {Function} handleNotificationResponse - Función que se ejecuta cuando el usuario toca una notificación
 * @returns {object} Subscripciones para limpiar al desmontar el componente
 */
export const setupNotificationListeners = (handleNotificationResponse) => {
  // Subscripción a notificaciones recibidas mientras la app está en primer plano
  const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notificación recibida en primer plano:', notification);
  });
  
  // Subscripción a toques en notificaciones (abre la app si está en segundo plano)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notificación tocada:', response);
    if (handleNotificationResponse) {
      handleNotificationResponse(response);
    }
  });
  
  return {
    receivedSubscription,
    responseSubscription,
    cleanup: () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    }
  };
};

/**
 * Añadir una nueva notificación de chat
 * @param {string} receiverId - ID del receptor del mensaje
 * @param {string} senderName - Nombre del remitente
 * @param {string} message - Contenido del mensaje 
 * @param {object} chatData - Datos del chat (chatId, petId, etc.)
 */
export const sendChatNotification = async (receiverId, senderName, message, chatData) => {
  try {
    const title = `Nuevo mensaje de ${senderName}`;
    const body = message.length > 50 ? `${message.substring(0, 50)}...` : message;
    
    const data = {
      type: 'chat_message',
      chatId: chatData.chatId,
      petId: chatData.petId,
      senderId: chatData.senderId,
      screen: 'chat',
      params: { id: chatData.chatId }
    };
    
    // Enviar la notificación push
    return await sendPushNotification(receiverId, title, body, data);
  } catch (error) {
    console.error('Error al enviar notificación de chat:', error);
    return false;
  }
};

/**
 * Enviar notificación de nueva solicitud de adopción
 * @param {string} ownerId - ID del dueño de la mascota
 * @param {string} petName - Nombre de la mascota
 * @param {string} requesterName - Nombre del solicitante
 * @param {object} requestData - Datos de la solicitud
 */
export const sendAdoptionRequestNotification = async (ownerId, petName, requesterName, requestData) => {
  try {
    const title = `Nueva solicitud para ${petName}`;
    const body = `${requesterName} quiere adoptar a tu mascota ${petName}`;
    
    const data = {
      type: 'adoption_request',
      petId: requestData.petId,
      requestId: requestData.requestId,
      requesterId: requestData.requesterId,
      screen: 'adoption-request',
      params: { id: requestData.requestId }
    };
    
    // Enviar la notificación push
    return await sendPushNotification(ownerId, title, body, data);
  } catch (error) {
    console.error('Error al enviar notificación de solicitud de adopción:', error);
    return false;
  }
};
