import { View, Text, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import Button from '../../components/Button';

WebBrowser.maybeCompleteAuthSession()

export default function SignIn() {

    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [loadingFacebook, setLoadingFacebook] = useState(false);
    const [loadingApple, setLoadingApple] = useState(false);
    const [loadingMicrosoft, setLoadingMicrosoft] = useState(false);

    const googleOAuth = useOAuth({ strategy: "oauth_google" })
    const facebookOAuth = useOAuth({ strategy: "oauth_facebook" })
    const appleOAuth = useOAuth({ strategy: "oauth_apple" })
    const microsoftOAuth = useOAuth({ strategy: "oauth_microsoft" })

    // Acceso con Google OAuth
    const onPressGoogle = async () => {
        try {
            setLoadingGoogle(true)
            const redirectUrl = Linking.createURL("/(tabs)/home")
            const oAuthFlow = await googleOAuth.startOAuthFlow({ redirectUrl })

            if (oAuthFlow.authSessionResult?.type === 'success') {
                if (oAuthFlow.setActive) {
                    await oAuthFlow.setActive({ session: oAuthFlow.createdSessionId })
                }
            } else {
                setLoadingGoogle(false)
            }
        } catch (error) {
            console.log(error)
            setLoadingGoogle(false)
        }
    }

    // Acceso con Facebook OAuth
    const onPressFacebook = async () => {
        try {
            setLoadingFacebook(true)
            const redirectUrl = Linking.createURL("/(tabs)/home")
            const oAuthFlow = await facebookOAuth.startOAuthFlow({ redirectUrl })

            if (oAuthFlow.authSessionResult?.type === 'success') {
                if (oAuthFlow.setActive) {
                    await oAuthFlow.setActive({ session: oAuthFlow.createdSessionId })
                }
            } else {
                setLoadingFacebook(false)
            }
        } catch (error) {
            console.log(error)
            setLoadingFacebook(false)
        }
    }

    // Acceso con Microsoft OAuth
    const onPressMicrosoft = async () => {
        try {
            setLoadingMicrosoft(true)
            const redirectUrl = Linking.createURL("/(tabs)/home")
            const oAuthFlow = await microsoftOAuth.startOAuthFlow({ redirectUrl })

            if (oAuthFlow.authSessionResult?.type === 'success') {
                if (oAuthFlow.setActive) {
                    await oAuthFlow.setActive({ session: oAuthFlow.createdSessionId })
                }
            } else {
                setLoadingMicrosoft(false)
            }
        } catch (error) {
            console.log(error)
            setLoadingMicrosoft(false)
        }
    }

    // Acceso con Apple OAuth
    const onPressApple = async () => {
        try {
            setLoadingApple(true)
            const redirectUrl = Linking.createURL("/(tabs)/home")
            const oAuthFlow = await appleOAuth.startOAuthFlow({ redirectUrl })

            if (oAuthFlow.authSessionResult?.type === 'success') {
                if (oAuthFlow.setActive) {
                    await oAuthFlow.setActive({ session: oAuthFlow.createdSessionId })
                }
            } else {
                setLoadingApple(false)
            }
        } catch (error) {
            console.log(error)
            setLoadingApple(false)
        }
    }

    useEffect(() => {
        WebBrowser.warmUpAsync()

        return () => {
            WebBrowser.coolDownAsync()
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
                <Text style={{ fontSize: hp(2.6) }} className='font-bold text-lime-900 text-center'>¿Listo para comenzar?</Text>
            </View>
            <View className='flex items-center justify-center gap-2'>
                <Button title='Iniciar con Google' onPress={onPressGoogle} source={require('../../assets/images/googleicon.png')} isLoading={loadingGoogle} />
                <Button title='Iniciar con Facebook' onPress={onPressFacebook} source={require('../../assets/images/facebookicon.png')} isLoading={loadingFacebook} />
                <Button title='Iniciar con Microsoft' onPress={onPressMicrosoft} source={require('../../assets/images/microsofticon.png')} isLoading={loadingMicrosoft} />
                <Button title='Iniciar con Apple' onPress={onPressApple} source={require('../../assets/images/appleicon.png')} isLoading={loadingApple} />
            </View>
        </View>
    )
}