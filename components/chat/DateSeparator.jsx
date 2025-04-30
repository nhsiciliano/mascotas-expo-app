import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * Componente para mostrar un separador de fecha en la lista de mensajes
 * @param {string} date - Fecha formateada a mostrar
 */
const DateSeparator = ({ date }) => {
  if (!date) return null;
  
  return (
    <View style={styles.dateContainer}>
      <Text style={styles.dateText}>{date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  dateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textLight,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

export default DateSeparator;
