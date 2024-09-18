import { View, Text, Image, TextInput, ScrollView, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import CustomKeyboardView from '../../components/CustomKeyboardView'
import { getDocs, collection, setDoc, doc } from 'firebase/firestore'
import { db, storage } from '../../config/FirebaseConfig'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { Picker } from '@react-native-picker/picker'
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'

export default function AddPetScreen() {

    const { user } = useUser()
    const router = useRouter()

    const [formData, setFormData] = useState(
        { category: 'Gato', sex: 'Macho', castrado: 'Si', desparasitado: 'Si' }
    )
    const [gender, setGender] = useState()
    const [cast, setCast] = useState()
    const [parast, setParast] = useState()
    const [image, setImage] = useState()
    const [loader, setLoader] = useState(false)

    const [categoryList, setCategoryList] = useState([])
    const [selectedCategory, setSelectedCategory] = useState()

    useEffect(() => {
        getCategory();
    }, [])

    const handleInputChange = (fieldName, fieldValue) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: fieldValue,
        }))
    }

    const getCategory = async () => {
        setCategoryList([]);
        const snapshot = await getDocs(collection(db, 'Category'));
        snapshot.forEach((doc) => {
            setCategoryList(categoryList => [...categoryList, doc.data()])
        })
    }

    const imagePicker = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const onSubmit = () => {
        if (Object.keys(formData).length != 8) {
            Alert.alert('Por favor completa todos los campos para crear la nueva adopción.');
            return;
        }
        uploadImage();
    }

    const uploadImage = async () => {
        setLoader(true)
        const response = await fetch(image);
        const blobImage = await response.blob();
        const storageRef = ref(storage, '/mascotas-expo-app' + Date.now() + '.jpg');

        uploadBytes(storageRef, blobImage).then((snapshot) => {
            console.log('Archivo agregado');
        }).then(resp => {
            getDownloadURL(storageRef).then(async (downloadUrl) => {
                saveFormData(downloadUrl)
            })
        })
    }

    const saveFormData = async (imageUrl) => {
        const docId = Date.now().toString();
        await setDoc(doc(db, 'Pets', docId), {
            ...formData,
            imageURL: imageUrl,
            username: user?.fullName,
            useremail: user?.primaryEmailAddress?.emailAddress,
            userimage: user?.imageUrl,
            id: docId,
        })
        setLoader(false)
        setFormData({
            category: 'Gato', sex: 'Macho', castrado: 'Si', desparasitado: 'Si'
        })
        setImage()
        router.replace('/(tabs)/home')
    }

    return (
        <ScreenWrapper>
            <CustomKeyboardView>
                <Text style={{ fontSize: hp(2.6) }} className='font-bold text-lime-800 text-center'>Crear nueva adopción</Text>
                <Text style={{ fontSize: hp(1.7) }} className='font-semibold text-lime-800 text-center'>Todos los campos a completar son obligatorios</Text>
                <Pressable onPress={imagePicker}>
                    {!image ?
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
                        /> :
                        <Image
                            source={{ uri: image }}
                            style={{
                                marginTop: 20,
                                width: 100,
                                height: 100,
                                borderRadius: 15,
                            }}
                        />
                    }
                </Pressable>
                <View className='mt-10 mb-2'>
                    <Text style={{ fontSize: hp(1.7) }} className='text-lime-800 font-semibold'>Nombre de la mascota</Text>
                    <TextInput
                        className='p-3 bg-white rounded-md mt-2'
                        placeholder='Edna'
                        onChangeText={(value) => handleInputChange('name', value)}
                    />
                </View>
                <View className='my-2'>
                    <Text style={{ fontSize: hp(1.7) }} className='text-lime-800 font-semibold'>Edad</Text>
                    <TextInput
                        className='p-3 bg-white rounded-md mt-2'
                        placeholder='4 meses / 2 años'
                        onChangeText={(value) => handleInputChange('age', value)}
                    />
                </View>
                <View className='my-2'>
                    <Text style={{ fontSize: hp(1.7) }} className='text-lime-800 font-semibold'>Categoria</Text>
                    <View>
                        <Picker
                            selectedValue={selectedCategory}
                            style={{ marginTop: -60, marginBottom: -50 }}
                            onValueChange={(itemValue, itemIndex) => {
                                setSelectedCategory(itemValue);
                                handleInputChange('category', itemValue);
                            }}>
                            {categoryList.map((category, index) => (
                                <Picker.Item key={index} label={category.name} value={category.name} />
                            ))}
                        </Picker>
                    </View>
                </View>
                <View className='my-2'>
                    <Text style={{ fontSize: hp(1.7) }} className='text-lime-800 font-semibold'>Sexo</Text>
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
                    <Text style={{ fontSize: hp(1.7) }} className='text-lime-800 font-semibold'>Se entrega castrado/a?</Text>
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
                    <Text style={{ fontSize: hp(1.7) }} className='text-lime-800 font-semibold'>Se entrega desparasitado/a?</Text>
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
                    <Text style={{ fontSize: hp(1.7) }} className='text-lime-800 font-semibold'>Ubicación</Text>
                    <TextInput
                        className='p-3 bg-white rounded-md mt-2'
                        placeholder='Caballito, CABA'
                        onChangeText={(value) => handleInputChange('address', value)}
                    />
                </View>
                <View className='my-2'>
                    <Text style={{ fontSize: hp(1.7) }} className='text-lime-800 font-semibold'>Breve descripción</Text>
                    <TextInput
                        className='p-3 bg-white rounded-md mt-2'
                        numberOfLines={5}
                        multiline={true}
                        placeholder='Se porta muy bien, le gusta jugar y estar en companía. Se adapta muy fácil a otros animales'
                        onChangeText={(value) => handleInputChange('about', value)}
                    />
                </View>
                <TouchableOpacity
                    onPress={onSubmit}
                    disabled={loader}
                    className='p-4 bg-lime-200 rounded-md my-3'
                >
                    {loader ?
                        <ActivityIndicator size={'small'} color={'darkgreen'} />
                        :
                        <Text style={{ fontSize: hp(2) }} className='font-semibold text-center text-lime-800'>Crear adopción</Text>
                    }
                </TouchableOpacity>
            </CustomKeyboardView>
        </ScreenWrapper>
    )
}