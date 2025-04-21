import { supabase } from '../lib/supabase';

/**
 * Obtiene la URL pública de una imagen almacenada en Supabase Storage
 * @param {string} bucket - El nombre del bucket en Supabase Storage
 * @param {string} path - La ruta del archivo en el bucket
 * @returns {Promise<string>} - URL pública de la imagen
 */
export const getPublicUrl = async (bucket, path) => {
    try {
        if (!bucket || !path) return null;
        
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data?.publicUrl || null;
    } catch (error) {
        console.error('Error al obtener URL pública:', error);
        return null;
    }
};

/**
 * Sube una imagen a Supabase Storage
 * @param {string} bucket - El nombre del bucket en Supabase Storage
 * @param {string} path - La ruta donde se almacenará el archivo
 * @param {string} uri - URI local de la imagen a subir
 * @returns {Promise<{path: string, error: Error}>} - Resultado de la operación
 */
export const uploadImage = async (bucket, path, uri) => {
    try {
        // Convertir URI a Blob
        const response = await fetch(uri);
        const blob = await response.blob();
        
        // Subir a Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, blob, {
                upsert: true,
                contentType: 'image/jpeg'
            });
        
        if (error) throw error;
        
        return { path: data?.path || path, error: null };
    } catch (error) {
        console.error('Error al subir imagen:', error);
        return { path: null, error };
    }
};

/**
 * Elimina una imagen de Supabase Storage
 * @param {string} bucket - El nombre del bucket en Supabase Storage
 * @param {string} path - La ruta del archivo a eliminar
 * @returns {Promise<{success: boolean, error: Error}>} - Resultado de la operación
 */
export const deleteImage = async (bucket, path) => {
    try {
        if (!bucket || !path) return { success: false, error: new Error('Bucket o path inválidos') };
        
        const { error } = await supabase.storage.from(bucket).remove([path]);
        
        if (error) throw error;
        
        return { success: true, error: null };
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        return { success: false, error };
    }
};

/**
 * Devuelve la fuente de imagen para un componente Image de React Native
 * Si se proporciona una URL, la devuelve formateada para usar con Image
 * Si no hay URL, devuelve la imagen de perfil por defecto
 * @param {string} imagePath - URL de la imagen o ruta en Storage
 * @returns {object} - Objeto fuente para componente Image
 */
export const getUserImageScr = imagePath => {
    if (imagePath) {
        return { uri: imagePath }
    } else {
        return require('../assets/images/defaultProfile.png')
    }
}