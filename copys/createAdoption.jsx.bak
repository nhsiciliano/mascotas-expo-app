
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Keyboard } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, FontAwesome5, Entypo } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { decode } from 'base64-arraybuffer'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'

// Colors matching the rest of the app
const COLORS = {
  primary: '#24B24C',
  primaryDark: '#1E9D41',
  primaryLight: '#E8F5EA',
  secondary: '#34CCA9',
  inactive: '#7E7E7E',
  white: '#FFFFFF',
  background: '#F9F9F9',
  shadow: '#000000',
  text: '#333333',
  textLight: '#777777',
  placeholder: '#666666', // Color más oscuro para placeholders
}

// Types of pets
const PET_TYPES = [
  { id: 'Perro', name: 'Perro', icon: 'dog' },
  { id: 'Gato', name: 'Gato', icon: 'cat' },
  { id: 'Ave', name: 'Ave', icon: 'dove' },
  { id: 'Otro', name: 'Otro', icon: 'paw' },
];

export default function CreateAdoption() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Estado para los campos del formulario
  const [petName, setPetName] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [size, setSize] = useState('');
  const [gender, setGender] = useState('male'); // default: male
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  
  // Estado para imágenes
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Estado para ubicación
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Estado general
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Solicitar permisos al cargar el componente
  useEffect(() => {
    (async () => {
      // Permiso para cámara
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Necesitamos permisos de cámara para continuar.');
        }
      }
      
      // Permiso para galería
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Necesitamos permisos de galería para continuar.');
        }
      }
      
      // Permisos para ubicación
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permisos de ubicación para continuar.');
      }
    })();
  }, []);
  
  // Función para obtener ubicación actual
  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se pudo obtener la ubicación');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      // Obtener nombre de la ubicación
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      if (reverseGeocode && reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const addressName = [
          address.street,
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');
        
        setLocationName(addressName);
      }
      
      Alert.alert('¡Éxito!', 'Ubicación obtenida correctamente');
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
    } finally {
      setGettingLocation(false);
    }
  };
  
  // Función para seleccionar imagen de galería
  const pickImage = async () => {
    try {
      if (images.length >= 5) {
        Alert.alert('Límite alcanzado', 'Solo puedes subir hasta 5 fotos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = result.assets[0];
        
        // Redimensionar imagen para reducir tamaño
        const manipResult = await manipulateAsync(
          newImage.uri,
          [{ resize: { width: 800 } }],
          { format: SaveFormat.JPEG, compress: 0.8 }
        );
        
        setImages([...images, { uri: manipResult.uri, isUploaded: false }]);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };
  
  // Función para tomar foto con la cámara
  const takePhoto = async () => {
    try {
      if (images.length >= 5) {
        Alert.alert('Límite alcanzado', 'Solo puedes subir hasta 5 fotos');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = result.assets[0];
        
        // Redimensionar imagen para reducir tamaño
        const manipResult = await manipulateAsync(
          newImage.uri,
          [{ resize: { width: 800 } }],
          { format: SaveFormat.JPEG, compress: 0.8 }
        );
        
        setImages([...images, { uri: manipResult.uri, isUploaded: false }]);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };
  
  // Función para eliminar imagen
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  // Función para subir imágenes a Supabase Storage
  const uploadImages = async (petId) => {
    try {
      setUploadingImages(true);
      const imageUrls = [];
      
      // Verificar si el usuario está autenticado
      console.log('Iniciando proceso de carga de imágenes...');
      console.log('Bucket objetivo: pet-images');
      
      // Verificar si el usuario está autenticado
      if (!user || !user.id) {
        throw new Error('Usuario no autenticado correctamente');
      }
      
      console.log('Iniciando carga de imágenes para mascota ID:', petId);
      console.log('Usuario autenticado:', user.id);
      
      for (let i = 0; i < images.length; i++) {
        console.log(`Procesando imagen ${i+1} de ${images.length}`);
        const image = images[i];
        
        // Convertir imagen a base64
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        // Crear una promesa para la conversión a base64
        const base64 = await new Promise((resolve) => {
          reader.onload = () => {
            const base64data = reader.result;
            resolve(base64data.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });
        
        // Generar nombre único para el archivo
        const fileName = `${petId}/${Date.now()}-${i}.jpg`;
        console.log('Nombre de archivo a subir:', fileName);
        
        // Simplificamos el proceso de carga de imágenes
        try {
          // 1. Subir la imagen directamente sin verificaciones previas
          console.log(`Subiendo imagen ${i+1} a bucket pet-images...`);
          console.log(`Nombre de archivo: ${fileName}`);
          
          // Intentar subir la imagen con opciones simplificadas y sin opciones de UPSERT
          const { data, error } = await supabase.storage
            .from('pet-images')
            .upload(fileName, decode(base64), { contentType: 'image/jpeg' });
          
          if (error) {
            console.error(`Error detallado al subir imagen ${i+1}:`, JSON.stringify(error));
            throw new Error(`Error al subir imagen: ${error.message}`);
          }
          
          console.log(`Imagen ${i+1} subida exitosamente, datos:`, JSON.stringify(data));
          
          // 2. Obtener la URL pública
          const publicUrl = supabase.storage
            .from('pet-images')
            .getPublicUrl(fileName).data.publicUrl;
          
          console.log(`URL pública obtenida: ${publicUrl}`);
          
          // 3. Guardar la referencia en pet_images
          console.log(`Guardando referencia en pet_images para pet_id: ${petId}`);
          
          const { data: petImageData, error: petImageError } = await supabase
            .from('pet_images')
            .insert({
              pet_id: petId,
              url: publicUrl,
              is_main: i === 0 // Primera imagen como principal
            });
          
          if (petImageError) {
            console.error(`Error al guardar referencia: ${JSON.stringify(petImageError)}`);
            throw new Error(`Error al guardar referencia de imagen: ${petImageError.message}`);
          }
          
          console.log(`Referencia guardada correctamente`);
          imageUrls.push(publicUrl);
          
        } catch (error) {
          console.error(`Falló la carga de la imagen ${i+1}:`, error);
          Alert.alert('Error al subir imagen', error.message);
          throw error;
        }
      }
      
      return imageUrls;
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      Alert.alert('Error en carga de imágenes', `${error.message}`);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };
  
  // Función principal para crear la adopción
  const handleCreateAdoption = async () => {
    try {
      // Validaciones básicas
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para publicar una adopción');
        return;
      }
      
      if (!petName || !selectedType || !breed || !location || images.length === 0) {
        Alert.alert('Campos incompletos', 'Por favor completa todos los campos obligatorios: nombre, tipo, raza, ubicación y al menos una foto.');
        return;
      }
      
      setIsSubmitting(true);
      console.log('Iniciando creación de adopción con usuario:', user.id);
      
      // 1. Creamos el registro básico en la tabla pets
      console.log('Creando registro en la tabla pets...');
      const newPet = {
        user_id: user.id,
        name: petName,
        type: selectedType,
        breed: breed,
        age: age || '',
        gender: gender,
        size: size || '',
        description: description || '',
        phone: phone || '',
        latitude: location.latitude,
        longitude: location.longitude,
        location_name: locationName || ''
      };
      
      console.log('Datos de la mascota a insertar:', JSON.stringify(newPet));
      
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .insert(newPet)
        .select();
      
      if (petError) {
        console.error('Error detallado al crear mascota:', JSON.stringify(petError));
        throw new Error(`Error al crear registro de mascota: ${petError.message}`);
      }
      
      if (!petData || petData.length === 0) {
        throw new Error('No se recibieron datos al crear la mascota');
      }
      
      const petId = petData[0].id;
      console.log('Mascota creada exitosamente con ID:', petId);
      
      try {
        // 2. Intentamos subir las imágenes
        console.log('Iniciando carga de imágenes...');
        await uploadImages(petId);
        console.log('Imágenes cargadas exitosamente');
        
        Alert.alert(
          '¡Publicación exitosa!',
          'Tu mascota ha sido publicada para adopción',
          [{ text: 'Ver mascotas', onPress: () => router.push('/(tabs)') }]
        );
        
        // Limpiar formulario
        setPetName('');
        setSelectedType(null);
        setBreed('');
        setAge('');
        setSize('');
        setGender('male');
        setDescription('');
        setPhone('');
        setImages([]);
        setLocation(null);
        setLocationName('');
      } catch (imageError) {
        // Si falla la carga de imágenes pero la mascota ya fue creada,
        // informamos al usuario pero no revertimos la creación de la mascota
        console.warn('La mascota se creó pero hubo un problema con las imágenes:', imageError);
        Alert.alert(
          'Adopción creada parcialmente',
          'Tu mascota ha sido publicada, pero hubo un problema al subir alguna imagen. Puedes intentar editar la publicación más tarde.',
          [{ text: 'Entendido', onPress: () => router.push('/(tabs)') }]
        );
      }
    } catch (error) {
      console.error('Error general al crear adopción:', error);
      Alert.alert('Error', `No se pudo crear la adopción: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estado para manejar el campo actualmente enfocado
  const [currentFocus, setCurrentFocus] = useState(null);
  // Referencia para el ScrollView
  const scrollViewRef = React.useRef(null);
  
  // Función para manejar el enfoque en campos de texto
  const handleFocus = (fieldName, fieldY) => {
    setCurrentFocus(fieldName);
    // Pequeño retraso para permitir que el teclado aparezca
    setTimeout(() => {
      // Desplazar hacia el campo enfocado
      scrollViewRef.current?.scrollTo({
        y: fieldY - 100, // Desplazar un poco por encima del campo
        animated: true
      });
    }, 300);
  };

  return (
    <KeyboardAvoidingView 
      style={{flex: 1}} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publicar Adopción</Text>
          <View style={{width: 24}} />
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{paddingBottom: 100}}
        >
        {/* Photo Upload Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Fotos</Text>
          <Text style={styles.sectionSubtitle}>Agrega hasta 5 fotos de tu mascota</Text>
          
          <View style={styles.photoGrid}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.petImage} />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={22} color="#e53935" />
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < 5 && (
              <View style={styles.addButtonsContainer}>
                <TouchableOpacity 
                  style={styles.addPhotoButton}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera-outline" size={28} color={COLORS.primary} />
                  <Text style={styles.addPhotoText}>Cámara</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.addPhotoButton}
                  onPress={pickImage}
                >
                  <Ionicons name="image-outline" size={28} color={COLORS.primary} />
                  <Text style={styles.addPhotoText}>Galería</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Basic Info Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <Text style={styles.inputLabel}>Nombre de la mascota</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ej: Luna, Rocky, etc."
              placeholderTextColor={COLORS.placeholder}
              value={petName}
              onChangeText={setPetName}
              onFocus={() => handleFocus('petName', 470)}
            />
          </View>

          <Text style={styles.inputLabel}>Tipo de mascota</Text>
          <View style={styles.typeButtonsContainer}>
            {PET_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  selectedType === type.id && styles.selectedTypeButton
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <FontAwesome5 
                  name={type.icon} 
                  size={18} 
                  color={selectedType === type.id ? COLORS.white : COLORS.primary} 
                />
                <Text 
                  style={[
                    styles.typeButtonText,
                    selectedType === type.id && styles.selectedTypeText
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Raza</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ej: Labrador, Siamés, etc."
              placeholderTextColor={COLORS.placeholder}
              value={breed}
              onChangeText={setBreed}
              onFocus={() => handleFocus('breed', 520)}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputContainer, {flex: 1, marginRight: 10}]}>
              <Text style={styles.inputLabel}>Edad</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 2 años"
                placeholderTextColor={COLORS.placeholder}
                value={age}
                onChangeText={setAge}
                onFocus={() => handleFocus('age', 540)}
              />
            </View>
            <View style={[styles.inputContainer, {flex: 1}]}>
              <Text style={styles.inputLabel}>Tamaño</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Mediano"
                placeholderTextColor={COLORS.placeholder}
                value={size}
                onChangeText={setSize}
                onFocus={() => handleFocus('size', 540)}
              />
            </View>
          </View>

          <View style={styles.genderSelectionContainer}>
            <Text style={styles.inputLabel}>Género</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity 
                style={[styles.genderButton, gender === 'male' && styles.selectedGenderButton]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.genderButtonText, gender === 'male' && styles.selectedGenderText]}>Macho</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.genderButton, gender === 'female' && styles.selectedGenderButton]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.genderButtonText, gender === 'female' && styles.selectedGenderText]}>Hembra</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          
          {location ? (
            <View style={styles.locationContainer}>
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={20} color={COLORS.primary} />
                <Text style={styles.locationText}>{locationName}</Text>
              </View>
              <TouchableOpacity 
                style={styles.changeLocationButton}
                onPress={getCurrentLocation}
                disabled={gettingLocation}
              >
                <Text style={styles.changeLocationText}>Cambiar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.locationButtonText}>Usar ubicación actual</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Describe a tu mascota, su personalidad, necesidades especiales, etc."
              placeholderTextColor={COLORS.placeholder}
              multiline={true}
              numberOfLines={5}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              onFocus={() => handleFocus('description', 600)}
            />
          </View>
        </View>

        {/* Contact Info Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Información de contacto</Text>
          <Text style={styles.inputLabel}>Teléfono</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Tu número de teléfono"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              onFocus={() => handleFocus('phone', 640)}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleCreateAdoption}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Publicar Adopción</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  disabledButton: {
    opacity: 0.7,
  },
  petImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addButtonsContainer: {
    flexDirection: 'row',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: 8,
    color: COLORS.text,
    flex: 1,
  },
  changeLocationButton: {
    backgroundColor: COLORS.white,
    borderRadius: 6,
    padding: 6,
    paddingHorizontal: 10,
  },
  changeLocationText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 15,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 12,
    fontSize: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedTypeButton: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
  },
  selectedTypeText: {
    color: COLORS.white,
  },
  genderSelectionContainer: {
    marginBottom: 15,
  },
  genderButtons: {
    flexDirection: 'row',
  },
  genderButton: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 10,
  },
  selectedGenderButton: {
    backgroundColor: COLORS.primary,
  },
  genderButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  selectedGenderText: {
    color: COLORS.white,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 12,
  },
  locationButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
  },
  textAreaContainer: {
    marginBottom: 15,
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
