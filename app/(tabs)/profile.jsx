import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {

    const Menu = [
        {
            id: 1,
            name: 'Crear adopción',
            icon: 'add-circle',
            path: '/(tabs)/addpet',
        },
        {
            id: 2,
            name: 'En adopción',
            icon: 'bookmark',
            path: '/user-post',
        },
        {
            id: 3,
            name: 'Favoritos',
            icon: 'heart',
            path: '/(tabs)/favourite',
        },
        {
            id: 4,
            name: 'Mis chats',
            icon: 'chatbubble',
            path: '/(tabs)/chat',
        }
    ]

    const { user } = useUser();
    const router = useRouter();
    const { signOut } = useAuth();

    const onPressMenu = (menu) => {
        router.push(menu.path);
    }

    const logOut = () => {
        signOut();
    }

    return (
        <ScreenWrapper>
            <Text style={{ fontSize: hp(2.6) }} className='font-bold text-lime-800 text-center'>Mi Perfil</Text>
            <View className='flex items-center my-7'>
                <Image
                    source={{ uri: user?.imageUrl }}
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 99,
                    }}
                />
                <Text className='font-bold mt-3' style={{ fontSize: hp(2.1) }}>{user?.fullName}</Text>
                <Text className='font-semibold text-neutral-600'>{user?.primaryEmailAddress?.emailAddress}</Text>
            </View>
            <FlatList
                data={Menu}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        key={item?.id}
                        className='my-3 flex flex-row items-center gap-3 bg-white rounded-lg p-2'
                        onPress={() => onPressMenu(item)}
                    >
                        <View className='rounded-lg bg-lime-300'>
                            <Ionicons
                                name={item?.icon}
                                size={32}
                                color={'darkgreen'}
                                style={{
                                    padding: 10,
                                }}
                            />
                        </View>
                        <Text className='font-semibold' style={{ fontSize: hp(2) }}>{item?.name}</Text>
                    </TouchableOpacity>
                )}
            />
            <TouchableOpacity 
                className='flex flex-row items-center gap-3 bg-white rounded-lg p-2 mb-4'
                onPress={logOut}    
            >
                <View className='rounded-lg bg-lime-300'>
                    <Ionicons
                        name='exit'
                        size={32}
                        color={'darkgreen'}
                        style={{
                            padding: 10,
                        }}
                    />
                </View>
                <Text className='font-semibold' style={{ fontSize: hp(2) }}>Cerrar sesión</Text>
            </TouchableOpacity>
        </ScreenWrapper>
    )
}