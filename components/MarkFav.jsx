import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { getFavList, updateFav } from '../shared/shared';
import { useUser } from '@clerk/clerk-expo';

export default function MarkFav({ pet }) {

    const { user } = useUser();
    const [favList, setFavList] = useState();

    useEffect(() => {
        user && getFav();
    }, [user])

    const getFav = async () => {
        const result = await getFavList(user);
        console.log(result);
        setFavList(result?.favorites ? result?.favorites : [""])
    }

    const addToFav = async () => {
        const favResult = favList
        favResult.push(pet?.id)
        await updateFav(user, favResult)
        getFav()
    }

    const removeFromFav = async () => {
        const favResult = favList.filter(item => item != pet.id);
        await updateFav(user, favResult)
        getFav()
    }

    return (
        <View>
            {
                favList?.includes(pet.id) ?
                    <Pressable onPress={() => removeFromFav()}>
                        <Ionicons name="heart" size={30} color="red" />
                    </Pressable>
                    :
                    <Pressable onPress={() => addToFav()}>
                        <Ionicons name="heart-outline" size={30} color="black" />
                    </Pressable>
            }
        </View>
    )
}