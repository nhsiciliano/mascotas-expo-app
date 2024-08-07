import { Stack } from 'expo-router'
import '../global.css'
import * as SecureStore from 'expo-secure-store'
import { ClerkProvider } from '@clerk/clerk-expo'

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

export default function RootLayout() {

    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <Stack
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen name='index' />
                <Stack.Screen name='welcome' />
                <Stack.Screen name='login' />
                <Stack.Screen name='signUp' />
                <Stack.Screen name='(tabs)' />
            </Stack>
        </ClerkProvider>
    )
}