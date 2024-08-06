import { View, Text, Image, TextInput, TouchableOpacity, Alert, Pressable } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { Octicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Loading from '../components/Loading';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useRouter } from 'expo-router';
import WelcomeAnimation from '../components/WelcomeAnimation';
import ScreenWrapper from '../components/ScreenWrapper';

export default function SignIn() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const onSubmitSignIn = async () => {
        setLoading(true)
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        //console.log('session: ', session)
        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    return (
        <ScreenWrapper bg={'#d9f99d'}>
            <CustomKeyboardView>
                <StatusBar style='dark' />
                <View style={{ paddingTop: hp(4), paddingHorizontal: wp(5) }} className="flex-1 gap-24">
                    <View className="items-center">
                        <WelcomeAnimation 
                            size={hp(38)} 
                            source={require('../assets/images/catsintro.json')}
                        />
                    </View>

                    <View className="gap-10">
                        <View className="gap-4">
                            <View style={{ height: hp(7) }} className="flex-row gap-4 px-4 bg-lime-100 items-center rounded-xl">
                                <Octicons name='mail' size={hp(2.7)} color="gray" />
                                <TextInput
                                    onChangeText={(text) => setEmail(text)}
                                    value={email}
                                    style={{ fontSize: hp(2) }}
                                    className="flex-1 font-semibold text-neutral-700 first-letter:lowercase"
                                    placeholder='Email'
                                    autoCapitalize={'none'}
                                    placeholderTextColor={'gray'}
                                />
                            </View>
                            <View className="gap-3">
                                <View style={{ height: hp(7) }} className="flex-row gap-4 px-4 bg-lime-100 items-center rounded-xl">
                                    <Octicons name='lock' size={hp(2.7)} color="gray" />
                                    <TextInput
                                        onChangeText={(text) => setPassword(text)}
                                        value={password}
                                        style={{ fontSize: hp(2) }}
                                        className="flex-1 font-semibold text-neutral-700 first-letter:lowercase"
                                        placeholder='Contraseña'
                                        secureTextEntry
                                        placeholderTextColor={'gray'}
                                    />
                                </View>
                                <Text style={{ fontSize: hp(1.8) }} className="font-semibold text-right text-yellow-500">¿Olvidaste tu contraseña?</Text>
                            </View>

                            <View>
                                {
                                    loading ? (
                                        <View className="flex-row justify-center">
                                            <Loading size={hp(8.5)} aspectR={1} />
                                        </View>
                                    ) : (
                                        <View>
                                            <TouchableOpacity
                                                style={{ height: hp(5.5) }}
                                                className="bg-lime-600 rounded-xl justify-center items-center"
                                                onPress={onSubmitSignIn}
                                            >
                                                <Text style={{ fontSize: hp(2.7) }} className="text-white font-bold tracking-wider">
                                                    Iniciar Sesión
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }
                            </View>

                            <View className="flex-row justify-center gap-2">
                                <Text style={{ fontSize: hp(1.8) }} className="font-semibold text-neutral-500">¿No tienes una cuenta?</Text>
                                <Pressable
                                    onPress={() => router.push('signUp')}
                                >
                                    <Text style={{ fontSize: hp(1.8) }} className="font-bold text-lime-700">Crear cuenta</Text>
                                </Pressable>
                            </View>

                            
                        </View>
                    </View>
                </View>
            </CustomKeyboardView>
        </ScreenWrapper>
    )
}