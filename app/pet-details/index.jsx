import { View, Text, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import PetInfo from '../../components/PetDetails/PetInfo';
import PetSubinfo from '../../components/PetDetails/PetSubinfo';
import About from '../../components/PetDetails/About';
import OwnerInfo from '../../components/PetDetails/OwnerInfo';

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
                <View style={{ height: 70 }}></View>
            </ScrollView>
        </View>
    )
}