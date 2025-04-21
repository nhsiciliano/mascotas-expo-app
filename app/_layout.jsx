import { Stack } from 'expo-router';
import '../global.css';
import { AuthProvider } from '../context/AuthContext';

// Componente principal que sirve como layout y proveedor del contexto de autenticación
export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
    );
}