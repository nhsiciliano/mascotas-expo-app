import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

/**
 * Hook personalizado para manejar la lógica del perfil de usuario
 * @returns {Object} Métodos y estados para el manejo del perfil
 */
export const useProfile = () => {
  const { user, signOut, uploadAvatar, updateProfile, profile, loading } = useAuth();
  
  // Estados
  const [editMode, setEditMode] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState({
    full_name: '',
    description: '',
    phone: '',
    location: 'Buenos Aires, Argentina',
  });

  // Inicializar el perfil cuando cambia
  useEffect(() => {
    if (profile) {
      setUserProfile({
        full_name: profile.full_name || '',
        description: profile.description || '',
        phone: profile.phone || '',
        location: profile.location || 'Buenos Aires, Argentina',
      });
    }
  }, [profile]);

  /**
   * Actualiza un campo específico del perfil
   * @param {string} field - Campo a actualizar
   * @param {string} value - Nuevo valor
   */
  const handleProfileChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Maneja la selección y subida de imagen de perfil
   */
  const handleSelectImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tu galería');
        return;
      }
      
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!pickerResult.canceled) {
        setUploadingAvatar(true);
        const { success, error } = await uploadAvatar(pickerResult.assets[0].uri);
        setUploadingAvatar(false);
        
        if (!success) {
          Alert.alert('Error', error || 'No se pudo subir la imagen. Inténtalo de nuevo.');
        }
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'Ocurrió un error al seleccionar la imagen');
      setUploadingAvatar(false);
    }
  };

  /**
   * Guarda los cambios del perfil
   */
  const handleSaveProfile = async () => {
    try {
      const { success, error } = await updateProfile(userProfile);
      
      if (success) {
        setEditMode(false);
      } else {
        Alert.alert('Error', error || 'No se pudieron guardar los cambios.');
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar los cambios');
    }
  };

  /**
   * Maneja el evento de cerrar sesión
   */
  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  /**
   * Confirma y ejecuta el cierre de sesión
   */
  const confirmLogout = () => {
    setLogoutModalVisible(false);
    if (signOut) {
      signOut();
    }
  };

  /**
   * Cancela la edición del perfil
   */
  const cancelEdit = () => {
    // Restablece los valores originales
    if (profile) {
      setUserProfile({
        full_name: profile.full_name || '',
        description: profile.description || '',
        phone: profile.phone || '',
        location: profile.location || 'Buenos Aires, Argentina',
      });
    }
    setEditMode(false);
  };

  return {
    user,
    profile,
    userProfile,
    editMode,
    setEditMode,
    uploadingAvatar,
    logoutModalVisible,
    setLogoutModalVisible,
    loading,
    handleProfileChange,
    handleSelectImage,
    handleSaveProfile,
    handleLogout,
    confirmLogout,
    cancelEdit
  };
};
