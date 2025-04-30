import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente para mostrar la información del solicitante de la adopción
 * @param {object} profile - Datos del perfil del solicitante
 */
export default function RequesterProfile({ profile }) {
  if (!profile) return null;

  return (
    <View>
      <View style={styles.requesterCard}>
        {profile.avatar_url ? (
          <Image 
            source={{ uri: profile.avatar_url }} 
            style={styles.requesterImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.requesterImage, styles.noAvatar]}>
            <FontAwesome name="user" size={40} color={COLORS.inactive} />
          </View>
        )}
        <View style={styles.requesterInfo}>
          <Text style={styles.requesterName}>{profile.full_name || 'Usuario'}</Text>
          
          {profile.location && (
            <View style={styles.requesterDetail}>
              <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.requesterDetailText}>{profile.location}</Text>
            </View>
          )}
          
          {profile.phone && (
            <View style={styles.requesterDetail}>
              <Ionicons name="call-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.requesterDetailText}>{profile.phone}</Text>
            </View>
          )}
        </View>
      </View>
      
      {profile.description && (
        <Text style={styles.requesterDescription}>{profile.description}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  requesterCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  requesterImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  noAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requesterInfo: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  requesterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  requesterDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requesterDetailText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.textLight,
  },
  requesterDescription: {
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
});
