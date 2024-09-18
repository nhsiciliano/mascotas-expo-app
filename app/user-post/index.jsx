import { View, Text, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useUser } from '@clerk/clerk-expo'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../config/FirebaseConfig'
import PetCard from '../../components/Home/PetCard'
import { useRouter } from 'expo-router';

export default function UserPost() {

    const { user } = useUser();
    const router = useRouter();
    const [loader, setLoader] = useState(false);
    const [userPostList, setUserPostList] = useState([]);

    useEffect(() => {
        user && getUserPost();
    }, [user])

    const getUserPost = async () => {
        setLoader(true);
        setUserPostList([]);
        const q = query(collection(db, 'Pets'), where('useremail', '==', user?.primaryEmailAddress?.emailAddress))
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            setUserPostList(prev => [...prev, doc.data()])
        })
        setLoader(false);
    }

    const onDeletePost = (docId) => {
        Alert.alert('Estas seguro que quieres eliminar esta adopción?', 'Al eliminarla dejará de estar visible para todos los usuarios que quieran adoptar', [
            {
                text: 'Aceptar',
                onPress: () => deletePost(docId),
                style: 'default',
            },
            {
                text: 'Cancelar',
                onPress: () => console.log('Cancelar'),
                style: 'cancel',
            }
        ])
    }

    const deletePost = async (docId) => {
        await deleteDoc(doc(db, 'Pets', docId));
        getUserPost();
    }

    return (
        <View className='p-4 mt-12'>
            <View className='flex flex-row items-center gap-10'>
                <Pressable onPress={() => router.push('/(tabs)/profile')}>
                    <AntDesign name="arrowleft" size={24} color="darkgreen" />
                </Pressable>
                <Text style={{ fontSize: hp(2.6) }} className='font-bold text-lime-800'>Mis adopciones creadas</Text>
            </View>
            <View className='flex flex-row mt-2 items-center gap-2'>
                <AntDesign name="infocirlceo" size={20} color="black" />
                <View className='p-2'>
                    <Text style={{ fontSize: hp(1.4) }} className='font-semibold text-neutral-600'>Haz click en Mascota Adoptada una vez que hayas concretado la adopción.</Text>
                </View>
            </View>
            {
                loader ? (
                    <ActivityIndicator size={'small'} color={'darkgreen'} style={{ paddingVertical: 48 }} />
                ) : (
                    <>
                        {
                            userPostList?.length >= 1 ? (
                                <FlatList
                                    data={userPostList}
                                    refreshing={loader}
                                    onRefresh={getUserPost}
                                    numColumns={2}
                                    style={{ marginVertical: 16 }}
                                    renderItem={({ item }) => (
                                        <View className='flex items-center justify-center'>
                                            <PetCard pet={item} key={item?.id} />
                                            <Pressable onPress={() => onDeletePost(item.id)} style={{ marginRight: 14 }} className='bg-lime-200 w-[92%] p-2 rounded-lg mt-1'>
                                                <Text style={{ fontSize: hp(1.6) }} className='font-semibold text-lime-700 text-center'>Mascota Adoptada</Text>
                                            </Pressable>
                                        </View>
                                    )}
                                />
                            ) : (
                                <View className='my-8'>
                                    <Text style={{ fontSize: hp(2.2) }} className='text-center font-semibold'>Aún no has creado ninguna adopción</Text>
                                    <Text style={{ fontSize: hp(1.8) }} className='text-center text-neutral-600 font-semibold mt-3'>Muchas personas cerca tuyo están buscando adoptar un nuevo amigo</Text>
                                    <Pressable
                                        className='flex flex-row items-center justify-center gap-3 my-6 border border-1 border-lime-700 p-3 rounded-lg bg-lime-100'
                                        onPress={() => router.push('/(tabs)/addpet')}
                                    >
                                        <Ionicons name="add-circle" size={24} color="darkgreen" />
                                        <Text style={{ fontSize: hp(2.2) }} className='font-semibold text-lime-800'>Crear nueva adopción</Text>
                                    </Pressable>
                                </View >
                            )

                        }
                    </>
                )
            }
        </View >
    )
}