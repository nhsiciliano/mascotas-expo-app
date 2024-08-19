import { ScrollView, View } from 'react-native'
import React from 'react'
import Header from '../../components/Home/Header'
import ScreenWrapper from '../../components/ScreenWrapper'
import Slider from '../../components/Home/Slider';
import PetListByCategory from '../../components/Home/PetListByCategory';

export default function HomeScreen() {


    return (
        <ScreenWrapper bg={'white'}>
            <ScrollView showsVerticalScrollIndicator={false} className='flex-1'>
                <Header />
                <Slider />
                <PetListByCategory />
            </ScrollView>
        </ScreenWrapper>
    )
}