import { View } from 'react-native'
import React from 'react'
import LottieView from 'lottie-react-native'

export default function WelcomeAnimation({ size, source }) {
    return (
        <View style={{ height: size, aspectRatio: 1 }}>
            <LottieView
                style={{ flex: 1 }}
                source={source}
                autoPlay
                loop
            />
        </View>
    )
}