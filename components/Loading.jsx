import { View } from 'react-native'
import React from 'react'
import LottieView from 'lottie-react-native'

export default function Loading({ size, aspectR }) {
    return (
        <View style={{ height: size, aspectRatio: aspectR }}>
            <LottieView
                style={{ flex: 1 }}
                source={require('../assets/images/loading02.json')}
                autoPlay
                loop
            />
        </View>
    )
}