import '../global.css'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect } from 'react'
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { Slot, useRouter, useSegments } from "expo-router";

const tokenCache = {
    async getToken(key) {
        try {
            const item = await SecureStore.getItemAsync(key)
            if (item) {
                console.log(`${key} was used 🔐 \n`)
            } else {
                console.log('No values stored under key: ' + key)
            }
            return item
        } catch (error) {
            console.error('SecureStore get item error: ', error)
            await SecureStore.deleteItemAsync(key)
            return null
        }
    },
    async saveToken(key, value) {
        try {
            return SecureStore.setItemAsync(key, value)
        } catch (err) {
            return
        }
    },
}

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
    throw new Error(
        'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
    )
}

const InitialLayout = () => {
    const { isLoaded, isSignedIn } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    // Watch user status to redirect
    useEffect(() => {
        if (!isLoaded) return;

        // No need to redirect again if in auth section
        const inTabsGroup = segments[0] === "(tabs)";

        if (isSignedIn && !inTabsGroup) {
            router.replace("/(tabs)/home");
        } else if (!isSignedIn) {
            router.replace("/(public)/welcome");
        }
    }, [isSignedIn]);

    // Slot will render the current child route, think of this like the children prop in React.
    // This component can be wrapped with other components to create a layout.
    return <Slot />;
};

export default function RootLayout() {

    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <InitialLayout />
        </ClerkProvider>
    )
}