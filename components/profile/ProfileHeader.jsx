import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Avatar from '../Avatar';
import { COLORS } from '../../constants/colors';

/**
 * Encabezado del perfil con avatar y datos básicos del usuario
 */
const ProfileHeader = ({ profile, uploadingAvatar, onEditAvatar, isEditMode, children }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Avatar con botón de edición */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          {uploadingAvatar ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <Avatar 
              uri={profile?.avatar_url} 
              size={hp(15)} 
              style={styles.avatar}
            />
          )}
        </View>
        
        {!isEditMode && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={onEditAvatar}
            disabled={uploadingAvatar}
          >
            <Ionicons name="camera" size={hp(2)} color="white" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Nombre y ubicación */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {profile?.full_name || 'Usuario'}
        </Text>
        <View style={styles.userLocation}>
          <MaterialIcons name="place" size={16} color="#666" />
          <Text style={styles.locationText}>
            {profile?.location || 'Sin ubicación'}
          </Text>
        </View>
      </View>
      
      {/* Contenido adicional (como descripción) */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: hp(1.5),
  },
  avatarWrapper: {
    borderRadius: hp(15) / 2,
    borderWidth: 3,
    borderColor: COLORS.primary,
    height: hp(15),
    width: hp(15),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    height: hp(15),
    width: hp(15),
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: hp(4),
    height: hp(4),
    borderRadius: hp(2),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: hp(2.8),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: hp(0.5),
  },
  userLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  locationText: {
    fontSize: hp(1.6),
    color: COLORS.textLight,
    marginLeft: hp(0.5),
  },
});

export default ProfileHeader;
