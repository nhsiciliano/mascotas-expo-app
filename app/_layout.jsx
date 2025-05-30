import { Stack } from 'expo-router';
import '../global.css';
import { AuthProvider } from '../context/AuthContext';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { registerForPushNotificationsAsync } from '../utils/registerForPushNotificationsAsync';
import { configureNotifications, saveUserPushToken, setupNotificationListeners } from '../utils/notificationService';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

async function sendPushNotification(expoPushToken) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Original Title',
        body: 'And here is the body!',
        data: { someData: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}

function handleRegistrationError(errorMessage) {
    alert(errorMessage);
    throw new Error(errorMessage);
}

// Componente principal que sirve como layout y proveedor del contexto de autenticación
export default function RootLayout() {
    // Referencias para la autenticación y suscripciones de notificaciones
    const authStateChangedRef = useRef(null);
    const notificationServices = useRef(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Configurar las notificaciones al iniciar la app
    useEffect(() => {
        // Configurar comportamiento de notificaciones
        configureNotifications();
        
        // Escuchar cambios en la autenticación para registrar token
        authStateChangedRef.current = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user?.id) {
                    setIsAuthenticated(true);
                    
                    // Registrar token de notificaciones cuando el usuario inicia sesión
                    try {
                        const token = await registerForPushNotificationsAsync();
                        if (token) {
                            // Guardar token en Supabase para este usuario
                            await saveUserPushToken(session.user.id);
                            console.log('Token de notificaciones registrado para el usuario');
                        }
                    } catch (error) {
                        console.error('Error al registrar notificaciones:', error);
                    }
                } else if (event === 'SIGNED_OUT') {
                    setIsAuthenticated(false);
                }
            }
        );
        
        // Función para manejar toques en notificaciones
        const handleNotificationResponse = (response) => {
            const data = response.notification.request.content.data;
            console.log('Notificación tocada:', data);
            
            // Navegar según el tipo de notificación
            if (data && data.type) {
                switch (data.type) {
                    case 'chat_message':
                        // Navegar al chat específico
                        if (data.chatId) {
                            router.push({
                                pathname: '/chat',
                                params: { id: data.chatId }
                            });
                        }
                        break;
                        
                    case 'adoption_request':
                        // Navegar a la solicitud de adopción
                        if (data.requestId) {
                            router.push({
                                pathname: '/adoption-request',
                                params: { id: data.requestId }
                            });
                        }
                        break;
                        
                    default:
                        // Para otros tipos o si falta info, ir al inicio
                        router.push('/(tabs)/home');
                }
            }
        };
        
        // Configurar los listeners para notificaciones
        notificationServices.current = setupNotificationListeners(handleNotificationResponse);
        
        // Limpiar suscripciones al desmontar
        return () => {
            if (authStateChangedRef.current) {
                authStateChangedRef.current.unsubscribe();
            }
            
            if (notificationServices.current) {
                notificationServices.current.cleanup();
            }
        };
    }, []);

    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
    );
}