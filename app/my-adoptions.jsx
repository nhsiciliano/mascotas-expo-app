import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { COLORS } from '../constants/colors'


export default function MyAdoptions() {
  const router = useRouter()
  const { user } = useAuth()
  const [adoptions, setAdoptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdoptions()
  }, [])

  const fetchAdoptions = async () => {
    try {
      setLoading(true)
      
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para ver tus adopciones')
        router.push('/welcome')
        return
      }

      // Verificar si la tabla adoptions existe
      const { error: tableCheckError } = await supabase
        .from('adoptions')
        .select('id')
        .limit(1)
      
      if (tableCheckError) {
        console.error('Error al verificar la tabla adoptions:', tableCheckError)
        Alert.alert(
          'Configuración necesaria', 
          'Para utilizar el sistema de adopciones, es necesario crear una tabla "adoptions" en Supabase. Por favor, consulta la documentación para más detalles.'
        )
        setLoading(false)
        return
      }
      
      // Obtener adopciones desde la tabla adopciones
      const { data: adoptionsData, error: adoptionsError } = await supabase
        .from('adoptions')
        .select(`
          id,
          created_at,
          pet_id,
          owner_id,
          adopter_id,
          pet:pet_id (          
            id,
            name,
            type,
            breed,
            age,
            gender,
            size,
            description,
            pet_images (url, is_main)
          )
        `)
        .eq('adopter_id', user.id)
      
      // También buscar mascotas donde el usuario aparece como adopted_by en pets
      const { data: adoptedPets, error: adoptedPetsError } = await supabase
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
          status,
          adopted_by,
          created_at,
          pet_images (url, is_main)
        `)
        .eq('adopted_by', user.id)
      
      if (adoptionsError) {
        console.error('Error al obtener adopciones:', adoptionsError);
        // Continuamos aunque haya un error, ya que podemos obtener datos de la otra fuente
      }
      
      if (adoptedPetsError) {
        console.error('Error al obtener mascotas adoptadas:', adoptedPetsError);
        // Continuamos aunque haya un error
      }
      
      // Procesar los datos para un formato más fácil de usar
      const processedAdoptions = [];
      
      // 1. Procesar adopciones de la tabla adoptions
      if (adoptionsData) {
        const validAdoptions = adoptionsData.filter(adoption => adoption.pet);
        validAdoptions.forEach(adoption => {
          const pet = adoption.pet;
          const mainImage = pet.pet_images?.find(img => img.is_main) || pet.pet_images?.[0];
          
          processedAdoptions.push({
            id: `adoption-${adoption.id}`,
            source: 'adoptions',
            petId: pet.id,
            petName: pet.name,
            petType: pet.type,
            petBreed: pet.breed,
            petAge: pet.age,
            petGender: pet.gender,
            petSize: pet.size,
            adoptionDate: new Date(adoption.created_at).toLocaleDateString(),
            mainImage: mainImage ? mainImage.url : 'https://via.placeholder.com/300x200?text=No+Image'
          });
        });
      }
      
      // 2. Procesar mascotas adoptadas directamente de la tabla pets
      if (adoptedPets) {
        adoptedPets.forEach(pet => {
          // Comprobar si esta mascota ya está en la lista (para evitar duplicados)
          const isDuplicate = processedAdoptions.some(pa => pa.petId === pet.id);
          if (!isDuplicate) {
            const mainImage = pet.pet_images?.find(img => img.is_main) || pet.pet_images?.[0];
            
            processedAdoptions.push({
              id: `pet-${pet.id}`,
              source: 'pets',
              petId: pet.id,
              petName: pet.name,
              petType: pet.type,
              petBreed: pet.breed,
              petAge: pet.age,
              petGender: pet.gender,
              petSize: pet.size,
              adoptionDate: pet.created_at ? new Date(pet.created_at).toLocaleDateString() : 'Fecha desconocida',
              mainImage: mainImage ? mainImage.url : 'https://via.placeholder.com/300x200?text=No+Image'
            });
          }
        });
      }
      
      // Ordenar por fecha de adopción (más recientes primero)
      processedAdoptions.sort((a, b) => {
        return new Date(b.adoptionDate) - new Date(a.adoptionDate);
      });
      
      setAdoptions(processedAdoptions)
    } catch (error) {
      console.error('Error al obtener adopciones:', error)
      Alert.alert('Error', 'No se pudieron cargar las adopciones: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePetPress = (petId) => {
    router.push({
      pathname: '/petDetail',
      params: { id: petId }
    })
  }

  const renderAdoptionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.petCard} 
      activeOpacity={0.8}
      onPress={() => handlePetPress(item.petId)}
    >
      <Image 
        source={{ uri: item.mainImage }} 
        style={styles.petImage}
        resizeMode="cover"
      />
      <View style={styles.petInfo}>
        <View style={styles.petNameContainer}>
          <Text style={styles.petName}>{item.petName}</Text>
        </View>
        <Text style={styles.petBreed}>{item.petBreed || 'Sin raza especificada'}</Text>
        <View style={styles.petDetailRow}>
          <View style={styles.petDetail}>
            <Text style={styles.petDetailText}>{item.petAge || 'N/A'}</Text>
          </View>
          <View style={styles.petDetail}>
            <Text style={styles.petDetailText}>
              {item.petGender === 'male' ? 'Macho' : 'Hembra'}
            </Text>
          </View>
          <View style={styles.petDetail}>
            <Text style={styles.petDetailText}>{item.petSize || 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.adoptionDateContainer}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textLight} />
          <Text style={styles.adoptionDateText}>Adoptado el {item.adoptionDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={hp(2.5)} color={COLORS.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Mis Adopciones</Text>
        
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando adopciones...</Text>
        </View>
      ) : adoptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="paw-outline" size={hp(10)} color={COLORS.primaryLight} />
          <Text style={styles.emptyText}>Aún no has adoptado ninguna mascota</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.browseButtonText}>Explorar mascotas en adopción</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={adoptions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAdoptionItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
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
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    borderRadius: hp(1),
  },
  browseButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: hp(1.8),
  },
  listContainer: {
    padding: wp(4),
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
  adoptionDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.5),
  },
  adoptionDateText: {
    fontSize: hp(1.6),
    color: COLORS.textLight,
    marginLeft: wp(1),
  },
})
