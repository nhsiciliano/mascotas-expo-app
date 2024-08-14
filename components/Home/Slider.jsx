import { View, Text, FlatList, Image, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '../../config/FirebaseConfig'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Slider() {

    const [sliderList, setSliderList] = useState([]);

    useEffect(() => {
        getSliders();
    }, [])

    const getSliders = async () => {
        setSliderList([]);
        const snapshot = await getDocs(collection(db, 'Sliders'));
        snapshot.forEach((doc) => {
            setSliderList(sliderList => [...sliderList, doc.data()])
        })
    }

    return (
        <View className='mt-4'>
            <FlatList
                data={sliderList}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <View key={index}>
                        <Image
                            style={{ width: Dimensions.get('screen').width*0.92, height: 180, borderRadius: 15, objectFit: 'fill', marginRight: 15 }}
                            source={{ uri: item?.imageURL }}
                        />
                    </View>
                )}
            />
        </View>
    )
}