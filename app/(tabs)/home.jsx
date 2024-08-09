import { View, Text, Alert, Pressable } from 'react-native'
import React from 'react'
import Header from '../../components/Home/Header'
import { MaterialCommunityIcons, Octicons, FontAwesome6 } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import Slider from '../../components/Home/Slider';

export default function HomeScreen() {


    return (
        <ScreenWrapper bg={'white'}>
            <View className='flex-1'>
                <Header/>
                <Slider/>
            </View>
        </ScreenWrapper>
    )
}