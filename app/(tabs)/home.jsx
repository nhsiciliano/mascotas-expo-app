import { View, Text, Alert, Pressable } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons, Octicons, FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase';
import ScreenWrapper from '../../components/ScreenWrapper'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import Avatar from '../../components/Avatar';

export default function HomeScreen() {

    const { setAuth, user } = useAuth();
    const router = useRouter();

    const onLogout = async () => {
        setAuth(null);
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Sign Out', 'Error al cerrar sesión');
        }
    }

    return (
        <ScreenWrapper bg={'#d9f99d'}>
            <View className='flex-1'>
                <View style={{ marginHorizontal: wp(4) }} className='flex flex-row items-center justify-between mb-2'>
                    <Text style={{ fontSize: hp(3.2) }} className='font-bold text-teal-700'>
                        AR
                    </Text>
                    <View className='flex flex-row items-center justify-center gap-5'>
                        <Pressable onPress={() => router.push('notifications')}>
                            <MaterialCommunityIcons name="heart-outline" size={hp(3.2)} color="black" />
                        </Pressable>
                        <Pressable onPress={() => router.push('newPost')}>
                            <Octicons name="diff-added" size={hp(3)} color="black" />
                        </Pressable>
                        <Pressable onPress={() => router.push('profile')}>
                            <Avatar
                                uri={user?.image}
                                size={hp(4.3)}
                                style={{ borderWidth: 2 }}
                            />
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    )
}