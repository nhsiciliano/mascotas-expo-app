import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../config/FirebaseConfig'
import { useUser } from '@clerk/clerk-expo'
import { GiftedChat, Send } from 'react-native-gifted-chat'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function ChatScreen() {

    const [messages, setMessages] = useState([])
    const [loader, setLoader] = useState(false)
    const { user } = useUser();
    const router = useRouter();
    const params = useLocalSearchParams();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        getUserDetails()
        const collectionRef = collection(db, 'Chat', params.id, 'Messages')
        const q = query(collectionRef, orderBy('createdAt', 'desc'))

        const unsubscribe = onSnapshot(q, snapshot => {
            console.log(snapshot)
            setMessages(
                snapshot.docs.map(doc => ({
                    _id: doc.id,
                    createdAt: doc.data().createdAt.toDate(),
                    text: doc.data().text,
                    user: doc.data().user
                }))
            )
        })
        return unsubscribe;
    }, [])

    const getUserDetails = async () => {
        const docRef = doc(db, 'Chat', params?.id);
        const docSnap = await getDoc(docRef);
        const result = docSnap.data();
        const otherUser = result?.users.filter(item => item.email != user?.primaryEmailAddress?.emailAddress);
        console.log('other: ', otherUser)
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => router.push('chat')}
                >
                    <Ionicons name="arrow-back" size={24} color="white" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
            ),
            headerShown: true,
            headerTitle: otherUser[0].name,
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: "olivedrab" },
            headerTitleStyle: { color: 'white' }
        })
    }


    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))

        const { _id, createdAt, text, user } = messages[0];
        addDoc(collection(db, 'Chat', params.id, 'Messages'), {
            _id,
            createdAt,
            text,
            user
        });
    }, []);

    const renderSend = (props) => {
        return (
            <Send {...props}>
                <View style={{ marginBottom: 11 }}>
                    <Ionicons name="send" size={24} color="#0075FD" />
                </View>
            </Send>
        );
    };

    return (
        <ScreenWrapper mb={48} bg={'#fff'}>
            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                placeholder='Escribe un mensaje'
                messagesContainerStyle={{
                    backgroundColor: "#fff"
                }}
                user={{
                    _id: user?.primaryEmailAddress?.emailAddress,
                    name: user?.fullName,
                    avatar: user?.imageUrl,
                }}
                showUserAvatar={true}
                showAvatarForEveryMessage={true}
                renderSend={renderSend}
            />
        </ScreenWrapper>
    )
}