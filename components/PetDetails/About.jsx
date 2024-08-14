import { View, Text } from 'react-native'
import React from 'react'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'

export default function About({ pet }) {
    return (
        <View className='p-5'>
            <Text style={{ fontSize: hp(2) }} className='font-bold mb-2'>Sobre {pet?.name}</Text>
            <Text style={{ fontSize: hp(1.6) }} className='font-semibold text-neutral-700'>{pet?.about}</Text>
        </View>
    )
}