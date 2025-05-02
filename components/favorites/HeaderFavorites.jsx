import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * Componente de cabecera para la pantalla de favoritos
 * @param {number} favoriteCount - Cantidad de mascotas en favoritos
 */
const HeaderFavorites = ({ favoriteCount = 0 }) => {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>Mis Favoritos</Text>
            {favoriteCount > 0 && (
                <Text style={styles.countText}>
                    {favoriteCount} {favoriteCount === 1 ? 'mascota' : 'mascotas'}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 16,
        backgroundColor: COLORS.background,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    countText: {
        fontSize: 14,
        color: COLORS.textLight || '#666',
    },
});

export default HeaderFavorites;
