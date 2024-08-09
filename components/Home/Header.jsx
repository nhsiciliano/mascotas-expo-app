import { View, Text } from 'react-native'
import React from 'react'
import { useUser } from '@clerk/clerk-expo';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Image } from 'react-native';

export default function Header() {

    const { user } = useUser()

    return (
        <View className='flex flex-row justify-between items-center'>
            <View>
                <Text style={{ fontSize: hp(2) }} className='font-semibold text-lime-800'>Bienvenido,</Text>
                <Text style={{ fontSize: hp(2.4) }} className='font-bold'>{user?.fullName}</Text>
            </View>
            <Image
                source={{ uri: user?.imageUrl }}
                style={{ height: 45, width: 45 }}
                className='rounded-full'
            />
        </View>
    )
}