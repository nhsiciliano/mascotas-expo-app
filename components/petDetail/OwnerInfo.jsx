import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente para mostrar la información del dueño de la mascota
 */
const OwnerInfo = ({ ownerName, ownerAvatar, onContactPress }) => {
  return (
    <View style={styles.ownerContainer}>
      <View style={styles.ownerAvatarContainer}>
        {ownerAvatar ? (
          <Image 
            source={{ uri: ownerAvatar }} 
            style={styles.ownerAvatar} 
          />
        ) : (
          <FontAwesome name="user" size={30} color={COLORS.primary} />
        )}
      </View>
      
      <View style={styles.ownerInfo}>
        <Text style={styles.ownerTitle}>Publicado por</Text>
        <Text style={styles.ownerName}>{ownerName || 'Propietario'}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.contactButton}
        onPress={onContactPress}
      >
        <MaterialIcons name="chat" size={16} color={COLORS.white} />
        <Text style={styles.contactButtonText}>Usuario</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 100, // Espacio para el botón de adopción
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  ownerAvatarContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: COLORS.primaryLight,
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  ownerTitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  contactButtonText: {
    color: COLORS.white,
    fontWeight: '500',
    marginLeft: 5,
  },
});

export default OwnerInfo;
