import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import PetInfo from '../../components/PetDetails/PetInfo';
import PetSubinfo from '../../components/PetDetails/PetSubinfo';
import About from '../../components/PetDetails/About';
import OwnerInfo from '../../components/PetDetails/OwnerInfo';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function PetDetailsScreen() {

    const pet = useLocalSearchParams();
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerTransparent: true,
        })
    }, [])

    return (
        <View>
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                <PetInfo pet={pet} />
                <PetSubinfo pet={pet} />
                <About pet={pet} />
                <OwnerInfo pet={pet} />
                <View style={{ height: 100 }}></View>
            </ScrollView>
            <View className='absolute w-full bottom-3'>
                <TouchableOpacity className='p-5 bg-lime-200'>
                    <Text style={{ fontSize: hp(2.6) }} className='text-center font-semibold text-lime-800'>Adoptar a {pet?.name}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}