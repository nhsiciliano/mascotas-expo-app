import { AntDesign } from '@expo/vector-icons';
import { Pressable } from 'react-native'
import React from 'react'

export default function BackButton({ size = 24, router }) {
    return (
        <Pressable onPress={() => router.back()} className='items-start p-1 rounded-lg bg-neutral-200'>
            <AntDesign name="left" size={size} color="black" />
        </Pressable>
    )
}