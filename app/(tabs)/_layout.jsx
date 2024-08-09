import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router'

export default function _layout() {

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#006400'
            }}
        >
            <Tabs.Screen name='home'
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />
                }}
            />
            <Tabs.Screen name='favourite'
                options={{
                    title: 'Favoritos',
                    tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />
                }}
            />
            <Tabs.Screen name='chat'
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color }) => <Ionicons name="chatbox-ellipses" size={24} color={color} />
                }}
            />
            <Tabs.Screen name='profile'
                options={{
                    title: 'Mi Perfil',
                    tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />
                }}
            />
        </Tabs>
    )
}