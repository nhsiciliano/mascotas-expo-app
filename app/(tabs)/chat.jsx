import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useUser } from '@clerk/clerk-expo'
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import UserItem from '../../components/Chats/UserItem';

export default function ChatInbox() {

    const { user } = useUser();
    const [userList, setUserList] = useState([]);
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        user && getUserList();
    }, [user])

    const getUserList = async () => {
        setLoader(true);
        setUserList([]);
        const q = query(collection(db, 'Chat'), where('userIds', 'array-contains', user?.primaryEmailAddress?.emailAddress))
        const querySnapshot = await getDocs(q)

        querySnapshot.forEach((doc) => {
            setUserList(prevList => [...prevList, doc.data()])
        })
        setLoader(false);
    }

    const mapOtherUserList = () => {
        const list = [];
        userList.forEach((record) => {
            const otherUser = record.users?.filter(item => item?.email != user?.primaryEmailAddress?.emailAddress)
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
                <Text style={{ fontSize: hp(2.6) }} className='font-bold text-lime-800 text-center'>Mis Chats</Text>
                <View className='flex flex-row mt-3 items-center gap-1'>
                    <Ionicons name="chatbubbles-outline" size={20} color="black" />
                    <View className='p-2'>
                        <Text style={{ fontSize: hp(1.4) }} className='font-semibold text-neutral-600'>Aquí se encuentran los chats activos con otros usuarios.</Text>
                    </View>
                </View>
                <FlatList
                    data={mapOtherUserList()}
                    refreshing={loader}
                    onRefresh={getUserList}
                    style={{
                        marginTop: 20,
                        paddingVertical: 10,
                    }}
                    renderItem={({ item, index }) => (
                        <UserItem userInfo={item} key={index} />
                    )}
                />
            </View>
        </ScreenWrapper>
    )
}