import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Componente para la entrada de mensajes
 * @param {string} value - Valor actual del campo de texto
 * @param {function} onChangeText - Función para manejar el cambio de texto
 * @param {function} onSend - Función para enviar el mensaje
 * @param {boolean} sending - Indica si se está enviando un mensaje actualmente
 * @param {string} inputAccessoryID - ID para el accessory view (iOS)
 */
const MessageInput = ({ value, onChangeText, onSend, sending, inputAccessoryID }) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Escribe un mensaje..."
        value={value}
        onChangeText={onChangeText}
        multiline
        inputAccessoryViewID={inputAccessoryID}
        placeholderTextColor={COLORS.textLight}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!value.trim() || sending) && styles.disabledSendButton
        ]}
        onPress={onSend}
        disabled={!value.trim() || sending}
      >
        {sending ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Ionicons name="send" size={18} color={COLORS.white} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    color: COLORS.text,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    opacity: 0.6,
  },
});

export default MessageInput;
