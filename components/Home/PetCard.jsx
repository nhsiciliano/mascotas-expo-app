import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { useRouter } from 'expo-router'
import MarkFav from '../MarkFav';

export default function PetCard({ pet }) {

    const router = useRouter();

    return (
        <TouchableOpacity
            onPress={() => router.push({
                pathname: '/pet-details',
                params: pet
            })}
            className='p-3 mr-4 mb-3 rounded-lg bg-neutral-100 border borde-1 border-lime-600'
        >
            <View className='absolute z-10 right-4 top-4'>
                <MarkFav pet={pet} />
            </View>
            <Image
                source={{ uri: pet?.imageURL }}
                style={{ width: wp(38.2), height: hp(16), objectFit: 'cover', borderRadius: 8, marginBottom: 4 }}
            />
            <Text className='font-semibold mt-1' style={{ fontSize: hp(1.8) }}>{pet?.name}</Text>
            <View className='flex flex-row mt-1 items-center justify-between'>
                <Text className='text-neutral-600 font-semibold' style={{ fontSize: hp(1.5) }}>{pet?.sex}</Text>
                <Text className='text-lime-700 bg-lime-200 px-1 rounded-lg' style={{ fontSize: hp(1.5) }}>{pet?.age}</Text>
            </View>
        </TouchableOpacity>
    )
}