import React, { useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList,
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Text,
  Keyboard,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

// Componentes modulares
import ChatHeader from '../components/chat/ChatHeader';
import MessageItem from '../components/chat/MessageItem';
import DateSeparator from '../components/chat/DateSeparator';
import MessageInput from '../components/chat/MessageInput';
import AdoptionActions from '../components/chat/AdoptionActions';
import AdoptionConfirmModal from '../components/chat/AdoptionConfirmModal';
import SuccessModal from '../components/chat/SuccessModal';
import FinishedAdoptionModal from '../components/chat/FinishedAdoptionModal';

// Hooks y utilidades
import useChat from '../hooks/useChat';
import { formatDate } from '../utils/chatDateUtils';

/**
 * Pantalla de chat que permite intercambiar mensajes y gestionar adopciones
 */
export default function ChatScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  // Usar hook personalizado para toda la lógica
  const {
    loading,
    sending,
    chat,
    messages,
    newMessage,
    otherUser,
    adoptionRequest,
    pet,
    keyboardVisible,
    adoptionModalVisible,
    adoptionAction,
    processingAdoption,
    successModalContent,
    finishedAdoptionModalContent,
    isPetOwner,
    setNewMessage,
    setKeyboardVisible,
    flatListRef,
    sendMessage,
    scrollToBottom,
    handleShowAdoptionModal,
    handleConfirmAdoption,
    setAdoptionModalVisible,
    getPetImage
  } = useChat(user, params);

  // Configurar escuchas para eventos de teclado
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        scrollToBottom(false);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Forzar scroll al final cuando cambia keyboardVisible
  useEffect(() => {
    if (keyboardVisible) {
      setTimeout(() => {
        scrollToBottom(true);
      }, 150);
    }
  }, [keyboardVisible, scrollToBottom]);

  // Renderizar mensaje individual con separador de fecha si es necesario
  const renderMessageItem = ({ item, index }) => {
    const showDate = index === 0 || 
      formatDate(messages[index - 1]?.created_at) !== formatDate(item.created_at);
    
    return (
      <>
        {showDate && (
          <DateSeparator date={formatDate(item.created_at)} />
        )}
        <MessageItem 
          message={item} 
          currentUserId={user?.id} 
        />
      </>
    );
  };

  // Mostrar la pantalla de carga mientras se inicializa
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ChatHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando conversación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Determinar si es un chat de adopción
  const isAdoptionChat = !!adoptionRequest;
  
  // Determinar si se pueden mostrar los botones de adopción
  const showAdoptionButtons = isAdoptionChat && 
    isPetOwner && 
    adoptionRequest.status === 'accepted';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
      <SafeAreaView style={styles.container}>
        {/* Header del chat - Clickeable para ver la solicitud de adopción */}
        <ChatHeader 
          otherUser={otherUser} 
          pet={pet} 
          isAdoptionChat={isAdoptionChat}
          adoptionRequest={adoptionRequest}
        />
        
        {/* Botones de adopción (solo visibles para el dueño) */}
        {showAdoptionButtons && (
          <AdoptionActions 
            onConcretar={() => handleShowAdoptionModal('concretar')}
            onDesestimar={() => handleShowAdoptionModal('desestimar')}
          />
        )}
        
        {/* Lista de mensajes */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id?.toString() || `temp-${Date.now()}-${Math.random()}`}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => scrollToBottom(false)}
          onLayout={() => scrollToBottom(false)}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay mensajes todavía. Envía el primero para comenzar.
              </Text>
            </View>
          }
        />
        
        {/* Input para enviar mensajes */}
        <MessageInput 
          value={newMessage}
          onChangeText={setNewMessage}
          onSend={sendMessage}
          sending={sending}
          inputAccessoryID="chatInput"
        />
        
        {/* Modal de confirmación para adopción */}
        <AdoptionConfirmModal 
          visible={adoptionModalVisible}
          action={adoptionAction}
          onConfirm={handleConfirmAdoption}
          onCancel={() => setAdoptionModalVisible(false)}
          processing={processingAdoption}
        />
        
        {/* Modal para adopción exitosa */}
        <SuccessModal 
          content={successModalContent} 
        />
        
        {/* Modal para adopción finalizada */}
        <FinishedAdoptionModal 
          content={finishedAdoptionModalContent} 
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 100, // Asegurar suficiente espacio al final
    flexGrow: 1, // Esto permite que el contenedor crezca y se desplace adecuadamente
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
