import { View, Text, Image, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { Picker } from '@react-native-picker/picker'

export default function AddPetScreen() {

    const [formData, setFormData] = useState()
    const [gender, setGender] = useState()
    const [cast, setCast] = useState()
    const [parast, setParast] = useState()

    const handleInputChange = (fieldName, fieldValue) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: fieldValue,
        }))
    }

    return (
        <ScreenWrapper>
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                <Text style={{ fontSize: hp(2.6) }} className='font-semibold text-lime-800'>Crear nueva adopción</Text>
                <Image
                    source={require('../../assets/images/petholder.png')}
                    style={{
                        marginTop: 20,
                        width: 100,
                        height: 100,
                        borderRadius: 15,
                        borderWidth: 1,
                        borderColor: 'gray',
                    }}
                />
                <View className='mt-10 mb-2'>
                    <Text>Nombre de la mascota *</Text>
                    <TextInput
                        className='p-3 bg-white rounded-md mt-2'
                        placeholder='Nombre'
                        onChangeText={(value) => handleInputChange('name', value)}
                    />
                </View>
                <View className='my-2'>
                    <Text>Edad *</Text>
                    <TextInput
                        className='p-3 bg-white rounded-md mt-2'
                        placeholder='4 meses / 3 años'
                        onChangeText={(value) => handleInputChange('age', value)}
                    />
                </View>
                <View className='my-2'>
                    <Text>Sexo *</Text>
                    <View>
                        <Picker
                            selectedValue={gender}
                            style={{ marginTop: -60, marginBottom: -50 }}
                            onValueChange={(itemValue, itemIndex) => {
                                setGender(itemValue);
                                handleInputChange('sex', itemValue);
                            }}>
                            <Picker.Item label="Macho" value="Macho" />
                            <Picker.Item label="Hembra" value="Hembra" />
                        </Picker>
                    </View>
                </View>
                <View className='my-2'>
                    <Text>Se entrega castrado/a?</Text>
                    <View>
                        <Picker
                            selectedValue={cast}
                            style={{ marginTop: -60, marginBottom: -50 }}
                            onValueChange={(itemValue, itemIndex) => {
                                setCast(itemValue);
                                handleInputChange('castrado', itemValue);
                            }}>
                            <Picker.Item label="Si" value="Si" />
                            <Picker.Item label="No" value="No" />
                        </Picker>
                    </View>
                </View>
                <View className='my-2'>
                    <Text>Se entrega desparasitado/a?</Text>
                    <View>
                        <Picker
                            selectedValue={parast}
                            style={{ marginTop: -60, marginBottom: -50 }}
                            onValueChange={(itemValue, itemIndex) => {
                                setParast(itemValue);
                                handleInputChange('desparasitado', itemValue);
                            }}>
                            <Picker.Item label="Si" value="Si" />
                            <Picker.Item label="No" value="No" />
                        </Picker>
                    </View>
                </View>
                <View className='my-2'>
                    <Text>Ubicación *</Text>
                    <TextInput
                        className='p-3 bg-white rounded-md mt-2'
                        placeholder='Caballito, CABA'
                        onChangeText={(value) => handleInputChange('address', value)}
                    />
                </View>
                <View className='my-2'>
                    <Text>Breve descripción *</Text>
                    <TextInput
                        className='p-3 bg-white rounded-md mt-2'
                        numberOfLines={5}
                        multiline={true}
                        onChangeText={(value) => handleInputChange('about', value)}
                    />
                </View>
                <TouchableOpacity className='p-4 bg-lime-200 rounded-md my-3'>
                    <Text style={{ fontSize: hp(2) }} className='font-semibold text-center text-lime-800'>Crear adopción</Text>
                </TouchableOpacity>
            </ScrollView>
        </ScreenWrapper>
    )
}