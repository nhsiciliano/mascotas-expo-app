import { View, Text, Image } from 'react-native'
import React from 'react'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import Feather from '@expo/vector-icons/Feather';

export default function OwnerInfo({ pet }) {
    return (
        <View className='flex flex-row px-5 p-2 mx-5 items-center justify-between gap-3 rounded-lg bg-white border-2 border-lime-700'>
            <View className='flex flex-row gap-5'>
                <Image
                    source={{ uri: pet?.userimage }}
                    style={{
                        width: hp(5.4),
                        height: hp(5.4),
                        borderRadius: 99,
                    }}
                />
                <View className='justify-center'>
                    <Text style={{ fontSize: hp(1.8) }} className='font-semibold'>{pet?.username}</Text>
                    <Text className='text-neutral-600 font-normal'>{pet?.useremail}</Text>
                </View>
            </View>
            <Feather name="send" size={24} color="darkgreen" />
        </View>
    )
}