import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { COLORS } from '../../constants/colors';

/**
 * Componente para mostrar la fecha de la solicitud
 * @param {string} date - Fecha en formato string (ISO)
 */
export default function RequestDate({ date }) {
  const getFormattedDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
    } catch (error) {
      return 'Fecha desconocida';
    }
  };

  return (
    <View style={styles.dateContainer}>
      <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
      <Text style={styles.dateText}>
        Solicitado el {getFormattedDate(date)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.textLight,
  },
});
