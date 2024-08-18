import { View, Text, Image, Pressable, Platform } from 'react-native'
import React from 'react'
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { useRouter } from 'expo-router';
import MarkFav from '../MarkFav';

export default function PetInfo({ pet }) {
    const router = useRouter();
    const ios = Platform.OS = 'ios';
    return (
        <View>
            <Image
                source={{ uri: pet?.imageURL }}
                style={{
                    width: '100%',
                    height: hp(47),
                    objectFit: 'cover',
                }}
            />
            <Pressable className={`absolute ${ios ? 'flex' : 'hidden'} top-16 left-6 bg-white rounded-xl p-2 border border-1 border-lime-600`} onPress={() => router.back()}>
                <AntDesign name="arrowleft" size={20} color="darkgreen" />
            </Pressable>
            <View className='p-5 flex flex-row items-center justify-between'>
                <View className='gap-1'>
                    <Text className='font-bold' style={{ fontSize: hp(2.7) }}>{pet?.name}</Text>
                    <Text className='text-lime-700 bg-lime-200 px-1 rounded-lg' style={{ fontSize: hp(1.6) }}>{pet?.address}</Text>
                </View>
                <MarkFav pet={pet} />
            </View>
        </View>
    )
}