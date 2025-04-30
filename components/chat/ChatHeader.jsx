import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente de encabezado para la pantalla de chat
 * @param {object} otherUser - Información del otro usuario en el chat
 * @param {object} pet - Información de la mascota (si es un chat de adopción)
 * @param {boolean} isAdoptionChat - Indica si es un chat relacionado con una adopción
 * @param {object} adoptionRequest - Solicitud de adopción asociada al chat (opcional)
 */
const ChatHeader = ({ otherUser, pet, isAdoptionChat, adoptionRequest }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.headerContent}
        disabled={!isAdoptionChat || !adoptionRequest}
        onPress={() => {
          if (isAdoptionChat && adoptionRequest?.id) {
            router.push(`/adoption-request?id=${adoptionRequest.id}`);
          }
        }}
      >
        {otherUser?.avatar_url ? (
          <Image 
            source={{ uri: otherUser.avatar_url }} 
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <FontAwesome name="user" size={16} color={COLORS.inactive} />
          </View>
        )}
        
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>
            {otherUser?.full_name || 'Usuario'}
          </Text>
          {isAdoptionChat && pet && (
            <View style={styles.petInfo}>
              <MaterialIcons name="pets" size={14} color={COLORS.textLight} />
              <Text style={styles.petName}>{pet.name}</Text>
              {adoptionRequest && (
                <TouchableOpacity 
                  style={styles.adoptionInfoBadge}
                  onPress={() => {
                    if (adoptionRequest?.id) {
                      router.push(`/adoption-request?id=${adoptionRequest.id}`);
                    }
                  }}
                >
                  <Text style={styles.adoptionInfoText}>Ver solicitud</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={{ width: 40 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40, 
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  petName: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  adoptionInfoBadge: {
    backgroundColor: COLORS.primaryLight || '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  adoptionInfoText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default ChatHeader;
