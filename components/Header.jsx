import { View, Text } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import BackButton from './BackButton'

export default function Header({ title, showBackButtom = true, mb = 10 }) {

    const router = useRouter()

    return (
        <View className='flex flex-row justify-center items-center mt-1 gap-3' style={{ marginBottom: mb }}>
            {
                showBackButtom && (
                    <View className='absolute left-0'>
                        <BackButton router={router}/>
                    </View>
                )
            }
            <Text className='font-semibold text-neutral-500' style={{ fontSize: hp(2.7) }}>{title || ''}</Text>
        </View>
    )
}