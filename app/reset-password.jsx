import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, StyleSheet, Alert } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { useFonts } from 'expo-font';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    
    const router = useRouter();
    const { resetPassword } = useAuth();
    
    // Cargar la fuente personalizada
    const [fontsLoaded] = useFonts({
        'Barriecito': require('../assets/fonts/Barriecito-Regular.ttf'),
    });
    
    // Validar email
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    
    // Enviar solicitud de recuperación
    const handleResetPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu email para recuperar tu contraseña');
            return;
        }
        
        if (!isValidEmail(email)) {
            Alert.alert('Error', 'Por favor ingresa un email válido');
            return;
        }
        
        setLoading(true);
        const { success, error } = await resetPassword(email);
        setLoading(false);
        
        if (success) {
            setSuccessModalVisible(true);
        } else {
            Alert.alert(
                'Error', 
                error || 'No se pudo enviar el correo de recuperación. Inténtalo nuevamente.'
            );
        }
    };
    
    // Manejar el cierre del modal
    const handleCloseModal = () => {
        setSuccessModalVisible(false);
        router.replace('/login');
    };
    
    return (
        <ScreenWrapper bg={'#f4f7f8'}>
            {/* Modal de éxito */}
            <Modal
                visible={successModalVisible}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <MaterialIcons name="email" size={40} color="#0891b2" style={styles.successIcon} />
                            <Text style={styles.modalTitle}>Email enviado</Text>
                            <Text style={styles.modalMessage}>
                                Hemos enviado un correo a {email} con instrucciones para recuperar tu contraseña.
                            </Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.modalButton}
                            onPress={handleCloseModal}
                        >
                            <Text style={styles.modalButtonText}>Volver al inicio de sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            
            <CustomKeyboardView>
                <StatusBar style='dark' />
                <View style={{ paddingTop: hp(4), paddingHorizontal: wp(5) }} className="flex-1">
                    {/* Botón para volver */}
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm"
                    >
                        <Ionicons name="arrow-back" size={hp(2.5)} color="#374151" />
                    </TouchableOpacity>
                    
                    {/* Encabezado */}
                    <View className="items-center justify-center mt-6 mb-12">
                        <Text style={{ 
                            fontSize: hp(4), 
                            fontFamily: fontsLoaded ? 'Barriecito' : undefined,
                            color: '#0891b2',
                            letterSpacing: 0.5
                        }} 
                        className="text-center">
                            Recuperar contraseña
                        </Text>
                        <Text style={{ fontSize: hp(2) }} className="text-neutral-600 text-center mt-2">
                            Ingresa tu email para recibir instrucciones
                        </Text>
                    </View>

                    {/* Formulario */}
                    <View className="mt-4">
                        {/* Campo de email */}
                        <View style={{ height: hp(7), marginBottom: hp(4) }} className="flex-row gap-3 px-4 bg-neutral-100 items-center rounded-2xl border border-gray-200">
                            <Ionicons name='mail-outline' size={hp(2.5)} color="#64748b" />
                            <TextInput
                                onChangeText={(text) => setEmail(text)}
                                value={email}
                                placeholder="Email"
                                autoCapitalize={'none'}
                                placeholderTextColor={"#94a3b8"}
                                keyboardType="email-address"
                                style={{ flex: 1, fontSize: hp(2) }}
                            />
                        </View>
                        
                        {/* Botón de enviar */}
                        <TouchableOpacity
                            style={{ height: hp(6.5) }}
                            className="bg-cyan-600 rounded-2xl justify-center items-center mb-4"
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={{ fontSize: hp(2.2) }} className="text-white font-bold">
                                    Enviar instrucciones
                                </Text>
                            )}
                        </TouchableOpacity>
                        
                        {/* Volver a login */}
                        <TouchableOpacity 
                            onPress={() => router.replace('/login')}
                            className="items-center justify-center mt-4"
                        >
                            <Text style={{ fontSize: hp(1.8) }} className="text-neutral-600">
                                Volver al inicio de sesión
                            </Text>
                        </TouchableOpacity>
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
        width: '80%',
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
        padding: 20,
        alignItems: 'center',
    },
    successIcon: {
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0891b2',
        textAlign: 'center',
        marginBottom: 8,
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
        color: '#0891b2',
        fontSize: 15,
        fontWeight: '500',
    }
});
