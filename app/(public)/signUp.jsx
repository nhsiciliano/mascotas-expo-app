import { View, Text, Image, TextInput, TouchableOpacity, Alert, Pressable } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import CustomKeyboardView from '../../components/CustomKeyboardView';
import { useRouter, Stack } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useSignUp } from '@clerk/clerk-expo';

export default function SignUp() {

    const { signUp, setActive, isLoaded } = useSignUp();
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const onSignUpPress = async () => {
        if (!isLoaded) {
            return;
        }

        setLoading(true);

        try {
            await signUp.create({
                emailAddress,
                password,
            });

            // Send verification Email
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

            // change the UI to verify the email address
            setPendingVerification(true);
        } catch (err) {
            alert(err.errors[0].message);
        } finally {
            setLoading(false);
        }
    };

    const onPressVerify = async () => {
        if (!isLoaded) {
            return;
        }

        setLoading(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            await setActive({ session: completeSignUp.createdSessionId });
        } catch (err) {
            alert(err.errors[0].message);
        } finally {
            setLoading(false);
        }
    };



    return (
        <View className='flex-1 p-5 justify-center'>

                {!pendingVerification && (
                    <>
                        <TextInput
                            autoCapitalize="none"
                            placeholder="tuemail@gmail.com"
                            value={emailAddress}
                            onChangeText={setEmailAddress}
                            className='p-3 mb-2 h-14 border border-lime-600 rounded-lg bg-white'
                        />
                        <TextInput
                            placeholder="******"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            className='p-3 mb-2 h-14 border border-lime-600 rounded-lg bg-white'
                        />

                        <TouchableOpacity
                            onPress={onSignUpPress}
                            className='mt-3 bg-white border-2 border-lime-800 flex flex-row justify-center items-center p-3 rounded-lg'
                        >
                            <Text style={{ fontSize: hp(2.2) }} className='font-semibold text-lime-800'>Registrarse</Text>
                        </TouchableOpacity>
                    </>
                )}

                {pendingVerification && (
                    <>
                        <View>
                            <TextInput
                                value={code}
                                placeholder="Code..."
                                className='p-3 mb-2 h-14 border border-lime-600 rounded-lg bg-white'
                                onChangeText={setCode}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={onPressVerify}
                            className='mt-3 bg-white border-2 border-lime-800 flex flex-row justify-center items-center p-3 rounded-lg'
                        >
                            <Text style={{ fontSize: hp(2.2) }} className='font-semibold text-lime-800'>Verificar Email</Text>
                        </TouchableOpacity>
                    </>
                )}
        </View>
    )
}