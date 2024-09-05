import { View, Text, FlatList, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import Category from './Category'
import { db } from '../../config/FirebaseConfig'
import PetCard from './PetCard'

export default function PetListByCategory() {

    const [petList, setPetList] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getPetList('Gato');
    }, [])

    const getPetList = async (category) => {
        setLoading(true)
        setPetList([]);
        const q = query(collection(db, 'Pets'), where('category', '==', category));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            setPetList(petList => [...petList, doc.data()])
        })
        setLoading(false)
    }

    return (
        <View>
            <Category category={(value) => getPetList(value)} />
            {
                loading ? (
                    <ActivityIndicator size={'small'} color={'darkgreen'} style={{ paddingVertical: 48 }} />
                ) : (
                    <FlatList
                        data={petList}
                        numColumns={2}
                        scrollEnabled={false}
                        style={{ marginTop: 10 }}
                        renderItem={({ item, index }) => (
                            <PetCard pet={item} key={index} />
                        )}
                    />
                )
            }
        </View>
    )
}