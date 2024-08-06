import { View, Text, TouchableOpacity, Alert, Pressable } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { supabase } from '../../lib/supabase';
import Avatar from '../../components/Avatar';

export default function Profile() {

    const onLogout = async () => {
        //setAuth(null);
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Sign Out', 'Error al cerrar sesión');
        }
    }

    const { user, setAuth } = useAuth();
    console.log('user: ', user);
    const router = useRouter();
    const handleLogout = async () => {
        Alert.alert('Confirma', 'Estás seguro que quieres cerrar sesión?', [
            {
                text: 'Cancelar',
                onPress: () => console.log('modal cancel'),
                style: 'cancel'
            },
            {
                text: 'Cerrar Sesión',
                onPress: () => onLogout(),
                style: 'destructive'
            }
        ])
    }

    return (
        <ScreenWrapper bg={'white'}>
            <UserHeader user={user} router={router} handleLogout={handleLogout} />
        </ScreenWrapper>
    )
}

const UserHeader = ({ user, router, handleLogout }) => {
    return (
        <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: hp(2) }}>
            <View>
                <Header title="Mi Perfil" mb={30} />
                <TouchableOpacity onPress={handleLogout} className='absolute right-0 p-2 rounded-lg bg-red-200'>
                    <AntDesign name="logout" size={20} color="red" />
                </TouchableOpacity>
            </View>

            <View className='flex-1'>
                <View className='gap-4'>
                    <View className='self-center' style={{ height: hp(12), width: hp(12) }}>
                        <Avatar
                            uri={user?.image}
                            size={hp(12)}
                        />
                        <Pressable
                            className='absolute p-2 bottom-0 -right-3 bg-white rounded-full shadow-md'
                            onPress={() => router.push('editProfile')}
                        >
                            <AntDesign name="edit" size={24} color="gray" />
                        </Pressable>
                    </View>

                    <View className='items-center gap-1'>
                        <Text className='font-semibold text-neutral-600' style={{ fontSize: hp(2.8) }}>{user && user.full_name}</Text>
                        <Text className='font-semibold text-neutral-500' style={{ fontSize: hp(1.6) }}>{user && user.address}</Text>
                    </View>

                    <View className='gap-2'>
                        <View className='flex flex-row items-center gap-2'>
                            <Ionicons name="mail-outline" size={20} color="black" />
                            <Text className='font-semibold text-neutral-500' style={{ fontSize: hp(1.6) }}>{user && user.email}</Text>
                        </View>

                        {
                            user && user.username && (
                                <View className='flex flex-row items-center gap-2'>
                                    <AntDesign name="user" size={20} color="black" />
                                    <Text className='font-semibold text-neutral-500' style={{ fontSize: hp(1.6) }}>{user && user.username}</Text>
                                </View>
                            )
                        }

                        {
                            user && user.bio && (
                                <Text className='font-semibold text-neutral-500' style={{ fontSize: hp(1.6) }}>{user && user.bio}</Text>
                            )
                        }
                    </View>
                </View>
            </View>
        </View>
    )
}