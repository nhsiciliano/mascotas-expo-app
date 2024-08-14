import { View, Text, Image } from 'react-native'
import React from 'react'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'

export default function PetSubInfoCard({ icon, title, value }) {
    return (
        <View className='flex flex-row flex-1 items-center p-3 m-1 gap-2 bg-white border-[2px] border-lime-600 rounded-lg'>
            <Image
                source={icon}
                style={{
                    width: hp(5),
                    height: hp(5),
                    tintColor: 'darkgreen',
                }}
            />
            <View>
                <Text className='text-neutral-600 text-[14px]'>{title}</Text>
                <Text className='font-bold' style={{ fontSize: hp(2.2) }}>{value}</Text>
            </View>
        </View>
    )
}