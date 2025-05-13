import { View, Text, Image, TextInput, TouchableOpacity, Alert, Pressable, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { useFonts } from 'expo-font';


export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Cargar la fuente personalizada
    const [fontsLoaded] = useFonts({
        'Barriecito': require('../assets/fonts/Barriecito-Regular.ttf'),
        'SourGummy': require('../assets/fonts/SourGummy-font.ttf'),
    });

    const { signInWithEmail, signInWithGoogle, resetPassword, loading: authLoading } = useAuth();
    const router = useRouter();

    // Validar entradas
    const validateInputs = () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu email');
            return false;
        }
        if (!password.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu contraseña');
            return false;
        }
        return true;
    };

    // Iniciar sesión con email y contraseña
    const onSubmitSignIn = async () => {
        if (!validateInputs()) return;
        
        setLocalLoading(true);
        const { success, error } = await signInWithEmail(email, password);
        setLocalLoading(false);
        
        if (!success) {
            Alert.alert('Error de inicio de sesión', error || 'No se pudo iniciar sesión. Inténtalo nuevamente.');
        }
    };
    
    // Iniciar sesión con Google
    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        const { success, error } = await signInWithGoogle();
        setGoogleLoading(false);
        
        if (success) {
            // Redirigir al home después de autenticación exitosa
            router.replace('/home');
        } else if (error) {
            Alert.alert('Error de inicio de sesión', error || 'No se pudo iniciar sesión con Google. Inténtalo nuevamente.');
        }
    };
    
    // Recuperar contraseña
    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu email para recuperar tu contraseña');
            return;
        }
        
        setForgotLoading(true);
        const { success, error } = await resetPassword(email);
        setForgotLoading(false);
        
        if (success) {
            Alert.alert(
                'Recuperación de contraseña', 
                'Se ha enviado un correo con instrucciones para recuperar tu contraseña.'
            );
        } else {
            Alert.alert(
                'Error', 
                error || 'No se pudo enviar el correo de recuperación. Inténtalo nuevamente.'
            );
        }
    };

    return (
        <ScreenWrapper bg={'#f4f7f8'}>
            <CustomKeyboardView>
                <StatusBar style='dark' />
                <View style={{ paddingTop: hp(2), paddingHorizontal: wp(5) }} className="flex-1">
                    {/* Logo de la app */}
                    <View className="items-center justify-center mt-4 mb-2">
                        <Image
                            source={require('../assets/icons/splash-icon-dark.png')}
                            style={{ width: hp(12), height: hp(12), resizeMode: 'contain' }}
                        />
                    </View>
                    
                    {/* Encabezado */}
                    <View className="items-center justify-center mb-6">
                        <Text style={{ 
                            fontSize: hp(4), 
                            fontFamily: fontsLoaded ? 'SourGummy' : undefined,
                            color: '#059669',
                            letterSpacing: 0.5
                        }} 
                        className="text-center">
                            Adopción Responsable
                        </Text>
                    </View>

                    {/* Formulario */}
                    <View className="mt-2">
                        <Text style={{ fontSize: hp(2.1) }} className="font-normal text-neutral-700 mb-6 text-center">
                            Inicia sesión para continuar
                        </Text>
                        
                        {/* Campo de email */}
                        <View style={{ height: hp(7), marginBottom: hp(2) }} className="flex-row gap-3 px-4 bg-neutral-100 items-center rounded-2xl border border-gray-200">
                            <Ionicons name='mail-outline' size={hp(2.5)} color="#64748b" />
                            <TextInput
                                onChangeText={(text) => setEmail(text)}
                                value={email}
                                style={{ fontSize: hp(2) }}
                                className="flex-1 font-medium text-neutral-800"
                                placeholder='Correo electrónico'
                                autoCapitalize={'none'}
                                placeholderTextColor={"#94a3b8"}
                                keyboardType="email-address"
                            />
                        </View>
                        
                        {/* Campo de contraseña */}
                        <View style={{ height: hp(7), marginBottom: hp(1) }} className="flex-row gap-3 px-4 bg-neutral-100 items-center rounded-2xl border border-gray-200">
                            <Ionicons name='lock-closed-outline' size={hp(2.5)} color="#64748b" />
                            <TextInput
                                onChangeText={(text) => setPassword(text)}
                                value={password}
                                style={{ fontSize: hp(2) }}
                                className="flex-1 font-medium text-neutral-800"
                                placeholder='Contraseña'
                                secureTextEntry={!showPassword}
                                placeholderTextColor={"#94a3b8"}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons 
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                                    size={hp(2.5)} 
                                    color="#64748b" 
                                />
                            </TouchableOpacity>
                        </View>
                        
                        {/* Olvidé mi contraseña */}
                        <TouchableOpacity onPress={() => router.push('/reset-password')}>
                            <View className="flex-row justify-end items-center mb-5">
                                <Text style={{ fontSize: hp(1.7) }} className="font-medium text-right text-cyan-600">
                                    ¿Olvidaste tu contraseña?
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Botón de inicio de sesión */}
                        <TouchableOpacity
                            style={{ height: hp(6.5) }}
                            className="bg-emerald-600 rounded-2xl justify-center items-center mb-4"
                            onPress={onSubmitSignIn}
                            disabled={localLoading || authLoading}
                        >
                            {(localLoading || authLoading) ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={{ fontSize: hp(2.2) }} className="text-white font-bold">
                                    Iniciar Sesión
                                </Text>
                            )}
                        </TouchableOpacity>
                        
                        {/* Separador */}
                        <View className="flex-row items-center justify-between my-4">
                            <View className="flex-1 h-0.5 bg-gray-200" />
                            <Text className="mx-4 text-gray-500 font-medium">O</Text>
                            <View className="flex-1 h-0.5 bg-gray-200" />
                        </View>
                        
                        {/* Botón de Google */}
                        <TouchableOpacity 
                            style={{ height: hp(6.5) }} 
                            className="border border-gray-300 bg-white rounded-2xl justify-center items-center flex-row mb-6"
                            onPress={handleGoogleSignIn}
                            disabled={googleLoading}
                        >
                            {googleLoading ? (
                                <ActivityIndicator size="small" color="#4285F4" style={{marginRight: 10}} />
                            ) : (
                                <Image 
                                    source={require('../assets/images/google-icon.png')} 
                                    style={{width: hp(2.5), height: hp(2.5), marginRight: 12}} 
                                    resizeMode="contain" 
                                />
                            )}
                            <Text style={{ fontSize: hp(2) }} className="font-medium text-neutral-700">
                                Iniciar con Google
                            </Text>
                        </TouchableOpacity>
                        
                        {/* Footer - Link a registro */}
                        <View className="flex-row justify-center mt-2">
                            <Text style={{ fontSize: hp(1.8) }} className="text-neutral-600">
                                ¿No tienes una cuenta?
                            </Text>
                            <Pressable
                                onPress={() => router.push('signUp')}
                            >
                                <Text style={{ fontSize: hp(1.8) }} className="font-bold text-emerald-700 ml-2">
                                    Regístrate
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </CustomKeyboardView>
        </ScreenWrapper>
    )
}