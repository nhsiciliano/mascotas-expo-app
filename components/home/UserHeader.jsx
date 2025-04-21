import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { MaterialIcons } from '@expo/vector-icons';
import Avatar from '../Avatar';
import { COLORS } from '../../constants/colors';

/**
 * Encabezado del Home con información del usuario
 */
const UserHeader = ({ profile }) => {
  return (
    <View style={styles.userContainer}>
      <View style={styles.userInfo}>
        <Avatar size={40} uri={profile?.avatar_url} style={styles.avatarStyle} />
        <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>¡Bienvenido!</Text>
          <Text 
            style={styles.usernameText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {profile?.full_name || 'Usuario'}
          </Text>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  userContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStyle: {
    borderWidth: 2, 
    borderColor: COLORS.primary, 
    borderRadius: 50,
  },
  greetingContainer: {
    marginLeft: 10,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  usernameText: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: COLORS.text,
    maxWidth: wp(60),
  },
});

export default UserHeader;
