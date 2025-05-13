import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { decode } from 'base64-arraybuffer';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configuración para Google Sign-In al iniciar la aplicación
    useEffect(() => {
        // Configurar Google Sign-In
        GoogleSignin.configure({
            // No necesitamos scopes especiales para autenticación básica
            scopes: ['email', 'profile'],
            // Proporcionamos tanto webClientId como iosClientId explícitamente
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
            iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
            offlineAccess: true,
        });
        
        // También verificamos la sesión al cargar
        checkSession();
    }, []);
    
    // Suscripción a cambios de autenticación
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                setUser(session.user);
                await fetchUserProfile(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
            }
        });
        
        return () => {
            if (authListener) authListener.subscription.unsubscribe();
        };
    }, []);

    // Verificar la sesión actual
    const checkSession = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                setUser(session.user);
                await fetchUserProfile(session.user.id);
            }
        } catch (error) {
            console.error('Error al verificar sesión:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Obtener perfil del usuario
    const fetchUserProfile = async (userId) => {
        try {
            if (!userId) {
                console.error('fetchUserProfile: ID de usuario requerido');
                return;
            }

            console.log('Buscando perfil para el usuario:', userId);

            // Verificar si la tabla profiles existe
            const { error: tableError } = await supabase
                .from('profiles')
                .select('id')
                .limit(1);

            if (tableError && tableError.code === '42P01') { // Tabla no existe
                console.warn('La tabla profiles no existe');
                await createProfilesTable();
                return;
            }

            // Intentar obtener perfil usando maybeSingle() que no arroja error si no hay resultados
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error al consultar perfil:', error);
                return;
            }

            if (data) {
                console.log('Perfil encontrado:', data.id);
                setProfile(data);
            } else {
                console.log('Perfil no encontrado, creando uno nuevo...');
                // Crear perfil si no existe
                await createUserProfile(userId);
            }
        } catch (error) {
            console.error('Error al obtener perfil:', error.message);
        }
    };

    // Crear tabla de perfiles si no existe
    const createProfilesTable = async () => {
        try {
            // Esto normalmente se haría desde el panel de Supabase o con migrations
            // Aquí simulamos la creación (En producción, asegúrate de tener la tabla creada)
            console.log('La tabla perfiles no existe. En producción, créala desde el panel de Supabase.');
        } catch (error) {
            console.error('Error al crear tabla de perfiles:', error.message);
        }
    };

    // Crear perfil para un usuario nuevo
    const createUserProfile = async (userId) => {
        try {
            if (!userId) {
                console.error('createUserProfile: ID de usuario requerido');
                return;
            }

            console.log('Creando nuevo perfil para usuario:', userId);

            // Obtener datos del usuario para metadata
            const { data: userData } = await supabase.auth.getUser(userId);
            let currentUser = userData?.user || user;

            // Si no tenemos usuario, intentamos una vez más con la sesión actual
            if (!currentUser) {
                console.log('Usuario no encontrado inicialmente, intentando obtener de la sesión actual...');
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    currentUser = session.user;
                    console.log('Usuario recuperado de la sesión actual');
                }
            }
            
            // Si definitivamente no hay usuario, registramos el error pero continuamos
            // para evitar bloqueos en el flujo de registro/inicio de sesión
            if (!currentUser) {
                //console.error('Usuario no encontrado después de intentos adicionales');
                // Usamos el ID proporcionado para crear el perfil de todos modos
                currentUser = { id: userId };
            }

            // Preparar datos de perfil
            const username = currentUser?.user_metadata?.username || 
                currentUser.email?.split('@')[0] || 
                'usuario';

            const fullName = currentUser?.user_metadata?.full_name || null;
            const avatarUrl = currentUser?.user_metadata?.avatar_url || null;

            console.log('Insertando perfil con username:', username);

            // Insertar nuevo perfil
            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    username,
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    description: null,
                    phone: null,
                    location: null
                })
                .select()
                .maybeSingle();

            if (error) {
                // Si ya existe el perfil (conflicto)
                if (error.code === '23505') { // Código para violación de restricción única
                    console.log('El perfil ya existe, obteniendo perfil existente...');
                    await fetchUserProfile(userId);
                    return;
                }
                
                console.error('Error al crear perfil:', error);
                return;
            }

            console.log('Perfil creado exitosamente');
            if (data) {
                setProfile(data);
            } else {
                // Si por alguna razón no se devolvió el perfil, intentar obtenerlo
                await fetchUserProfile(userId);
            }
        } catch (error) {
            console.error('Error al crear perfil:', error.message);
        }
    };

    // Actualizar perfil de usuario
    const updateUserProfile = async (profileData) => {
        try {
            if (!user) throw new Error('Usuario no autenticado');
            
            const { error } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', user.id);

            if (error) throw error;
            
            // Refrescar perfil
            await fetchUserProfile(user.id);
            return { success: true };
        } catch (error) {
            console.error('Error al actualizar perfil:', error.message);
            return { success: false, error: error.message };
        }
    };

    // Subir avatar de usuario - usando el mismo enfoque que con las mascotas
    const uploadAvatar = async (uri) => {
        try {
            console.log('Iniciando carga de avatar con base64-arraybuffer...');
            
            // Verificar que tengamos un usuario autenticado
            if (!user || !user.id) {
                console.error('Error: No hay usuario autenticado');
                return { success: false, error: 'No hay usuario autenticado' };
            }
            
            // Verificar que la URI es válida
            if (!uri || typeof uri !== 'string') {
                console.error('Error: URI de imagen inválida');
                return { success: false, error: 'La URI de la imagen no es válida' };
            }
            
            // Crear un nombre de archivo único para evitar colisiones
            const timestamp = new Date().getTime();
            const filePath = `avatar_${user.id}_${timestamp}.jpg`;
            
            try {
                // Convertir la imagen a base64
                console.log('Obteniendo imagen y convirtiendo a base64...');
                const response = await fetch(uri);
                const blob = await response.blob();
                
                // Crear un FileReader para convertir el blob a base64
                const reader = new FileReader();
                
                // Convertir a base64 usando una promesa
                const base64 = await new Promise((resolve) => {
                    reader.onload = () => {
                        const base64data = reader.result;
                        resolve(base64data.split(',')[1]);
                    };
                    reader.readAsDataURL(blob);
                });
                
                console.log('Imagen convertida a base64 correctamente');
                
                // Subir la imagen al bucket 'avatars' usando decode()
                console.log(`Subiendo imagen a bucket 'avatars' con nombre: ${filePath}`);
                
                const { data, error } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, decode(base64), { contentType: 'image/jpeg' });
                
                if (error) {
                    console.error('Error al subir la imagen:', error);
                    return { success: false, error: 'Error al subir la imagen: ' + error.message };
                }
                
                console.log('Imagen subida correctamente, datos:', data);
                
                // Obtener la URL pública
                const publicUrl = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath).data.publicUrl;
                
                console.log('URL pública obtenida:', publicUrl);
                
                // Actualizar el perfil con la nueva URL
                console.log('Actualizando perfil con la nueva URL...');
                
                const { data: profileData, error: updateError } = await supabase
                    .from('profiles')
                    .update({ avatar_url: publicUrl })
                    .eq('id', user.id)
                    .select();
                
                if (updateError) {
                    console.error('Error al actualizar perfil:', updateError);
                    return { success: false, error: 'Error al actualizar el perfil: ' + updateError.message };
                }
                
                console.log('Perfil actualizado correctamente');
                
                // Actualizar estado local
                if (profileData && profileData.length > 0) {
                    setProfile(profileData[0]);
                } else {
                    await fetchUserProfile(user.id);
                }
                
                return { success: true, url: publicUrl };
                
            } catch (error) {
                console.error('Error en el proceso de subida:', error);
                return { success: false, error: 'Error al procesar la imagen: ' + error.message };
            }
        } catch (error) {
            console.error('Error general en uploadAvatar:', error);
            return { success: false, error: 'Error general al subir la imagen de perfil' };
        }
    };

    // Login con email/password
    const signInWithEmail = async (email, password) => {
        try {
            setLoading(true);
            console.log('Iniciando sesión con email...');
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) throw error;
            
            // Actualizar estado de usuario
            setUser(data.user);
            
            // Obtener el perfil del usuario
            await fetchUserProfile(data.user.id);
            
            console.log('Inicio de sesión exitoso. Redirigiendo a home...');
            router.replace('/home');
            
            return { success: true, data };
        } catch (error) {
            console.error('Error al iniciar sesión:', error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Registro con email/password
    const signUpWithEmail = async (email, password, userData) => {
        try {
            setLoading(true);
            console.log('Registrando nuevo usuario...');
            
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            });
            
            if (error) throw error;
            
            // Si el registro fue exitoso pero requiere confirmación por email
            if (data?.user?.identities?.length === 0) {
                console.log('Registro exitoso, se requiere confirmación por email');
                return { success: true, requiresEmailConfirmation: true, data };
            }
            
            // Actualizar estado de usuario
            setUser(data.user);
            
            // Obtener el perfil del usuario (esto lo creará si no existe)
            await fetchUserProfile(data.user.id);
            
            console.log('Registro exitoso. El componente decidirá la redirección.');
            
            // Retornamos un flag especial para indicar que requiere confirmación de email
            // Incluso si Supabase no lo indica explícitamente, queremos mostrar el mensaje
            return { success: true, requiresEmailConfirmation: true, data };
        } catch (error) {
            console.error('Error al registrarse:', error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Manejo de autenticación con Google usando Google Sign-In nativo
    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            
            console.log('Verificando servicios de Google Play...');
            // Verificar que Google Play Services está disponible (solo en Android)
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            
            console.log('Iniciando sesión con Google...');
            // Iniciar el flujo de autenticación de Google
            const userInfo = await GoogleSignin.signIn();
            console.log('Datos obtenidos de Google:', JSON.stringify(userInfo, null, 2));
            
            let idToken = userInfo.idToken;
            
            // Si no tenemos un idToken, intentamos obtenerlo explícitamente
            if (!idToken) {
                console.log('ID token no disponible en respuesta inicial, intentando getTokens()...');
                try {
                    const tokens = await GoogleSignin.getTokens();
                    console.log('Tokens obtenidos:', JSON.stringify(tokens, null, 2));
                    idToken = tokens.idToken;
                } catch (tokenError) {
                    console.error('Error al obtener tokens:', tokenError);
                    throw new Error('No se pudo obtener el ID token de Google, incluso con getTokens()');
                }
            }
            
            // Verificar que finalmente tenemos un ID token
            if (!idToken) {
                throw new Error('No se pudo obtener el ID token de Google después de múltiples intentos');
            }
            
            console.log('ID token obtenido correctamente, autenticando con Supabase...');
            
            // Usar el ID token para autenticar con Supabase
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });
            
            if (error) {
                console.error('Error de Supabase al autenticar con Google:', error);
                throw error;
            }
            
            console.log('Autenticación con Supabase exitosa');
            
            // Actualizar el estado del usuario
            if (data?.user) {
                setUser(data.user);
                await fetchUserProfile(data.user.id);
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('Error en el proceso de inicio de sesión con Google:', error);
            
            // Manejar errores específicos de Google Sign-In
            if (error.code === 12501) { // SIGN_IN_CANCELLED
                console.log('Usuario canceló el inicio de sesión');
                return { success: false, error: 'Inicio de sesión cancelado' };
            }
            
            // Si es un error de configuración o permisos
            if (error.message && (error.message.includes('configuration') || error.message.includes('permission'))) {
                console.error('Error de configuración o permisos:', error);
                return { 
                    success: false, 
                    error: 'Error de configuración: verifica los permisos y configuraciones de Google' 
                };
            }
            
            return { success: false, error: error.message || 'Error en la autenticación con Google' };
        } finally {
            setLoading(false);
        }
    };

    // Función para recuperar contraseña
    const resetPassword = async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'myapp://reset-password',
            });
            
            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('Error al enviar correo de recuperación:', error.message);
            return { success: false, error: error.message };
        }
    };

    // Función para cerrar sesión
    const signOut = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            // Limpiar el estado del usuario
            setUser(null);
            setProfile(null);
            
            // Redirigir al usuario a la pantalla de inicio/login
            router.replace('/login');
            
            return { success: true };
        } catch (error) {
            console.error('Error al cerrar sesión:', error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{ 
                user, 
                profile,
                loading,
                signInWithEmail,
                signUpWithEmail,
                signInWithGoogle,
                resetPassword,
                signOut,
                updateUserProfile,
                uploadAvatar
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);