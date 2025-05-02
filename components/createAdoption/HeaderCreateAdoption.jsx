import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente de cabecera para la pantalla de creación de adopción
 * @param {boolean} isSubmitting - Indica si el formulario está siendo enviado
 * @param {string} title - Título de la cabecera (opcional)
 */
const HeaderCreateAdoption = ({ isSubmitting, title = 'Publicar Adopción' }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                disabled={isSubmitting}
            >
                <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>{title}</Text>

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
        backgroundColor: COLORS.background,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
});

export default HeaderCreateAdoption;