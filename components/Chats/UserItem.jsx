import { View, Text, Image } from 'react-native'
import React from 'react'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { Link } from 'expo-router'

export default function UserItem({ userInfo }) {
    return (
        <Link href={'/chat-details?id=' + userInfo.docId}>
            <View className='flex flex-row items-center gap-2 my-2'>
                <Image
                    source={{ uri: userInfo?.imageUrl }}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 99,
                    }}
                />
                <Text style={{ fontSize: hp(1.8) }} className='font-semibold'>{userInfo?.name}</Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', width: wp(90), borderWidth: 0.5, marginVertical: 7, borderColor: 'darkgreen' }}>
            </View>
        </Link>
    )
}