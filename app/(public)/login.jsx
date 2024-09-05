import { View, Text, TextInput, TouchableOpacity, Alert, Pressable, Image } from 'react-native'
import React, { useState, useCallback } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import Button from '../../components/Button';

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

    const onPressGoogle = useCallback(async () => {
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
        <View>
            <Image
                source={require('../../assets/images/ednapic.jpg')}
                style={{
                    width: '100%',
                    height: 500,
                }}
            />
            <View className='flex p-5 items-center gap-2'>
                <Text style={{ fontSize: hp(2.8) }} className='font-bold text-lime-900 text-center'>Listo para comenzar? Ingresa a tu cuenta</Text>
                <Text style={{ fontSize: hp(1.8) }} className='font-semibold text-neutral-500 text-center'>Adopta una mascota y dale la oportunidad de recibir el cariño y cuidado que se merece</Text>
            </View>
            <View className='flex items-center justify-center gap-2'>
                <Button title='Iniciar con Email' onPress={() => router.push('signIn')} source={require('../../assets/images/emailicon.png')} />
                <Button title='Iniciar con Google' onPress={onPressGoogle} source={require('../../assets/images/googleicon.png')} />
                <Button title='Iniciar con Facebook' source={require('../../assets/images/facebookicon.png')} />
            </View>
        </View>
    )
}