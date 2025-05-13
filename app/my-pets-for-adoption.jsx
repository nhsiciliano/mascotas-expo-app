import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { COLORS } from '../constants/colors'


export default function MyPetsForAdoption() {
  const router = useRouter()
  const { user } = useAuth()
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyPets()
  }, [])

  const fetchMyPets = async () => {
    try {
      setLoading(true)
      
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para ver tus mascotas en adopción')
        router.push('/welcome')
        return
      }
      
      // Obtener mascotas en adopción publicadas por el usuario - versión mejorada
      const { data, error } = await supabase
        .from('pets')
        .select(`
          id,
          name,
          type,
          breed,
          age,
          gender,
          size,
          description,
          created_at,
          user_id,
          status,
          adopted_by,
          pet_images (url, is_main)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      // Procesar datos para mostrar - versión mejorada para detectar estado de adopción
      const processedPets = data.map(pet => {
        const mainImage = pet.pet_images?.find(img => img.is_main) || pet.pet_images?.[0] || null;
        
        // Determinar el estado de la mascota
        let petStatus = 'available'; // Estado predeterminado
        
        // Verificar si la mascota ha sido adoptada
        if (pet.status === 'adoptada' || pet.adopted_by) {
          petStatus = 'adopted';
        }
        
        return {
          id: pet.id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          age: pet.age,
          gender: pet.gender,
          size: pet.size,
          description: pet.description,
          status: petStatus,
          created_at: new Date(pet.created_at).toLocaleDateString(),
          mainImage: mainImage ? mainImage.url : 'https://via.placeholder.com/300x200?text=No+Image',
          adopter_id: pet.adopted_by
        }
      })
      
      setPets(processedPets)
    } catch (error) {
      console.error('Error al obtener mascotas:', error)
      Alert.alert('Error', 'No se pudieron cargar tus mascotas en adopción: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'adopted':
        return { 
          text: 'Adoptada', 
          color: '#E74C3C', // Rojo apagado para indicar que ya no está disponible
          bgColor: '#FADBD8' // Fondo rojo claro
        }
      case 'unavailable':
        return { 
          text: 'Pausada', 
          color: '#F39C12', // Color naranja/ámbar para indicar estado pausado
          bgColor: '#FEF9E7' // Fondo amarillo claro
        }
      case 'available':
      default:
        return { 
          text: 'Disponible', 
          color: COLORS.primary, // Verde para mascotas disponibles
          bgColor: COLORS.primaryLight 
        }
    }
  }

  const handlePetPress = (petId) => {
    router.push({
      pathname: '/petDetail',
      params: { id: petId, isOwner: true }
    })
  }

  const togglePetAvailability = (petId, petName, currentStatus) => {
    // Determinar si estamos habilitando o deshabilitando la disponibilidad
    const isCurrentlyAvailable = currentStatus === 'available';
    
    // Configurar mensajes según la acción
    const actionTitle = isCurrentlyAvailable ? 'Pausar adopción' : 'Reactivar adopción';
    const actionMessage = isCurrentlyAvailable
      ? `¿Estás seguro que quieres que ${petName} ya no esté disponible para adopción? Dejará de aparecer en el feed de adopciones disponibles.`
      : `¿Quieres que ${petName} vuelva a estar disponible para adopción? Aparecerá nuevamente en el feed de adopciones disponibles.`;
    const actionButtonText = isCurrentlyAvailable ? 'Pausar' : 'Reactivar';
    const actionButtonStyle = isCurrentlyAvailable ? 'destructive' : 'default';
    const newStatus = isCurrentlyAvailable ? 'no_disponible' : 'disponible';
    const newUIStatus = isCurrentlyAvailable ? 'unavailable' : 'available';
    const successMessage = isCurrentlyAvailable 
      ? `${petName} se ha pausado del listado de adopciones.`
      : `${petName} está disponible nuevamente para adopción.`;
    
    // Mostrar diálogo de confirmación con estilo acorde a la app
    Alert.alert(
      actionTitle,
      actionMessage,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: actionButtonText,
          style: actionButtonStyle,
          onPress: async () => {
            try {
              setLoading(true)
              
              // Actualizar el estado de la mascota en la base de datos
              const { error } = await supabase
                .from('pets')
                .update({ 
                  status: newStatus 
                })
                .eq('id', petId)
              
              if (error) throw error
              
              // Actualizar la lista local
              setPets(prevPets => 
                prevPets.map(pet => 
                  pet.id === petId 
                    ? {...pet, status: newUIStatus} 
                    : pet
                )
              )
              
              Alert.alert('Éxito', successMessage)
            } catch (error) {
              console.error(`Error al ${isCurrentlyAvailable ? 'pausar' : 'reactivar'} mascota:`, error)
              Alert.alert('Error', `No se pudo ${isCurrentlyAvailable ? 'pausar' : 'reactivar'} la mascota: ` + error.message)
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleCreateNewPet = () => {
    router.push('/createAdoption')
  }

  const renderPetItem = ({ item }) => {
    const statusBadge = getStatusBadge(item.status)
    
    return (
      <TouchableOpacity 
        style={styles.petCard} 
        activeOpacity={0.8}
        onPress={() => handlePetPress(item.id)}
      >
        <Image 
          source={{ uri: item.mainImage }} 
          style={styles.petImage}
          resizeMode="cover"
        />
        <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
          <Text style={[styles.statusText, { color: statusBadge.color }]}>{statusBadge.text}</Text>
        </View>
        <View style={styles.petInfo}>
          <View style={styles.petNameContainer}>
            <Text style={styles.petName}>{item.name}</Text>
            <TouchableOpacity 
              style={item.status === 'available' ? styles.pauseButton : styles.activateButton}
              onPress={() => togglePetAvailability(item.id, item.name, item.status)}
            >
              {item.status === 'available' ? (
                <MaterialIcons name="pause-circle-outline" size={20} color={COLORS.error || '#E74C3C'} />
              ) : (
                <MaterialIcons name="play-circle-outline" size={20} color={COLORS.success || '#2ECC71'} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.petBreed}>{item.breed || 'Sin raza especificada'}</Text>
          <View style={styles.petDetailRow}>
            <View style={styles.petDetail}>
              <Text style={styles.petDetailText}>{item.age || 'N/A'}</Text>
            </View>
            <View style={styles.petDetail}>
              <Text style={styles.petDetailText}>
                {item.gender === 'male' ? 'Macho' : 'Hembra'}
              </Text>
            </View>
            <View style={styles.petDetail}>
              <Text style={styles.petDetailText}>{item.size || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textLight} />
            <Text style={styles.dateText}>Publicado el {item.created_at}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={hp(2.5)} color={COLORS.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Mis Mascotas en Adopción</Text>
        
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando tus mascotas...</Text>
        </View>
      ) : (
        <>
          {pets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="paw-outline" size={hp(10)} color={COLORS.primaryLight} />
              <Text style={styles.emptyText}>Aún no has publicado mascotas en adopción</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleCreateNewPet}
              >
                <Text style={styles.addButtonText}>Publicar una mascota</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={pets}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPetItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.createNewButton}
                  onPress={handleCreateNewPet}
                >
                  <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
                  <Text style={styles.createNewButtonText}>Publicar nueva mascota</Text>
                </TouchableOpacity>
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerRight: {
    width: wp(10),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: hp(1.8),
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10),
  },
  emptyText: {
    fontSize: hp(2),
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    borderRadius: hp(1),
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: hp(1.8),
  },
  listContainer: {
    padding: wp(4),
    paddingBottom: hp(5),
  },
  petCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: hp(2),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  petImage: {
    width: '100%',
    height: hp(20),
  },
  statusBadge: {
    position: 'absolute',
    top: hp(2),
    right: wp(4),
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(3),
    borderRadius: hp(1),
    zIndex: 1,
  },
  statusText: {
    fontSize: hp(1.5),
    fontWeight: '600',
  },
  petInfo: {
    padding: wp(4),
  },
  petNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  petName: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editButton: {
    padding: wp(1),
  },
  pauseButton: {
    padding: wp(1),
    // Estilo para destacar acción de pausar disponibilidad
    borderRadius: 20,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  activateButton: {
    padding: wp(1),
    // Estilo para destacar acción de reactivar disponibilidad
    borderRadius: 20,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
  },
  petBreed: {
    fontSize: hp(1.8),
    color: COLORS.textLight,
    marginBottom: hp(1),
  },
  petDetailRow: {
    flexDirection: 'row',
    marginBottom: hp(1.5),
  },
  petDetail: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(3),
    borderRadius: hp(1),
    marginRight: wp(2),
  },
  petDetailText: {
    fontSize: hp(1.6),
    color: COLORS.primary,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.5),
  },
  dateText: {
    fontSize: hp(1.6),
    color: COLORS.textLight,
    marginLeft: wp(1),
  },
  createNewButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: hp(1),
    marginTop: hp(2),
    alignSelf: 'center',
  },
  createNewButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: hp(1.8),
    marginLeft: wp(2),
  },
})
