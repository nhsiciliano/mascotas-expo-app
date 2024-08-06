import { View, Text, Image, TextInput, TouchableOpacity, Alert, Pressable } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { Octicons, Feather, AntDesign } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Loading from '../components/Loading';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useRouter } from 'expo-router';
import WelcomeAnimation from '../components/WelcomeAnimation';
import ScreenWrapper from '../components/ScreenWrapper';

export default function SignUp() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [full_name, setFull_name] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)

    const router = useRouter();


    const onSubmitSignUp = async () => {
        setLoading(true)
        const { data: { session, }, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    full_name,
                }
            }
        })
        setLoading(false)

        //console.log('session: ', session)
        //console.log('error: ', error)
        if (error) {
            Alert.alert('Sign Up', error.message)
        }
    }

    return (
        <ScreenWrapper bg={'#d9f99d'}>
            <CustomKeyboardView>
                <StatusBar style='dark' />
                <View style={{ paddingTop: hp(1), paddingHorizontal: wp(5) }} className="flex-1 gap-12">
                    <View className="items-center">
                        <WelcomeAnimation
                            size={hp(32)}
                            source={require('../assets/images/dogsintro.json')}
                        />
                    </View>

                    <View className="gap-10">
                        <View className="gap-4">
                            <View style={{ height: hp(7) }} className="flex-row gap-4 px-4 bg-lime-100 items-center rounded-xl">
                                <Feather name="user" size={hp(2.7)} color="gray" />
                                <TextInput
                                    onChangeText={(text) => setUsername(text)}
                                    value={username}
                                    style={{ fontSize: hp(2) }}
                                    className="flex-1 font-semibold text-neutral-700 first-letter:lowercase"
                                    placeholder='Nombre de usuario'
                                    autoCapitalize={'none'}
                                    placeholderTextColor={'gray'}
                                />
                            </View>
                            <View style={{ height: hp(7) }} className="flex-row gap-4 px-4 bg-lime-100 items-center rounded-xl">
                                <AntDesign name="idcard" size={hp(2.7)} color="gray" />
                                <TextInput
                                    onChangeText={(text) => setFull_name(text)}
                                    value={full_name}
                                    style={{ fontSize: hp(2) }}
                                    className="flex-1 font-semibold text-neutral-700 first-letter:lowercase"
                                    placeholder='Nombre y Apellido'
                                    autoCapitalize={'none'}
                                    placeholderTextColor={'gray'}
                                />
                            </View>
                            <View style={{ height: hp(7) }} className="flex-row gap-4 px-4 bg-lime-100 items-center rounded-xl">
                                <Octicons name='mail' size={hp(2.7)} color="gray" />
                                <TextInput
                                    onChangeText={(text) => setEmail(text)}
                                    value={email}
                                    style={{ fontSize: hp(2) }}
                                    className="flex-1 font-semibold text-neutral-700 first-letter:lowercase"
                                    placeholder='Email'
                                    autoCapitalize={'none'}
                                    placeholderTextColor={'gray'}
                                />
                            </View>
                            <View className="gap-3">
                                <View style={{ height: hp(7) }} className="flex-row gap-4 px-4 bg-lime-100 items-center rounded-xl">
                                    <Octicons name='lock' size={hp(2.7)} color="gray" />
                                    <TextInput
                                        onChangeText={(text) => setPassword(text)}
                                        value={password}
                                        style={{ fontSize: hp(2) }}
                                        className="flex-1 font-semibold text-neutral-700 first-letter:lowercase"
                                        placeholder='Contraseña'
                                        secureTextEntry
                                        placeholderTextColor={'gray'}
                                    />
                                </View>
                            </View>

                            <View className='gap-4'>
                                <View>
                                    {
                                        loading ? (
                                            <View className="flex-row justify-center">
                                                <Loading size={hp(8.5)} />
                                            </View>
                                        ) : (
                                            <View>
                                                <TouchableOpacity
                                                    style={{ height: hp(5.5) }}
                                                    className="bg-lime-600 rounded-xl justify-center items-center"
                                                    onPress={onSubmitSignUp}
                                                >
                                                    <Text style={{ fontSize: hp(2.7) }} className="text-white font-bold tracking-wider">
                                                        Crear una cuenta
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    }
                                </View>

                                <View className="flex-row justify-center gap-2">
                                    <Text style={{ fontSize: hp(1.8) }} className="font-semibold text-neutral-500">¿Ya tienes una cuenta?</Text>
                                    <Pressable
                                        onPress={() => router.push('login')}
                                    >
                                        <Text style={{ fontSize: hp(1.8) }} className="font-bold text-lime-700">Iniciar sesión</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </CustomKeyboardView>
        </ScreenWrapper>
    )
}