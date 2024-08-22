import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useUser } from '@clerk/clerk-expo'
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';

export default function ChatInbox() {

    const { user } = useUser();
    const [userList, setUserList] = useState([]);

    useEffect(() => {
        user && getUserList();
    }, [user])

    const getUserList = async () => {
        const q = query(collection(db, 'Chat'), where('userIds', 'array-contains', user?.primaryEmailAddress?.emailAddress))
        const querySnapshot = await getDocs(q)

        querySnapshot.forEach((doc) => {
            setUserList(prevList => [...prevList, doc.data()])
        })
    }

    const mapOtherUserList = () => {
        const list = [];
        userList.forEach((record) => {
            const otherUser = record.users?.filter(user => user?.email != user?.primaryEmailAddress?.emailAddress)
            const result = {
                docId: record.id,
                ...otherUser[0]
            }
            list.push(result)
        })
        return list;
    }

    return (
        <ScreenWrapper>
            <View>
                <Text>notifications</Text>
            </View>
        </ScreenWrapper>
    )
}