import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

export default function _layout() {

    return (
        <Tabs
            screenOptions={{
                headerShown: false
            }}
        >
            <Tabs.Screen name='home' />
            <Tabs.Screen name='favourite' />
            <Tabs.Screen name='chat' />
            <Tabs.Screen name='profile' />
        </Tabs>
    )
}