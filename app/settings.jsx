import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
// import * as FileSystem from 'expo-file-system' // No necesitamos FileSystem en el enfoque simplificado
import * as Location from 'expo-location'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'

// Colors matching the app's theme
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
  danger: '#e53935',
  borderLight: '#EEEEEE',
  success: '#4CAF50',
};

// Componente de input con estilo moderno
const ProfileInput = ({ label, value, onChangeText, placeholder, icon, multiline = false, keyboardType = 'default', maxLength, rightIcon, onRightIconPress, editable = true }) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputWrapper, 
        multiline && { height: hp(12), alignItems: 'flex-start', paddingTop: hp(1.5) }
      ]}>
        {icon}
        <TextInput
          style={[
            styles.input,
            multiline && { height: hp(10), textAlignVertical: 'top' },
            !editable && { color: COLORS.textLight }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          multiline={multiline}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={editable}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconButton}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default function Settings() {
  const router = useRouter()
  const { user, profile, updateUserProfile, uploadAvatar } = useAuth()
  
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
    description: '',
    location: ''
  })
  
  // Cargar datos del perfil cuando está disponible
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        phone: profile.phone || '',
        description: profile.description || '',
        location: profile.location || ''
      })
    }
  }, [profile])
  
  // Función para obtener la ubicación actual del usuario
  const getLocation = async () => {
    try {
      setLocationLoading(true)
      
      // Solicitar permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync()
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No podemos acceder a tu ubicación actual')
        setLocationLoading(false)
        return
      }
      
      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      })
      
      // Obtener información de la ubicación (geocodificación inversa)
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      })
      
      if (geocode.length > 0) {
        const address = geocode[0]
        const locationString = `${address.city || address.district || address.subregion || ''}, ${address.country || ''}`
        
        // Actualizar el formulario con la ubicación formateada (Ciudad, País)
        setFormData({
          ...formData,
          location: locationString.trim()
        })
        
        Alert.alert('Ubicación detectada', `Se ha detectado tu ubicación: ${locationString}`)
      } else {
        Alert.alert('Error', 'No pudimos determinar tu ubicación actual')
      }
    } catch (error) {
      console.error('Error al obtener ubicación:', error)
      Alert.alert('Error', 'Ocurrió un problema al obtener tu ubicación')
    } finally {
      setLocationLoading(false)
    }
  }

  // Manejar la selección y subida de una nueva imagen de perfil - enfoque simplificado
  const handleSelectImage = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para cambiar la foto de perfil');
        return;
      }
      
      // Configurar selector de imágenes con opciones simplificadas
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4, // Calidad reducida para archivos más pequeños
        base64: false, // No necesitamos base64 para nuestro enfoque
      });
      
      if (result.canceled) {
        return;
      }
      
      // Proceder con la imagen seleccionada
      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('Imagen seleccionada URI:', imageUri);
        
        // Indicar que estamos subiendo
        setUploadingAvatar(true);
        
        try {
          // Directamente llamar a la función de subida
          const { success, error, url } = await uploadAvatar(imageUri);
          
          if (success && url) {
            console.log('Imagen subida exitosamente a:', url);
            Alert.alert('Listo', 'Tu foto de perfil ha sido actualizada correctamente');
          } else {
            throw new Error(error || 'No se pudo subir la imagen');
          }
        } catch (error) {
          console.error('Error al subir la imagen:', error);
          Alert.alert(
            'Error al subir imagen', 
            'No pudimos subir tu foto de perfil. Por favor intenta con otra imagen.'
          );
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error) {
      console.error('Error global en selector de imagen:', error);
      Alert.alert('Error', 'Ocurrió un problema al seleccionar la imagen');
      setUploadingAvatar(false);
    }
  };

  // Guardar cambios en el perfil
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      
      // Validar campos
      if (!formData.full_name.trim()) {
        Alert.alert('Error', 'Por favor ingresa tu nombre completo')
        setIsLoading(false)
        return
      }
      
      if (!formData.username.trim()) {
        Alert.alert('Error', 'Por favor ingresa un nombre de usuario')
        setIsLoading(false)
        return
      }
      
      // Actualizar perfil
      const { success, error } = await updateUserProfile(formData)
      
      if (success) {
        Alert.alert('Perfil actualizado', 'Tus datos han sido actualizados correctamente')
        router.back()
      } else {
        Alert.alert('Error', error || 'No se pudo actualizar el perfil. Inténtalo de nuevo.')
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error)
      Alert.alert('Error', 'Ocurrió un error al guardar los cambios')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScreenWrapper bg={COLORS.background}>
      <StatusBar style="dark" />
      
      {/* Header personalizado */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={hp(2.5)} color={COLORS.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        
        <View style={styles.headerRight} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: hp(10) }}
        >
          {/* Sección de Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {uploadingAvatar ? (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : (
                <Avatar 
                  size={hp(15)} 
                  user={user} 
                  uri={profile?.avatar_url}
                />
              )}
              
              <TouchableOpacity 
                style={styles.editAvatarButton} 
                onPress={handleSelectImage}
                disabled={uploadingAvatar}
              >
                <Feather name="camera" size={hp(2.5)} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.avatarHelp}>
              Toca el ícono de cámara para cambiar tu foto
            </Text>
          </View>
          
          {/* Formulario */}
          <View style={styles.formSection}>
            <ProfileInput
              label="Nombre completo"
              value={formData.full_name}
              onChangeText={(text) => setFormData({...formData, full_name: text})}
              placeholder="Tu nombre completo"
              icon={<Ionicons name="person-outline" size={hp(2.5)} color={COLORS.primaryDark} style={styles.inputIcon} />}
              maxLength={50}
            />
            
            <ProfileInput
              label="Nombre de usuario"
              value={formData.username}
              onChangeText={(text) => setFormData({...formData, username: text})}
              placeholder="Tu nombre de usuario"
              icon={<Ionicons name="at-outline" size={hp(2.5)} color={COLORS.primaryDark} style={styles.inputIcon} />}
              maxLength={30}
            />
            
            <ProfileInput
              label="Teléfono"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              placeholder="Tu número de teléfono"
              icon={<Ionicons name="call-outline" size={hp(2.5)} color={COLORS.primaryDark} style={styles.inputIcon} />}
              keyboardType="phone-pad"
              maxLength={15}
            />
            
            <ProfileInput
              label="Ubicación"
              value={formData.location}
              onChangeText={(text) => setFormData({...formData, location: text})}
              placeholder="Obtén tu ubicación actual"
              icon={<Ionicons name="location-outline" size={hp(2.5)} color={COLORS.primaryDark} style={styles.inputIcon} />}
              rightIcon={
                locationLoading ? 
                <ActivityIndicator size="small" color={COLORS.primary} /> : 
                <FontAwesome5 name="map-marker-alt" size={hp(2)} color={COLORS.primary} />
              }
              onRightIconPress={getLocation}
              maxLength={100}
              editable={!locationLoading}
            />
            
            <ProfileInput
              label="Descripción"
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              placeholder="Cuéntanos sobre ti..."
              icon={<Ionicons name="create-outline" size={hp(2.5)} color={COLORS.primaryDark} style={styles.inputIcon} />}
              multiline={true}
              maxLength={200}
            />
          </View>
          
          {/* Botón de guardar */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Ionicons name="save-outline" size={hp(2.5)} color={COLORS.white} style={{marginRight: 8}} />
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: hp(2.3),
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  backButton: {
    padding: hp(1),
    borderRadius: hp(5),
    marginRight: wp(2),
  },
  headerRight: {
    width: hp(4.5),
  },
  container: {
    flex: 1,
    padding: wp(5),
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: hp(1.5),
  },
  avatarLoading: {
    width: hp(15),
    height: hp(15),
    borderRadius: hp(15) / 2,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: hp(5),
    height: hp(5),
    borderRadius: hp(2.5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarHelp: {
    color: COLORS.textLight,
    fontSize: hp(1.6),
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: wp(5),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: hp(3),
  },
  inputContainer: {
    marginBottom: hp(2.5),
  },
  inputLabel: {
    fontSize: hp(1.8),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: hp(1),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(6),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: wp(3),
    backgroundColor: COLORS.background,
  },
  inputIcon: {
    marginRight: wp(2),
  },
  rightIconButton: {
    padding: hp(0.8),
  },
  input: {
    flex: 1,
    fontSize: hp(1.8),
    color: COLORS.text,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: hp(6.5),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: hp(2),
    fontWeight: '600',
  },
})
