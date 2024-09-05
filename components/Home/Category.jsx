import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '../../config/FirebaseConfig'

export default function Category({ category }) {

    const [categoryList, setCategoryList] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('Gato')

    useEffect(() => {
        getCategory();
    }, [])

    const getCategory = async () => {
        setCategoryList([]);
        const snapshot = await getDocs(collection(db, 'Category'));
        snapshot.forEach((doc) => {
            setCategoryList(categoryList => [...categoryList, doc.data()])
        })
    }

    return (
        <View className='mt-5'>
            <Text className='text-xl font-semibold'>Encuentra tu nuevo amigo</Text>
            <FlatList
                data={categoryList}
                scrollEnabled={false}
                numColumns={2}
                renderItem={({ item, index }) => (
                    <TouchableOpacity key={index} className='flex-1 mt-1' onPress={() => {
                        setSelectedCategory(item.name)
                        category(item.name)
                    }}>
                        <View 
                            className={`flex items-center p-4 m-1 border border-1 border-lime-700 rounded-lg ${selectedCategory == item.name ? `bg-lime-300` : `bg-lime-100`}`}
                        >
                            <Image
                                source={{ uri: item?.imageURL }}
                                style={{ width: 60, height: 60 }}
                            />
                        </View>
                        <Text className='text-center text-lg font-semibold'>{item?.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}