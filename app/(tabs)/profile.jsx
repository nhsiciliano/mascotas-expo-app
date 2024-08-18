import { View, Text, Pressable } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'

export default function ProfileScreen() {

    const logOut = () => {
        console.log("Out")
    }

    return (
        <ScreenWrapper>
            <View>
                <Text>ProfileScreen</Text>
                <Pressable onPress={logOut}>
                    <Text>Cerrar Sesión</Text>
                </Pressable>
            </View>
        </ScreenWrapper>
    )
}