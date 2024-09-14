import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { getFavList } from '../../shared/shared'
import { useUser } from '@clerk/clerk-expo'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../config/FirebaseConfig'
import PetCard from '../../components/Home/PetCard'

export default function FavouriteScreen() {

    const { user } = useUser();
    const [favIds, setFavIds] = useState([]);
    const [favPetList, setFavPetList] = useState([]);
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        user && getFavPetId();
    }, [user])

    const getFavPetId = async () => {
        setLoader(true);
        const result = await getFavList(user);
        setFavIds(result?.favorites)
        console.log('Result: ', favPetList)
        getFavPetList(result?.favorites);
        setLoader(false);
    }

    const getFavPetList = async (favId_) => {
        setLoader(true);
        setFavPetList([]);
        const q = query(collection(db, 'Pets'), where('id', 'in', favId_));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            setFavPetList(prev => [...prev, doc.data()])
        })
        setLoader(false);
    }

    return (
        <ScreenWrapper>
            <View>
                <Text style={{ fontSize: hp(2.6) }} className='font-bold text-lime-800 text-center'>Favoritos</Text>
                {
                    loader ? (
                        <ActivityIndicator size={'small'} color={'darkgreen'} style={{ paddingVertical: 48 }}/>
                    ) : (
                        <>
                            {
                                favPetList?.length >= 1 ? (
                                    <FlatList
                                        data={favPetList}
                                        onRefresh={getFavPetId}
                                        refreshing={loader}
                                        style={{ marginTop: 18 }}
                                        numColumns={2}
                                        renderItem={({ item, index }) => (
                                            <View>
                                                <PetCard pet={item} />
                                            </View>
                                        )}
                                    />
                                ) : (
                                    <View className='my-8'>
                                        <Text style={{ fontSize: hp(2.2) }} className='text-center font-semibold'>Aún no has agregado a favoritos</Text>
                                        <Text style={{ fontSize: hp(1.8) }} className='text-center text-neutral-600 font-semibold mt-3'>Busca cerca tuyo una mascota que esté en adopción y dale una oportunidad</Text>
                                    </View >
                                )
                            }
                        </>
                    )
                }
            </View>
        </ScreenWrapper>
    )
}