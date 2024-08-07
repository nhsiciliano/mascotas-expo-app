import { View, Text, TextInput, TouchableOpacity, Alert, Pressable } from 'react-native'
import React, { useState, useCallback } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { Octicons } from '@expo/vector-icons';
import Loading from '../components/Loading';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Link } from 'expo-router'
import { useOAuth } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import WelcomeAnimation from '../components/WelcomeAnimation';
import ScreenWrapper from '../components/ScreenWrapper';

export const useWarmUpBrowser = () => {
    React.useEffect(() => {
        // Warm up the android browser to improve UX
        // https://docs.expo.dev/guides/authentication/#improving-user-experience
        void WebBrowser.warmUpAsync()
        return () => {
            void WebBrowser.coolDownAsync()
        }
    }, [])
}
WebBrowser.maybeCompleteAuthSession()

export default function SignIn() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useWarmUpBrowser()

    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })

    const onPress = useCallback(async () => {
        try {
            const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
                redirectUrl: Linking.createURL('/(tabs)/home', { scheme: 'myapp' }),
            })

            if (createdSessionId) {
                
            } else {
                // Use signIn or signUp for next steps such as MFA
            }
        } catch (err) {
            console.error('OAuth error', err)
        }
    }, [])



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
                                                onPress={() => console.log('Init')}
                                            >
                                                <Text style={{ fontSize: hp(2.7) }} className="text-white font-bold tracking-wider">
                                                    Iniciar Sesión
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }
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
                                                onPress={onPress}
                                            >
                                                <Text style={{ fontSize: hp(2.7) }} className="text-white font-bold tracking-wider">
                                                    Iniciar con Google
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