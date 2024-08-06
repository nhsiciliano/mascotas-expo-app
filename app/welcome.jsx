import { View, Text, Image } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import WelcomeAnimation from '../components/WelcomeAnimation';
import ScreenWrapper from '../components/ScreenWrapper';

export default function WelcomeScreen() {

    const router = useRouter();

    return (
        <ScreenWrapper>
            <StatusBar style='dark' />
            <View style={{ paddingTop: hp(8), paddingHorizontal: wp(5) }} className="flex-1 gap-12">
                <View className="items-center">
                    <WelcomeAnimation 
                        size={hp(38)} 
                        source={require('../assets/images/animationdog.json')} 
                    />
                </View>
                <View className='items-center gap-12'>
                    <Text style={{ fontSize: hp(3.5) }} className="font-bold tracking-wider text-center text-yellow-700">Adopcion Responsable</Text>
                    <Text style={{ fontSize: hp(2.2) }} className='font-semibold text-center text-neutral-700'>App de uso gratuito que tiene como objetivo facilitar y agilizar
                        la conexión entre individuos o refugios con personas que están buscando adoptar
                        una mascota de forma responsable.
                    </Text>
                </View>
                <Button title='Ingresar a Mi Cuenta' buttonStyle={{ marginHorizontal: wp(3) }} onPress={() => router.push('login')} />
            </View>
        </ScreenWrapper>
    )
}