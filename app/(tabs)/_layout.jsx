import { Tabs, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationBadge from '../../components/badges/NotificationBadge';

// Create a reusable tab button component with label
function TabButton({ label, icon, focused, onPress, badgeCount, ...props }) {
  return (
    <TouchableOpacity
      {...props}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 4,
        width: '100%',
      }}
      onPress={onPress}
    >
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundColor: 'transparent',
          borderRadius: 12,
          padding: 8,
          width: 45,
          height: 45,
        }}
      >
        {icon}
        {badgeCount > 0 && <NotificationBadge count={badgeCount} />}
      </View>
      {label && (
        <Text
          numberOfLines={1}
          style={{
            fontSize: 10,
            marginTop: 2,
            color: focused ? COLORS.primary : COLORS.inactive,
            fontWeight: focused ? '600' : '400',
            textAlign: 'center',
            width: 60,
            paddingHorizontal: 2,
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Create a special center button for "Create new adoption"
function CenterButton({ onPress }) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.primary,
          borderRadius: 35,
          width: 60,
          height: 60,
          bottom: 6,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 8,
          borderWidth: 3,
          borderColor: COLORS.white,
          zIndex: 1,
        }}
      >
        <MaterialCommunityIcons name="paw" size={32} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { unreadCount, markAllAsRead } = useNotifications(); // Obtener contador y función para marcar como leídas
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          elevation: 8,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          paddingTop: 10,
          paddingHorizontal: 10,
          position: 'absolute',
        },
        tabBarButton: (props) => {
          return <TouchableOpacity {...props} />
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        // Hide tab bar on pet detail screens
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: 'Inicio',
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color }) => (
            <TabButton 
              focused={focused}
              label="Inicio"
              icon={
                <MaterialCommunityIcons 
                  name={focused ? "paw" : "paw-outline"}
                  size={26} 
                  color={focused ? COLORS.primary : COLORS.inactive} 
                />
              }
              onPress={() => router.push('/(tabs)/home')}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarLabel: 'Favoritos',
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color }) => (
            <TabButton 
              focused={focused}
              label="Favoritos"
              icon={
                <MaterialIcons 
                  name={focused ? "favorite" : "favorite-outline"} 
                  size={26} 
                  color={focused ? COLORS.primary : COLORS.inactive} 
                />
              }
              onPress={() => router.push('/favorites')}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="createAdoption"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <CenterButton onPress={() => router.push('/createAdoption')} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarLabel: 'Alertas',
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color }) => (
            <TabButton 
              focused={focused}
              label="Actividad"
              badgeCount={unreadCount}
              icon={
                <MaterialIcons 
                  name={focused ? "notifications" : "notifications-none"} 
                  size={26} 
                  color={focused ? COLORS.primary : COLORS.inactive} 
                />
              }
              onPress={() => {
                // Si hay notificaciones no leídas, marcarlas todas como leídas al hacer clic
                if (unreadCount > 0) {
                  markAllAsRead();
                }
                // Navegar a la pantalla de notificaciones
                router.push('/notifications');
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Perfil',
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color }) => (
            <TabButton 
              focused={focused}
              label="Perfil"
              icon={
                <FontAwesome5 
                  name="user" 
                  size={22} 
                  color={focused ? COLORS.primary : COLORS.inactive} 
                  solid={focused} 
                />
              }
              onPress={() => router.push('/profile')}
            />
          ),
        }}
      />
    </Tabs>
  );
}
