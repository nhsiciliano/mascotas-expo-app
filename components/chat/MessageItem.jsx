import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { formatTime } from '../../utils/chatDateUtils';

/**
 * Componente para mostrar un mensaje individual en el chat
 * @param {object} message - Datos del mensaje
 * @param {string} currentUserId - ID del usuario actual para determinar si es mensaje propio
 */
const MessageItem = ({ message, currentUserId }) => {
  const isUserMessage = message.user_id === currentUserId;
  
  return (
    <View style={[
      styles.messageContainer,
      isUserMessage ? styles.userMessageContainer : styles.otherMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        isUserMessage ? styles.userMessageBubble : styles.otherMessageBubble,
        message.system_message && styles.systemMessageBubble
      ]}>
        <Text style={[
          styles.messageText,
          isUserMessage ? styles.userMessageText : styles.otherMessageText,
          message.system_message && styles.systemMessageText
        ]}>
          {message.message}
        </Text>
        <Text style={[
          styles.messageTime,
          isUserMessage ? styles.userMessageTime : styles.otherMessageTime,
          message.system_message && styles.systemMessageTime
        ]}>
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userMessageBubble: {
    backgroundColor: COLORS.primaryDark,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  systemMessageBubble: {
    backgroundColor: COLORS.lightGrey || '#f1f1f1',
    borderRadius: 12,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.text,
  },
  systemMessageText: {
    color: COLORS.text,
    fontStyle: 'italic',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherMessageTime: {
    color: COLORS.textLight,
  },
  systemMessageTime: {
    color: COLORS.textLight,
  },
});

export default MessageItem;
