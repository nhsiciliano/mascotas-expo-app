import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { addDoc, collection, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../../config/FirebaseConfig'
import { useUser } from '@clerk/clerk-expo'
import { GiftedChat } from 'react-native-gifted-chat'
import moment from 'moment'

export default function ChatScreen() {

    const [messages, setMessages] = useState([])
    const { user } = useUser();
    const router = useRouter();
    const params = useLocalSearchParams();
    const navigation = useNavigation();

    useEffect(() => {
        getUserDetails();
        const unsubscribe = onSnapshot(collection(db, 'Chat', params.id, 'Messages'), (snapshot) => {
            const messageData = snapshot.docs.map((doc) => ({
                _id: doc.id,
                ...doc.data()
            }))
            setMessages(messageData)
        });

        return () => unsubscribe();
    }, [])

    const getUserDetails = async () => {
        const docRef = doc(db, 'Chat', params?.id);
        const docSnap = await getDoc(docRef);
        const result = docSnap.data();
        const otherUser = result?.users.filter(item => item.email != user?.primaryEmailAddress?.emailAddress);
        navigation.setOptions({
            headerShown: true,
            headerTitle: otherUser[0].name,
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: "lightgreen" },
        })
    }

    const onSend = async (newMessage) => {
        setMessages((previusMessage) => GiftedChat.append(previusMessage, newMessage))
        newMessage[0].createdAt = moment().format('MM-DD-YYYY HH:mm:ss')
        await addDoc(collection(db, 'Chat', params.id, 'Messages'), newMessage[0])
    }

    return (
        <ScreenWrapper mb={38}>
            <Pressable onPress={() => router.push('chat')}>
                <Text>Volver</Text>
            </Pressable>
            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                placeholder='Escribe un mensaje'
                showUserAvatar={true}
                user={{
                    _id: user?.primaryEmailAddress?.emailAddress,
                    name: user?.fullName,
                    avatar: user?.imageUrl,
                }}
            />
        </ScreenWrapper>
    )
}