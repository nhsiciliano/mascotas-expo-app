import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Componentes
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';
import LogoutButton from '../../components/profile/LogoutButton';
import ProfileForm from '../../components/profile/ProfileForm';
import LogoutConfirmModal from '../../components/profile/LogoutConfirmModal';

// Hooks
import { useProfile } from '../../hooks/useProfile';
import { useProfileStats } from '../../hooks/useProfileStats';

// Constantes
import { COLORS } from '../../constants/colors';

export default function Profile() {
    const router = useRouter();
    const {
        profile,
        userProfile,
        editMode,
        uploadingAvatar,
        logoutModalVisible,
        setLogoutModalVisible,
        loading,
        handleProfileChange,
        handleSelectImage,
        handleSaveProfile,
        handleLogout,
        confirmLogout,
        cancelEdit
    } = useProfile();

    // Obtener estadísticas reales del usuario
    const { stats: userStats, loading: loadingStats } = useProfileStats();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {editMode ? (
                    // Modo de edición
                    <ProfileForm
                        profile={userProfile}
                        onChange={handleProfileChange}
                        onCancel={cancelEdit}
                        onSave={handleSaveProfile}
                        loading={loading}
                    />
                ) : (
                    // Modo visualización
                    <>
                        {/* Header con título */}
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerTitle}>Mi perfil</Text>
                        </View>
                        {/* Cabecera con avatar y datos básicos */}
                        <ProfileHeader
                            profile={profile}
                            uploadingAvatar={uploadingAvatar}
                            onEditAvatar={handleSelectImage}
                        >
                            {/* Descripción del usuario */}
                            {profile?.description && (
                                <View style={styles.bioContainer}>
                                    <Text style={styles.bioText}>
                                        {profile.description}
                                    </Text>
                                </View>
                            )}
                        </ProfileHeader>


                        {/* Estadísticas del perfil */}
                        <ProfileStats stats={userStats} loading={loadingStats} />

                        {/* Sección de información personal */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Información personal</Text>
                            </View>

                            {/* Teléfono */}
                            <View style={styles.infoItem}>
                                <View style={styles.infoIconContainer}>
                                    <MaterialIcons name="phone" size={20} color={COLORS.primary} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Teléfono</Text>
                                    <Text style={styles.infoText}>
                                        {profile?.phone || 'No especificado'}
                                    </Text>
                                </View>
                            </View>

                            {/* Ubicación */}
                            <View style={styles.infoItem}>
                                <View style={styles.infoIconContainer}>
                                    <MaterialIcons name="place" size={20} color={COLORS.primary} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Ubicación</Text>
                                    <Text style={styles.infoText}>
                                        {profile?.location || 'No especificada'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Menú de opciones */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Opciones</Text>

                            <ProfileMenuItem
                                icon={<MaterialIcons name="settings" size={20} color={COLORS.primary} />}
                                title="Configurar mi perfil"
                                onPress={() => router.push('/settings')}
                            />

                            <ProfileMenuItem
                                icon={<MaterialIcons name="pets" size={20} color={COLORS.primary} />}
                                title="Mis adopciones"
                                onPress={() => router.push('/my-adoptions')}
                            />

                            <ProfileMenuItem
                                icon={<FontAwesome name="paw" size={20} color={COLORS.primary} />}
                                title="Mis mascotas en adopción"
                                onPress={() => router.push('/my-pets-for-adoption')}
                            />
                            
                            <ProfileMenuItem
                                icon={<FontAwesome name="heart" size={18} color={COLORS.primary} />}
                                title="Mis favoritos"
                                onPress={() => router.push('/favorites')}
                            />
                        </View>

                        {/* Botón de cerrar sesión */}
                        <LogoutButton onPress={handleLogout} />

                        {/* Espaciador para el final del scroll */}
                        <View style={styles.bottomSpacer} />
                    </>
                )}
            </ScrollView>

            {/* Modal de confirmación de cierre de sesión */}
            <LogoutConfirmModal
                visible={logoutModalVisible}
                onConfirm={confirmLogout}
                onCancel={() => setLogoutModalVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingHorizontal: wp(4),
        paddingTop: hp(2),
    },
    headerContainer: {
        marginBottom: hp(2),
        paddingBottom: hp(1),
    },
    headerTitle: {
        fontSize: hp(2.8),
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
    },
    sectionContainer: {
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1.5),
    },
    sectionTitle: {
        fontSize: hp(2),
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: hp(1.5),
    },
    bioContainer: {
        marginTop: hp(0.5),
        paddingHorizontal: wp(10),
    },
    bioText: {
        fontSize: hp(1.6),
        color: COLORS.textLight,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1.5),
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: hp(1.4),
        color: COLORS.textLight,
    },
    infoText: {
        fontSize: hp(1.6),
        color: COLORS.text,
    },
    bottomSpacer: {
        height: hp(10),
    },
});
