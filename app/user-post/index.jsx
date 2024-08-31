import { View, Text, FlatList, Pressable, Alert, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useUser } from '@clerk/clerk-expo'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AntDesign } from '@expo/vector-icons';
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
        <View className='p-5 mt-12'>
            <View className='flex flex-row items-center gap-10'>
                <Pressable onPress={() => router.back()}>
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
            <FlatList
                data={userPostList}
                refreshing={loader}
                onRefresh={getUserPost}
                numColumns={2}
                renderItem={({ item }) => (
                    <View>
                        <PetCard pet={item} key={item?.id} />
                        <Pressable onPress={() => onDeletePost(item.id)} className='bg-lime-200 p-2 rounded-lg mt-1 mr-2'>
                            <Text style={{ fontSize: hp(1.8) }} className='font-semibold text-lime-700 text-center'>Mascota Adoptada</Text>
                        </Pressable>
                    </View>
                )}
            />
            {
                userPostList?.length == 0 &&
                <View className='mb-1'>
                    <Text>Aún no has creado ninguna adopcíon</Text>
                </View>
            }
        </View>
    )
}