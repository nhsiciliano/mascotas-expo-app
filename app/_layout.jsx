import { Stack, useRouter } from 'expo-router'
import '../global.css'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getUserData } from '../services/userService'

export default function _layout() {
    return (
        <AuthProvider>
            <MainLayout />
        </AuthProvider>
    )
}

function MainLayout() {

    const { setAuth, setUserData } = useAuth();
    const router = useRouter();

    useEffect(() => {
        supabase.auth.onAuthStateChange((_event, session) => {
            console.log('session user: ', session?.user?.id)

            if (session) {
                setAuth(session?.user);
                updateUserData(session?.user, session?.user?.email);
                router.replace('/home');
            } else {
                setAuth(null);
                router.replace('/welcome');
            }
        })
    }, [])

    const updateUserData = async (user, email) => {
        const response = await getUserData(user?.id);
        if (response.success) setUserData({...response.data, email});
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false
            }}
        />
    )
}