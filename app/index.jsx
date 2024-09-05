import { ActivityIndicator, View } from 'react-native'
import React from 'react'

export default function IndexPage() {

    return (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={'large'} color={'darkgreen'}/>
        </View>
    )
}