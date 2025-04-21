import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Botón para cerrar sesión en el perfil
 */
const LogoutButton = ({ onPress }) => {
  return (
    <View style={styles.logoutContainer}>
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={onPress}
      >
        <MaterialIcons name="logout" size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  logoutContainer: {
    paddingHorizontal: wp(2),
    marginBottom: hp(2),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffebee',
    paddingVertical: hp(1.8),
    borderRadius: 12,
    marginTop: hp(2),
  },
  logoutText: {
    color: COLORS.danger,
    marginLeft: 10,
    fontSize: hp(1.8),
    fontWeight: '600',
  },
});

export default LogoutButton;
