import { View, Text, Image, TextInput, TouchableOpacity, Alert, Pressable, ActivityIndicator, Modal, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather, AntDesign, MaterialIcons } from '@expo/vector-icons';
import Loading from '../components/Loading';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { useFonts } from 'expo-font';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [full_name, setFull_name] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    
    // Cargar la fuente personalizada
    const [fontsLoaded] = useFonts({
        'Barriecito': require('../assets/fonts/Barriecito-Regular.ttf'),
        'SourGummy': require('../assets/fonts/SourGummy-font.ttf'),
    });

    const { signUpWithEmail, signInWithGoogle, loading: authLoading } = useAuth();
    const router = useRouter();

    // Validación de entradas
    const validateInputs = () => {
        if (!username.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre de usuario');
            return false;
        }
        if (!full_name.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu nombre completo');
            return false;
        }
        if (!email.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu email');
            return false;
        }
        if (!password.trim()) {
            Alert.alert('Error', 'Por favor ingresa una contraseña');
            return false;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        return true;
    };

    // Registro con email y contraseña
    const onSubmitSignUp = async () => {
        if (!validateInputs()) return;
        
        setLocalLoading(true);
        
        const userData = {
            username,
            full_name,
            phone: phone || null
        };
        
        const { success, error } = await signUpWithEmail(email, password, userData);
        setLocalLoading(false);
        
        if (success) {
            // Mostrar modal en lugar de Alert
            setSuccessModalVisible(true);
            // Navegaremos a /login después de que el usuario cierre el modal
        } else {
            Alert.alert('Error de registro', error || 'No se pudo crear la cuenta. Inténtalo nuevamente.');
        }
    };
    
    // Registro con Google
    const handleGoogleSignUp = async () => {
        setGoogleLoading(true);
        await signInWithGoogle();
        setGoogleLoading(false);
    };
    
    // Manejar cierre del modal de éxito y navegación
    const handleCloseSuccessModal = () => {
        setSuccessModalVisible(false);
        router.replace('/login');
    };

    return (
        <ScreenWrapper bg={'#f4f7f8'}>
            {/* Modal de registro exitoso */}
            <Modal
                visible={successModalVisible}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <MaterialIcons name="check-circle" size={40} color="#059669" style={styles.successIcon} />
                            <Text style={styles.modalTitle}>Registro exitoso</Text>
                            <Text style={styles.modalMessage}>Tu cuenta ha sido creada. Por favor verifica tu correo electrónico.</Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.modalButton}
                            onPress={handleCloseSuccessModal}
                        >
                            <Text style={styles.modalButtonText}>Continuar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            
            <CustomKeyboardView>
                <StatusBar style='dark' />
                <View style={{ paddingTop: hp(0.5), paddingHorizontal: wp(5) }} className="flex-1">
                    {/* Encabezado */}
                    <View className="items-center justify-center mt-6 mb-6">
                        <Text style={{ 
                            fontSize: hp(4.5), 
                            fontFamily: fontsLoaded ? 'SourGummy' : undefined,
                            color: '#059669',
                            letterSpacing: 0.5
                        }} 
                        className="text-center">
                            Adopción Responsable
                        </Text>
                        <Text style={{ fontSize: hp(2) }} className="text-neutral-600 text-center mt-6">
                            Crea tu cuenta para continuar
                        </Text>
                    </View>

                    {/* Formulario */}
                    <View className="mt-2">
                        {/* Usuario */}
                        <View style={{ height: hp(7), marginBottom: hp(2) }} className="flex-row gap-3 px-4 bg-neutral-100 items-center rounded-2xl border border-gray-200">
                            <Ionicons name='person-outline' size={hp(2.5)} color="#64748b" />
                            <TextInput
                                onChangeText={(text) => setUsername(text)}
                                value={username}
                                style={{ fontSize: hp(2) }}
                                className="flex-1 font-medium text-neutral-800"
                                placeholder='Nombre de usuario'
                                autoCapitalize={'none'}
                                placeholderTextColor={"#94a3b8"}
                            />
                        </View>
                        
                        {/* Nombre completo */}
                        <View style={{ height: hp(7), marginBottom: hp(2) }} className="flex-row gap-3 px-4 bg-neutral-100 items-center rounded-2xl border border-gray-200">
                            <Ionicons name='person-circle-outline' size={hp(2.5)} color="#64748b" />
                            <TextInput
                                onChangeText={(text) => setFull_name(text)}
                                value={full_name}
                                style={{ fontSize: hp(2) }}
                                className="flex-1 font-medium text-neutral-800"
                                placeholder='Nombre completo'
                                autoCapitalize={'words'}
                                placeholderTextColor={"#94a3b8"}
                            />
                        </View>
                        
                        {/* Email */}
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
                        
                        {/* Teléfono */}
                        <View style={{ height: hp(7), marginBottom: hp(2) }} className="flex-row gap-3 px-4 bg-neutral-100 items-center rounded-2xl border border-gray-200">
                            <Ionicons name='call-outline' size={hp(2.5)} color="#64748b" />
                            <TextInput
                                onChangeText={(text) => setPhone(text)}
                                value={phone}
                                style={{ fontSize: hp(2) }}
                                className="flex-1 font-medium text-neutral-800"
                                placeholder='Teléfono (opcional)'
                                keyboardType="phone-pad"
                                placeholderTextColor={"#94a3b8"}
                            />
                        </View>
                        
                        {/* Contraseña */}
                        <View style={{ height: hp(7), marginBottom: hp(3) }} className="flex-row gap-3 px-4 bg-neutral-100 items-center rounded-2xl border border-gray-200">
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

                        {/* Botón de registro */}
                        {(localLoading || authLoading) ? (
                            <View className="flex-row justify-center my-3">
                                <Loading size={hp(8)} aspectR={1} />
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={{ height: hp(6.5) }}
                                className="bg-emerald-600 rounded-2xl justify-center items-center mb-4"
                                onPress={onSubmitSignUp}
                            >
                                <Text style={{ fontSize: hp(2.2) }} className="text-white font-bold">
                                    Crear cuenta
                                </Text>
                            </TouchableOpacity>
                        )}
                        
                        {/* Footer - Link a login */}
                        <View className="flex-row justify-center mt-2">
                            <Text style={{ fontSize: hp(1.8) }} className="text-neutral-600">
                                ¿Ya tienes una cuenta?
                            </Text>
                            <Pressable
                                onPress={() => router.push('login')}
                            >
                                <Text style={{ fontSize: hp(1.8) }} className="font-bold text-emerald-700 ml-2">
                                    Iniciar Sesión
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </CustomKeyboardView>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    // Estilos para modal de éxito
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContainer: {
        width: '70%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    modalContent: {
        padding: 15,
        alignItems: 'center',
    },
    successIcon: {
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#059669',
        textAlign: 'center',
        marginBottom: 5,
    },
    modalMessage: {
        fontSize: 14,
        color: '#4b5563',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    modalButton: {
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonText: {
        color: '#059669',
        fontSize: 14,
        fontWeight: '600',
    }
});