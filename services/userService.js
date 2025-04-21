import { supabase } from "../lib/supabase";

/**
 * Obtiene los datos del perfil de un usuario. Si el perfil no existe, lo crea.
 * @param {string} userId - ID del usuario
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>} - Resultado de la operación
 */
export const getUserData = async (userId) => {
    try {
        if (!userId) {
            console.error('getUserData: userId es requerido');
            return { success: false, data: null, error: 'ID de usuario requerido' };
        }

        console.log('Buscando perfil para el usuario', userId);
        
        // Intentar obtener el perfil usando maybeSingle() en lugar de single()
        // maybeSingle() devuelve null en lugar de arrojar un error si no hay resultados
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('Error al obtener perfil:', error);
            return { success: false, data: null, error: error.message };
        }

        // Si encontramos el perfil, devolverlo
        if (data) {
            console.log('Perfil encontrado:', data.id);
            return { success: true, data, error: null };
        }

        // Si no hay perfil, intentar crear uno
        console.log('Perfil no encontrado para el usuario', userId, 'creando uno nuevo...');
        
        // Obtener datos de usuario para obtener metadatos
        const { data: userData, error: userError } = await supabase.auth.getUser(userId);
        
        if (userError) {
            console.error('Error al obtener usuario:', userError.message);
            return { success: false, data: null, error: userError.message };
        }
        
        const user = userData?.user;
        if (!user) {
            console.error('Usuario no encontrado en Supabase Auth');
            return { success: false, data: null, error: 'Usuario no encontrado' };
        }
        
        console.log('Creando nuevo perfil para el usuario', userId);
        
        // Crear perfil con datos básicos
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                username: user?.user_metadata?.username || user.email?.split('@')[0] || null,
                full_name: user?.user_metadata?.full_name || null,
                avatar_url: user?.user_metadata?.avatar_url || null,
                description: null,
                phone: null,
                location: null
            })
            .select('*')
            .single();

        if (insertError) {
            console.error('Error al crear perfil:', insertError);
            
            // Si el error es por un perfil que ya existe (conflicto)
            if (insertError.code === '23505') { // Código para violación de restricción única
                console.log('El perfil ya existe, intentando obtenerlo de nuevo...');
                const { data: existingProfile, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle();
                    
                if (fetchError || !existingProfile) {
                    console.error('No se pudo recuperar el perfil existente:', fetchError || 'Perfil no encontrado');
                    return { success: false, data: null, error: 'No se pudo recuperar el perfil existente' };
                }
                
                console.log('Perfil existente recuperado:', existingProfile.id);
                return { success: true, data: existingProfile, error: null };
            }
            
            return { success: false, data: null, error: 'No se pudo crear el perfil: ' + insertError.message };
        }

        console.log('Perfil creado exitosamente:', newProfile.id);
        return { success: true, data: newProfile, error: null };
    } catch (error) {
        console.error('Error inesperado en getUserData:', error);
        return { success: false, data: null, error: error.message };
    }
}