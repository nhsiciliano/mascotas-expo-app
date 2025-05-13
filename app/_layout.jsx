import { Stack } from 'expo-router';
import '../global.css';
import { AuthProvider } from '../context/AuthContext';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useState, useEffect, useRef } from 'react';
import { registerForPushNotificationsAsync } from '../utils/registerForPushNotificationsAsync';

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
    // Estados para manejar token y notificaciones
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(null);
    
    // Referencias para manejar notificaciones recibidas y respuestas
    const notificationListener = useRef();
    const responseListener = useRef();

    // Configurar y registrar para notificaciones push al montar el componente
    useEffect(() => {
        // Solo intentar registrar para notificaciones si estamos en un dispositivo físico
        if (Device.isDevice) {
            // Registrarse para obtener token de notificaciones push
            registerForPushNotificationsAsync()
                .then(token => {
                    if (token) {
                        setExpoPushToken(token);
                        console.log('Token de notificaciones registrado:', token);
                    }
                })
                .catch((error) => {
                    console.error('Error al registrar para notificaciones:', error);
                    // No mostramos el error al usuario ya que puede ser confuso
                    // y las notificaciones no son críticas para la funcionalidad principal
                });

            // Configurar listeners para notificaciones
            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                console.log('Notificación recibida:', notification);
                setNotification(notification);
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                console.log('Respuesta a notificación:', response);
                // Aquí puedes manejar la navegación basada en la notificación
                // Por ejemplo: router.push(response.notification.request.content.data.url);
            });

            // Limpiar listeners al desmontar el componente
            return () => {
                if (notificationListener.current) {
                    Notifications.removeNotificationSubscription(notificationListener.current);
                }
                if (responseListener.current) {
                    Notifications.removeNotificationSubscription(responseListener.current);
                }
            };
        }
    }, []);
    
    // Para depuración - remover en producción
    useEffect(() => {
        if (expoPushToken) {
            console.log('Token de notificaciones push:', expoPushToken);
        }
    }, [expoPushToken]);

    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
    );
}