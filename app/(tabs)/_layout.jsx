import React from 'react'
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo';

export default function _layout() {

    const { isSignedIn } = useAuth();

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
                redirect={!isSignedIn}
            />
            <Tabs.Screen name='favourite'
                options={{
                    title: 'Favoritos',
                    tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />
                }}
                redirect={!isSignedIn}
            />
            <Tabs.Screen name='addpet'
                options={{
                    title: 'Crear',
                    tabBarIcon: ({ color }) => <MaterialIcons name="pets" size={24} color={color} />
                }}
                redirect={!isSignedIn}
            />
            <Tabs.Screen name='chat'
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color }) => <Ionicons name="chatbox-ellipses" size={24} color={color} />
                }}
                redirect={!isSignedIn}
            />
            <Tabs.Screen name='profile'
                options={{
                    title: 'Mi Perfil',
                    tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />
                }}
                redirect={!isSignedIn}
            />
        </Tabs>
    )
}