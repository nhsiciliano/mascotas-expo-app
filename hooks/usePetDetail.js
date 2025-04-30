import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para manejar la lógica de la pantalla de detalles de mascotas
 * @param {string} petId - ID de la mascota
 * @returns {Object} - Estado y funciones para la pantalla de detalles
 */
export const usePetDetail = (petId) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingAdoptionRequest, setLoadingAdoptionRequest] = useState(false);
  const [petData, setPetData] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true); // Indicador de si la mascota está disponible

  const { user, profile } = useAuth();

  /**
   * Verifica si la mascota está en favoritos del usuario
   */
  const checkIfFavorite = async () => {
    try {
      if (!user || !petId) return;

      // Verificar si la tabla favorites existe con una consulta simple
      const { data: testData, error: testError } = await supabase
        .from('favorites')
        .select('id')
        .limit(1);

      // Si hay un error y es porque la tabla no existe, intentamos crearla
      if (testError && testError.code === '42P01') {
        console.log('La tabla favorites no existe, intentando crearla...');

        // Intentamos crear la tabla usando la función RPC
        const { error: createError } = await supabase.rpc('create_favorites_table');

        if (createError) {
          console.error('Error al crear tabla favorites:', createError.message);
          return; // Salimos silenciosamente si hay un error
        }

        console.log('Tabla favorites creada exitosamente');
      } else if (testError) {
        console.warn('Error al verificar tabla favorites:', testError.message);
        return;
      }

      // Ahora verificamos si la mascota está en favoritos
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .match({ user_id: user.id, pet_id: petId });

      if (error) {
        console.error('Error al verificar favoritos:', error.message);
        return;
      }

      setIsFavorite(data && data.length > 0);
    } catch (error) {
      console.error('Error al verificar favoritos:', error.message);
    }
  };

  /**
   * Obtiene los datos de la mascota desde Supabase
   */
  const fetchPetData = async () => {
    try {
      if (!petId) {
        setLoadingInitial(false);
        return;
      }

      setLoading(true);

      // Consulta simplificada para obtener los datos de la mascota sin relaciones complejas
      let { data: pet, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      // Adicional: consultar la información del dueño de la mascota
      let ownerData = null;

      if (pet && pet.user_id) {
        const { data: owner, error: ownerError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', pet.user_id)
          .single();

        if (!ownerError && owner) {
          ownerData = owner;
        } else {
          console.log('Error o no se encontró propietario:', ownerError);
        }
      }

      if (error) {
        console.error('Error al obtener datos de la mascota:', error.message);
        Alert.alert('Error', 'No se pudo cargar la información de la mascota');
        setLoading(false);
        setLoadingInitial(false);
        return;
      }

      // Procesar datos de la mascota si se encuentran
      if (pet) {
        // Realizar consultas adicionales separadas para imágenes
        let { data: images, error: imagesError } = await supabase
          .from('pet_images')
          .select('*')
          .eq('pet_id', petId);

        if (imagesError) {
          console.error('Error al obtener imágenes:', imagesError.message);
          images = [];
        }

        // Imágenes por defecto si no hay imágenes en la base de datos
        const defaultImages = [
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1'
        ];

        // Procesar las imágenes encontradas o usar por defecto
        const processedImages = images && images.length > 0
          ? images
            .sort((a, b) => (a.is_main === b.is_main) ? 0 : a.is_main ? -1 : 1)
            .map(img => img.url)
          : defaultImages;

        // Características clave de la mascota (tipo, género, edad y tamaño)
        const petCharacteristics = [
          // Tipo de mascota
          {
            icon: pet.type?.toLowerCase() === 'gato' ? 'pets' : 'pets',
            label: pet.type || 'No especificado'
          },
          // Género de la mascota
          {
            icon: pet.gender?.toLowerCase() === 'female' ? 'female' : 'male',
            label: pet.gender?.toLowerCase() === 'female' ? 'Hembra' :
              pet.gender?.toLowerCase() === 'male' ? 'Macho' : 'No especificado'
          },
          // Edad de la mascota
          {
            icon: 'schedule',
            label: pet.age || 'No especificada'
          },
          // Tamaño de la mascota
          {
            icon: 'straighten',
            label: pet.size || 'No especificado'
          }
        ];

        // Determinar si la mascota está disponible para adopción
        const isPetAvailable = !pet.adopted_by && pet.status !== 'adoptada';
        setIsAvailable(isPetAvailable);

        // Formato final de los datos de la mascota
        const processedPet = {
          id: pet.id,
          name: pet.name,
          type: pet.type || 'No especificado',
          breed: pet.breed || 'No especificada',
          age: pet.age || 'No especificada',
          gender: pet.gender || 'No especificado',
          size: pet.size || 'No especificado',
          distance: '2.5 km', // Simulado - se podría calcular con la ubicación real
          location: pet.location || 'Buenos Aires, Argentina',
          ownerName: ownerData?.full_name || pet.owner_name || 'Propietario',
          ownerAvatar: ownerData?.avatar_url || pet.owner_avatar,
          description: pet.description || 'No hay descripción disponible',
          photos: processedImages,
          characteristics: petCharacteristics,
          owner_id: pet.user_id
        };

        setPetData(processedPet);
      }

      setLoading(false);
      setLoadingInitial(false);

      // Verificar si la mascota está en favoritos
      await checkIfFavorite();
    } catch (error) {
      console.error('Error al obtener datos de la mascota:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar la información');
      setLoading(false);
      setLoadingInitial(false);
    }
  };

  /**
   * Agrega o quita la mascota de favoritos
   */
  const toggleFavorite = async () => {
    try {
      if (!user) {
        Alert.alert('Inicia sesión', 'Debes iniciar sesión para agregar favoritos');
        return;
      }

      if (!petId) return;

      setLoading(true);

      if (isFavorite) {
        // Quitar de favoritos
        const { error } = await supabase
          .from('favorites')
          .delete()
          .match({ user_id: user.id, pet_id: petId });

        if (error) {
          console.error('Error al quitar de favoritos:', error.message);
          Alert.alert('Error', 'No se pudo quitar de favoritos');
          setLoading(false);
          return;
        }

        setIsFavorite(false);
        Alert.alert('Éxito', 'Mascota quitada de favoritos');
      } else {
        // Agregar a favoritos
        const { error } = await supabase
          .from('favorites')
          .insert([
            { user_id: user.id, pet_id: petId }
          ]);

        if (error) {
          console.error('Error al agregar a favoritos:', error.message);
          Alert.alert('Error', 'No se pudo agregar a favoritos');
          setLoading(false);
          return;
        }

        setIsFavorite(true);
        Alert.alert('Éxito', 'Mascota agregada a favoritos');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error al procesar favorito:', error);
      Alert.alert('Error', 'Ocurrió un error al procesar la operación');
      setLoading(false);
    }
  };

  /**
   * Solicita la adopción de una mascota
   */
  const requestAdoption = async () => {
    try {
      if (!user) {
        Alert.alert('Inicia sesión', 'Debes iniciar sesión para solicitar adopciones');
        return;
      }

      if (!petId || !petData) return;

      // Verificar que el usuario no sea el propietario de la mascota
      if (user.id === petData.owner_id) {
        Alert.alert('Acción no permitida', 'No puedes solicitar la adopción de tu propia mascota');
        return;
      }

      setLoadingAdoptionRequest(true);
      
      // Verificar que la mascota tenga un propietario válido
      if (!petData.owner_id) {
        console.error('La mascota no tiene un propietario válido');
        Alert.alert('Error', 'No se puede determinar el propietario de esta mascota');
        setLoadingAdoptionRequest(false);
        return;
      }

      // Verificar si ya existe una solicitud
      const { data: existingRequests, error: checkError } = await supabase
        .from('adoption_requests')
        .select('*')
        .match({
          requester_id: user.id,
          pet_id: petId,
          status: 'pending'
        });

      if (checkError) {
        console.error('Error al verificar solicitudes:', checkError);
        Alert.alert('Error', 'No se pudo verificar si ya existe una solicitud');
        setLoadingAdoptionRequest(false);
        return;
      }

      // Si ya existe una solicitud pendiente
      if (existingRequests && existingRequests.length > 0) {
        Alert.alert(
          'Solicitud existente',
          'Ya tienes una solicitud pendiente para esta mascota'
        );
        setLoadingAdoptionRequest(false);
        return;
      }

      // Obtener información del solicitante para la notificación
      const { data: requesterProfile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error al obtener perfil del solicitante:', profileError);
      }

      const requesterName = requesterProfile?.full_name || user.email || 'Usuario';

      // Crear la solicitud de adopción utilizando solo los campos existentes en la tabla
      const adoptionRequest = {
        requester_id: user.id,
        pet_id: petId,
        status: 'pending',
        owner_id: petData.owner_id,
        message: `Solicitud de adopción para ${petData.name} por ${requesterName}`
      };

      // Insertar la solicitud de adopción
      const { error: insertError } = await supabase
        .from('adoption_requests')
        .insert([adoptionRequest]);

      if (insertError) {
        console.error('Error al crear solicitud:', insertError);
        Alert.alert('Error', 'No se pudo crear la solicitud de adopción');
        setLoadingAdoptionRequest(false);
        return;
      }

      // Obtener el ID de la solicitud de adopción recién creada
      const { data: createdRequest, error: fetchError } = await supabase
        .from('adoption_requests')
        .select('id')
        .match({
          requester_id: user.id,
          pet_id: petId,
          status: 'pending'
        })
        .order('created_at', { ascending: false })
        .limit(1);

      let requestId = null;
      if (!fetchError && createdRequest && createdRequest.length > 0) {
        requestId = createdRequest[0].id;
        console.log('ID de solicitud creada:', requestId);
      } else if (fetchError) {
        console.error('Error al recuperar ID de solicitud:', fetchError);
      }

      // Crear una notificación para el propietario (si existe tabla notifications)
      try {
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: petData.owner_id,
              title: 'Nueva solicitud de adopción',
              message: `${requesterName} desea adoptar a ${petData.name}`,
              type: 'adoption_request',
              read: false,
              data: { 
                pet_id: petId, 
                requester_id: user.id,
                request_id: requestId // Incluir el ID de la solicitud
              }
            }
          ]);
      } catch (notifError) {
        // Si falla la notificación, solo logueamos el error pero continuamos
        console.log('No se pudo crear notificación (tabla posiblemente no existe):', notifError);
      }

      Alert.alert(
        'Solicitud enviada',
        'Tu solicitud de adopción ha sido enviada. Te contactaremos pronto.',
        [{ text: 'OK' }]
      );

      setLoadingAdoptionRequest(false);
    } catch (error) {
      console.error('Error al solicitar adopción:', error);
      Alert.alert('Error', 'Ocurrió un error al procesar la solicitud');
      setLoadingAdoptionRequest(false);
    }
  };

  // Cargar datos de la mascota al iniciar
  useEffect(() => {
    fetchPetData();
  }, [petId]);

  return {
    petData,
    currentPhotoIndex,
    setCurrentPhotoIndex,
    isFavorite,
    loading,
    loadingInitial,
    loadingAdoptionRequest,
    isAvailable, // Incluir el estado de disponibilidad
    toggleFavorite,
    requestAdoption
  };
};
