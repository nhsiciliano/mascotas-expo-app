import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, Redirect } from 'expo-router';
import Loading from '../components/Loading';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function IndexPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isRedirecting, setIsRedirecting] = useState(false);
    
    // Efecto para manejar la redirección basada en contexto de autenticación
    useEffect(() => {
        if (user) {
            console.log('Usuario en contexto:', user.id, '- Redirigiendo a home');
            router.replace('/home');
        }
    }, [user]);
    
    // Efecto inicial para verificar la sesión
    useEffect(() => {
        if (isRedirecting) return; // Evitar múltiples verificaciones simultáneas
        
        // Verifica si hay una sesión activa y redirige apropiadamente
        const checkSession = async () => {
            setIsRedirecting(true);
            try {
                console.log('Verificando sesión inicial desde index...');
                const { data, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('Error al verificar sesión:', error.message);
                    router.replace('/welcome');
                    return;
                }
                
                if (data?.session) {
                    console.log('Sesión verificada manualmente, usuario:', data.session.user.id);
                    // Redirección forzada a home
                    setTimeout(() => {
                        console.log('Redirigiendo a home a través de timeout...');
                        router.replace('/home');
                    }, 500); // Pequeño retraso para permitir que el contexto se actualice
                } else {
                    console.log('Sin sesión activa, redirigiendo a welcome...');
                    router.replace('/welcome');
                }
            } catch (error) {
                console.error('Error inesperado:', error);
                router.replace('/welcome');
            } finally {
                setIsRedirecting(false);
            }
        };
        
        checkSession();
    }, []);
    
    return (
        <View className="flex-1 items-center justify-center">
            <Loading size={hp(16)} aspectR={1} />
        </View>
    )
}