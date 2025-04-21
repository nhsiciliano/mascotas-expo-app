import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Formulario para editar los datos del perfil
 */
const ProfileForm = ({ profile, onChange, onCancel, onSave, loading }) => {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Editar perfil</Text>
      
      {/* Nombre completo */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          value={profile.full_name}
          onChangeText={(text) => onChange('full_name', text)}
          placeholder="Ingresa tu nombre completo"
        />
      </View>
      
      {/* Descripción / Bio */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={profile.description}
          onChangeText={(text) => onChange('description', text)}
          placeholder="Una descripción breve sobre ti"
          multiline
          numberOfLines={4}
        />
      </View>
      
      {/* Teléfono */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          onChangeText={(text) => onChange('phone', text)}
          placeholder="Ingresa tu número de teléfono"
          keyboardType="phone-pad"
        />
      </View>
      
      {/* Ubicación */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Ubicación</Text>
        <TextInput
          style={styles.input}
          value={profile.location}
          onChangeText={(text) => onChange('location', text)}
          placeholder="Tu ubicación actual"
        />
      </View>
      
      {/* Botones de acción */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={onCancel}
          disabled={loading}
        >
          <MaterialIcons name="close" size={20} color={COLORS.textLight} />
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton, loading && styles.disabledButton]} 
          onPress={onSave}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.saveButtonText}>Guardando...</Text>
          ) : (
            <>
              <MaterialIcons name="check" size={20} color={COLORS.white} />
              <Text style={styles.saveButtonText}>Guardar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: hp(2.5),
    marginBottom: hp(2.5),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  formTitle: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: hp(2),
  },
  inputContainer: {
    marginBottom: hp(2),
  },
  inputLabel: {
    fontSize: hp(1.6),
    color: COLORS.textLight,
    marginBottom: hp(0.8),
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 8,
    padding: hp(1.5),
    fontSize: hp(1.7),
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  textArea: {
    minHeight: hp(12),
    textAlignVertical: 'top',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(2),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: hp(1.5),
    width: '48%',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: COLORS.textLight,
    marginLeft: 5,
    fontSize: hp(1.7),
    fontWeight: '500',
  },
  saveButtonText: {
    color: COLORS.white,
    marginLeft: 5,
    fontSize: hp(1.7),
    fontWeight: '500',
  },
});

export default ProfileForm;
