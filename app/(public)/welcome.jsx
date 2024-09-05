import { View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import WelcomeAnimation from '../../components/WelcomeAnimation';
import Onboarding from 'react-native-onboarding-swiper';

export default function WelcomeScreen() {

    const router = useRouter();

    const handleDone = () => {
        router.push('login');
    }

    return (
        <View className='flex-1'>
            <Onboarding
            onDone={handleDone}
            onSkip={handleDone}
            titleStyles={{ fontWeight: 'bold' }}
            subTitleStyles={{ fontWeight: '600' }}
            nextLabel={'Siguiente'}
            skipLabel={'Saltar'}
            containerStyles={{ paddingHorizontal: 16 }}
                pages={[
                    {
                        backgroundColor: '#fff0f5',
                        image: <WelcomeAnimation
                            size={hp(40)}
                            source={require('../../assets/images/welcome01.json')}
                        />,
                        title: 'ADOPCION RESPONSABLE',
                        subtitle: 'App de uso gratuito que tiene como objetivo facilitar y agilizar la conexión entre individuos o refugios con personas que están buscando adoptar una mascota de forma responsable',
                    },
                    {
                        backgroundColor: '#ffffe0',
                        image: <WelcomeAnimation
                            size={hp(42)}
                            source={require('../../assets/images/welcome02.json')}
                        />,
                        title: 'LOS CUATRO PILARES',
                        subtitle: 'Tener una mascota requiere de responsabilidad, compromiso, tiempo y recursos. Si crees que no dispones de estos cuatro requisitos fundamentales por favor no adoptes. De lo contrario, sigue adelante y date la oportunidad de adoptar',
                    },
                    {
                        backgroundColor: '#e6e6fa',
                        image: <WelcomeAnimation
                            size={hp(42)}
                            source={require('../../assets/images/welcome03.json')}
                        />,
                        title: 'ADOPTA, NO COMPRES',
                        subtitle: 'Miles de animales están esperando una oportunidad en refugios u hogares de tránsito. Tenes la oportunidad de darles todo el cariño y cuidado que necesitan. Ellos te devolverán lo mismo',
                    },
                ]}
            />
        </View>
    )
}