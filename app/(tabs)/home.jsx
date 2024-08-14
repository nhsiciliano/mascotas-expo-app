import { View, Text } from 'react-native'
import React from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Header from '../../components/Home/Header'
import ScreenWrapper from '../../components/ScreenWrapper'
import Slider from '../../components/Home/Slider';
import PetListByCategory from '../../components/Home/PetListByCategory';

export default function HomeScreen() {


    return (
        <ScreenWrapper bg={'white'}>
            <View className='flex-1'>
                <Header />
                <Slider />
                <PetListByCategory />
                <View className='flex flex-row items-center justify-center p-5 mt-3 gap-3 bg-lime-100 border border-1 border-lime-600 rounded-lg'>
                    <MaterialIcons name="pets" size={24} color="darkgreen" />
                    <Text className='text-lime-800'>Crear nueva adopción</Text>
                </View>
            </View>
        </ScreenWrapper>
    )
}