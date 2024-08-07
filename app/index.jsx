import { View } from 'react-native'
import React, { useEffect } from 'react'
import { Redirect, useRootNavigationState } from 'expo-router'
import Loading from '../components/Loading';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useUser } from '@clerk/clerk-expo';

export default function IndexPage() {

    const { user } = useUser();

    const useNavigationState = useRootNavigationState();

    useEffect(() => {
        checkNavLoaded();
    }, [])

    const checkNavLoaded = () => {
        if (!useNavigationState)
            return null
    }

    return user && (
        <View className="flex-1 items-center justify-center">
            {
                user ? 
                <Redirect href={'/(tabs)/home'} /> :
                <Redirect href={'login'} />
            }
        </View>
    )
}