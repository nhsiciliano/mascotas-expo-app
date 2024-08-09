import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '../../config/FirebaseConfig'

export default function Slider() {

    useEffect(() => {
        getSliders();
    }, [])

    const getSliders = async () => {
        const snapshot = await getDocs(collection(db, 'Sliders'));
        snapshot.forEach((doc) => {
            console.log(doc.data())
        })
    }

    return (
        <View>
            <Text>Slider</Text>
        </View>
    )
}