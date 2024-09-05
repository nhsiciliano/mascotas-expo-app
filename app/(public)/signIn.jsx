import React, { useState } from 'react'
import {
    View,
    Button,
    TouchableOpacity,
    Text,
    TextInput,
} from "react-native";
import { Link } from "expo-router";
import { useSignIn } from '@clerk/clerk-expo';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function SignInScreen() {

    const { signIn, setActive, isLoaded } = useSignIn();
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const onSignInPress = async () => {
        if (!isLoaded) {
            return;
        }

        setLoading(true);

        try {
            const completeSignIn = await signIn.create({
                identifier: emailAddress,
                password,
            });

            // This indicates the user is signed in
            await setActive({ session: completeSignIn.createdSessionId });
        } catch (err) {
            alert(err.errors[0].message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className='flex-1 p-5 justify-center bg-lime-200'>
            <TextInput
                autoCapitalize="none"
                placeholder="tuemail@gmail.com"
                value={emailAddress}
                onChangeText={setEmailAddress}
                className='p-3 mb-2 h-14 border border-lime-600 rounded-lg bg-white'
            />
            <TextInput
                autoCapitalize="none"
                placeholder="******"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className='p-3 mb-2 h-14 border border-lime-600 rounded-lg bg-white'
            />
            <TouchableOpacity
                onPress={onSignInPress}
                className='mt-3 bg-white border-2 border-lime-800 flex flex-row justify-center items-center p-3 rounded-lg'
            >
                <Text style={{ fontSize: hp(2.2) }} className='font-semibold text-lime-800'>Iniciar Sesión</Text>
            </TouchableOpacity>
            <Link href="/signUp" asChild>
                <TouchableOpacity className='mt-3 items-center'>
                    <Text>Register</Text>
                </TouchableOpacity>
            </Link>
            <Link href="/reset" asChild>
                <TouchableOpacity className='mt-3 items-center'>
                    <Text>Forgot Password ?</Text>
                </TouchableOpacity>
            </Link>
        </View>
    )
}