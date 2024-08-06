import { StyleSheet } from 'react-native'
import React from 'react'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { Image } from 'expo-image'
import { getUserImageScr } from '../services/imageService'

export default function Avatar({
    uri,
    size = hp(4.5),
    style={}
}) {
    return (
        <Image
            source={getUserImageScr(uri)}
            transition={100}
            style={[styles.avatar, { height: size, width: size }, style]}
        />
    )
}

const styles = StyleSheet.create({
    avatar: {
        borderRadius: 12,
        borderCurve: 'continuous',
        borderColor: '#a9a9a9',
        borderWidth: 1,
    }
})