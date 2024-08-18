import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { getFavList } from '../../shared/shared'
import { useUser } from '@clerk/clerk-expo'
import { collection, doc, getDocs, query, where } from 'firebase/firestore'
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
        setLoader(false);
        console.log('Result: ', favPetList)
        getFavPetList(result?.favorites);
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
                <Text className='font-semibold' style={{ fontSize: hp(2.8) }}>Favoritos</Text>
                <FlatList
                    data={favPetList}
                    onRefresh={getFavPetId}
                    refreshing={loader}
                    style={{ marginTop: 18 }}
                    numColumns={2}
                    renderItem={({ item, index }) => (
                        <View>
                            <PetCard pet={item}/>
                        </View>
                    )}      
                />
            </View>
        </ScreenWrapper>
    )
}