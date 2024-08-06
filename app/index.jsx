import { View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import Loading from '../components/Loading';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function IndexPage() {
    const router = useRouter();
    return (
        <View className="flex-1 items-center justify-center">
            <Loading size={hp(16)} aspectR={1} />
        </View>
    )
}