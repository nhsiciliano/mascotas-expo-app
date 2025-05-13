import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, Redirect } from 'expo-router';
import Loading from '../components/Loading';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        
        // Verificar si es primera vez y si hay una sesión activa
        const checkSession = async () => {
            setIsRedirecting(true);
            try {
                console.log('Verificando si es primera vez y sesión...');
                
                // Verificar si ya se completó el onboarding
                const onboardingCompleted = await AsyncStorage.getItem('@onboarding_completed');
                
                // Verificar sesión de usuario
                const { data, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('Error al verificar sesión:', error.message);
                    // Si hay error, dirigir a welcome si es primera vez, o a login si ya vio el onboarding
                    router.replace(onboardingCompleted === 'true' ? '/login' : '/welcome');
                    return;
                }
                
                if (data?.session) {
                    console.log('Sesión verificada manualmente, usuario:', data.session.user.id);
                    // Si hay sesión activa, siempre ir a home
                    setTimeout(() => {
                        console.log('Redirigiendo a home a través de timeout...');
                        router.replace('/home');
                    }, 2000); // Pequeño retraso para permitir que el contexto se actualice
                } else {
                    // No hay sesión activa
                    setTimeout(() => {
                        if (onboardingCompleted === 'true') {
                            // Si ya vio el onboarding, ir directamente a login
                            console.log('Sin sesión activa, redirigiendo a login (ya completó onboarding)...');
                            router.replace('/login');
                        } else {
                            // Primera vez en la app, mostrar onboarding
                            console.log('Primera vez en la app, redirigiendo a welcome...');
                            router.replace('/welcome');
                        }
                    }, 2000); // Pequeño retraso para permitir que el contexto se actualice
                }
            } catch (error) {
                console.error('Error inesperado:', error);
                // En caso de error crítico, mostrar welcome si es posible
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