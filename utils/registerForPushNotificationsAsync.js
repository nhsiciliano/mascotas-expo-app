import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

export async function registerForPushNotificationsAsync() {
    let token;
    
    // Verificar primero si estamos en un dispositivo físico
    if (!Device.isDevice) {
        console.log('Las notificaciones push requieren un dispositivo físico');
        return null;
    }
    
    // Configurar canal de notificaciones en Android
    if (Platform.OS === 'android') {
        try {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Notificaciones de Mascotas',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
                description: 'Canal para notificaciones de Adopción Responsable',
            });
        } catch (error) {
            console.error('Error al configurar canal de notificaciones:', error);
        }
    }

    // Verificar los permisos para notificaciones
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        // Si no tenemos permiso, solicitarlo
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        
        // Si el permiso fue denegado, mostrar mensaje
        if (finalStatus !== 'granted') {
            console.warn('¡Permiso de notificaciones no concedido!');
            Alert.alert(
                'Notificaciones desactivadas',
                'No podrás recibir notificaciones sobre nuevas mascotas o actualizaciones de adopciones. Puedes activarlas en la configuración de tu dispositivo.',
                [{ text: 'Entendido' }]
            );
            return null;
        }
        
        // Obtener el project ID para EAS
        let projectId;
        
        if (Constants?.expoConfig?.extra?.eas?.projectId) {
            projectId = Constants.expoConfig.extra.eas.projectId;
        } else if (Constants?.easConfig?.projectId) {
            projectId = Constants.easConfig.projectId;
        } else {
            // Valor de projectId de tu app.json
            projectId = '6e008fa8-2edd-4e32-ac90-664093fe9390';
        }
        
        if (!projectId) {
            console.error('No se encontró el Project ID');
            return null;
        }
        
        // Intentar obtener el token de Expo
        try {
            const expoPushToken = await Notifications.getExpoPushTokenAsync({
                projectId: projectId
            });
            
            token = expoPushToken.data;
            console.log('Token Push de Expo:', token);
            
            return token;
        } catch (error) {
            console.error('Error al obtener token de notificaciones push:', error);
            return null;
        }
    } catch (error) {
        console.error('Error al registrar para notificaciones push:', error);
        return null;
    }
}