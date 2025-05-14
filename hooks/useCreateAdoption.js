import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { decode } from 'base64-arraybuffer';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Hook personalizado para manejar la lógica de creación de adopciones
 * @returns {Object} Estados y funciones para el formulario de creación de adopciones
 */
export const useCreateAdoption = () => {
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
  
  // Nuevos estados para el tipo de adopción
  const [adoptionType, setAdoptionType] = useState('permanent'); // 'permanent' o 'transit'
  const [transitDays, setTransitDays] = useState('');
  
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
    requestPermissions();
  }, []);
  
  /**
   * Solicita todos los permisos necesarios (cámara, galería, ubicación)
   */
  const requestPermissions = async () => {
    try {
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
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
    }
  };
  
  /**
   * Obtiene la ubicación actual del usuario
   */
  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se pudo obtener la ubicación');
        setGettingLocation(false);
        return;
      }
      
      const locationData = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude
      });
      
      // Obtener nombre de la ubicación
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude
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
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación: ' + error.message);
    } finally {
      setGettingLocation(false);
    }
  };
  
  /**
   * Selecciona imágenes de la galería
   */
  const pickImage = async () => {
    try {
      // Limitar número máximo de imágenes
      if (images.length >= 5) {
        Alert.alert('Límite alcanzado', 'No puedes agregar más de 5 imágenes');
        return;
      }
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Optimizar imagen para reducir tamaño
        const resizedImage = await manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: SaveFormat.JPEG, base64: true }
        );
        
        // Añadir imagen a la lista
        setImages([...images, {
          uri: resizedImage.uri,
          base64: resizedImage.base64,
          isMain: images.length === 0 // La primera imagen será la principal
        }]);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };
  
  /**
   * Toma una foto con la cámara
   */
  const takePhoto = async () => {
    try {
      // Limitar número máximo de imágenes
      if (images.length >= 5) {
        Alert.alert('Límite alcanzado', 'No puedes agregar más de 5 imágenes');
        return;
      }
      
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Optimizar imagen para reducir tamaño
        const resizedImage = await manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: SaveFormat.JPEG, base64: true }
        );
        
        // Añadir imagen a la lista
        setImages([...images, {
          uri: resizedImage.uri,
          base64: resizedImage.base64,
          isMain: images.length === 0 // La primera imagen será la principal
        }]);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };
  
  /**
   * Elimina una imagen de la lista
   * @param {number} index - Índice de la imagen a eliminar
   */
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    
    // Si eliminamos la imagen principal y quedan otras, establecer la primera como principal
    if (newImages.length > 0) {
      newImages[0].isMain = true;
    }
    
    setImages(newImages);
  };
  
  /**
   * Sube las imágenes a Supabase Storage
   * @param {string} petId - ID de la mascota asociada
   * @returns {Promise<Array>} - Array con las URLs de las imágenes subidas
   */
  const uploadImages = async (petId) => {
    try {
      setUploadingImages(true);
      
      if (images.length === 0) {
        return [];
      }
      
      const uploadPromises = images.map(async (image, index) => {
        try {
          // Nombre del archivo en formato "pet_{petId}_{timestamp}_{index}.jpg"
          const timestamp = Date.now();
          const fileName = `pet_${petId}_${timestamp}_${index}.jpg`;
          
          // Convertir imagen base64 a ArrayBuffer para subir a Supabase
          const base64Data = image.base64;
          const arrayBuffer = decode(base64Data);
          
          // Subir imagen a Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('pet-images') // Corregido: guion en lugar de underscore para coincidir con el bucket existente
            .upload(fileName, arrayBuffer, {
              contentType: 'image/jpeg',
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) {
            throw new Error(`Error al subir imagen ${index + 1}: ${uploadError.message}`);
          }
          
          // Obtener URL pública de la imagen
          const { data: { publicUrl } } = supabase.storage
            .from('pet-images') // Corregido: guion en lugar de underscore para coincidir con el bucket existente
            .getPublicUrl(fileName);
          
          // Registro en pet_images
          const { error: dbError } = await supabase
            .from('pet_images')
            .insert({
              pet_id: petId,
              url: publicUrl,
              is_main: image.isMain || index === 0 // Primera imagen o marcada como principal
            });
          
          if (dbError) {
            throw new Error(`Error al registrar imagen ${index + 1} en BD: ${dbError.message}`);
          }
          
          return publicUrl;
        } catch (imageError) {
          console.error(`Error procesando imagen ${index + 1}:`, imageError);
          // Seguimos con las demás imágenes
          return null;
        }
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      return uploadedUrls.filter(Boolean); // Filtrar posibles nulls
    } catch (error) {
      console.error('Error general al subir imágenes:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };
  
  /**
   * Crea una nueva mascota para adopción
   */
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
        location_name: locationName || '',
        adoption_type: adoptionType, // Tipo de adopción (permanente o tránsito)
        transit_days: adoptionType === 'transit' ? transitDays : null // Días de tránsito (solo si es tránsito)
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
        console.log('Subiendo imágenes...');
        const uploadedImageUrls = await uploadImages(petId);
        
        if (uploadedImageUrls.length === 0) {
          console.warn('No se subieron imágenes correctamente');
        } else {
          console.log(`Se subieron ${uploadedImageUrls.length} imágenes correctamente`);
        }
        
        // Éxito completo
        Alert.alert(
          '¡Publicación exitosa!',
          'Tu mascota ha sido publicada correctamente para adopción.',
          [
            { text: 'Ver publicación', onPress: () => router.push(`/petDetail?id=${petId}`) },
            { text: 'Volver al inicio', onPress: () => router.push('/home') }
          ]
        );
        
        // Limpiar formulario
        resetForm();
      } catch (imagesError) {
        // Si hubo error con las imágenes pero la mascota se creó, avisamos
        console.error('Error al subir imágenes:', imagesError);
        Alert.alert(
          'Publicación parcial',
          'Tu mascota fue creada pero hubo un problema al subir algunas imágenes. Puedes editar la publicación más tarde.',
          [{ text: 'Entendido', onPress: () => router.push('/home') }]
        );
      }
    } catch (error) {
      console.error('Error general en la creación:', error);
      Alert.alert('Error', `No se pudo crear la publicación: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Resetea el formulario a valores iniciales
   */
  const resetForm = () => {
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
    setAdoptionType('permanent'); // Reiniciar tipo de adopción
    setTransitDays('');
  };
  
  /**
   * Maneja el enfoque en campos de texto para mejorar la UX en el formulario
   * @param {string} fieldName - Nombre del campo
   * @param {number} fieldY - Posición Y del campo
   */
  const handleFocus = (fieldName, fieldY) => {
    // Para futura implementación si se necesita un scroll a la posición
    // o para manejar el teclado en dispositivos pequeños
  };
  
  return {
    // Estado del formulario
    petName,
    setPetName,
    selectedType,
    setSelectedType,
    breed,
    setBreed,
    age,
    setAge,
    size,
    setSize,
    gender,
    setGender,
    description,
    setDescription,
    phone,
    setPhone,
    
    // Estados para tipo de adopción
    adoptionType,
    setAdoptionType,
    transitDays,
    setTransitDays,
    
    // Estado de imágenes
    images,
    uploadingImages,
    
    // Estado de ubicación
    location,
    locationName,
    gettingLocation,
    
    // Estado general
    isSubmitting,
    
    // Funciones
    getCurrentLocation,
    pickImage,
    takePhoto,
    removeImage,
    handleCreateAdoption,
    handleFocus
  };
};
