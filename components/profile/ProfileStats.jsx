import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { COLORS } from '../../constants/colors';

/**
 * Componente para mostrar estadísticas del perfil de usuario
 */
const ProfileStats = ({ stats = { adoptions: 0, favorites: 0, posts: 0 } }) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.adoptions}</Text>
        <Text style={styles.statLabel}>Adopciones</Text>
      </View>
      
      <View style={[styles.statItem, styles.statBorder]}>
        <Text style={styles.statNumber}>{stats.favorites}</Text>
        <Text style={styles.statLabel}>Favoritos</Text>
      </View>
      
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.posts}</Text>
        <Text style={styles.statLabel}>Publicaciones</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: hp(2),
    marginBottom: hp(3),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
  },
  statNumber: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: hp(1.4),
    color: COLORS.textLight,
    marginTop: 3,
  },
});

export default ProfileStats;
