import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import PetInfo from '../../components/PetDetails/PetInfo';
import PetSubinfo from '../../components/PetDetails/PetSubinfo';
import About from '../../components/PetDetails/About';
import OwnerInfo from '../../components/PetDetails/OwnerInfo';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useUser } from '@clerk/clerk-expo';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';

export default function PetDetailsScreen() {

    const router = useRouter();
    const { user } = useUser();
    const pet = useLocalSearchParams();
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerTransparent: true,
        })
    }, [])

    const initiateChat = async () => {
        const docId1 = user?.primaryEmailAddress?.emailAddress + '_' + pet?.useremail;
        const docId2 = pet?.useremail + '_' + user?.primaryEmailAddress?.emailAddress;

        const q = query(collection(db, 'Chat'), where('id', 'in', [docId1, docId2]));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc.data());
            router.push({
                pathname: '/chat-details',
                params: {id: doc.id}
            })
        })

        if (querySnapshot.docs?.length == 0) {
            await setDoc(doc(db, 'Chat', docId1), {
                id: docId1,
                users: [
                    {
                        email: user?.primaryEmailAddress?.emailAddress,
                        imageUrl: user?.imageUrl,
                        name: user?.fullName,
                    },
                    {
                        email: pet?.useremail,
                        imageUrl: pet?.userimage,
                        name: pet?.username,
                    }
                ],
                userIds: [user?.primaryEmailAddress?.emailAddress, pet?.useremail],
            });
            router.push({
                pathname: '/chat-details',
                params: {id: docId1}
            })
        }
    }

    return (
        <View>
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                <PetInfo pet={pet} />
                <PetSubinfo pet={pet} />
                <About pet={pet} />
                <OwnerInfo pet={pet} />
                <View style={{ height: 100 }}></View>
            </ScrollView>
            <View className='absolute w-full bottom-3'>
                <TouchableOpacity onPress={initiateChat} className='p-5 bg-lime-200'>
                    <Text style={{ fontSize: hp(2.6) }} className='text-center font-semibold text-lime-800'>Adoptar a {pet?.name}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}