import { StyleSheet, View, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { Image } from 'expo-image'
import { getUserImageScr } from '../services/imageService'

export default function Avatar({
    uri,
    user,
    size = hp(4.5),
    style={}
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    
    // Si se proporciona una URI específica, usar esa
    // Si no, intentar usar avatar_url del perfil de usuario si existe
    const imageUri = uri || (user?.user_metadata?.avatar_url);
    
    return (
        <View style={[styles.container, { height: size, width: size }]}>
            <Image
                source={getUserImageScr(imageUri)}
                transition={300}
                contentFit="cover"
                style={[styles.avatar, { height: size, width: size }, style]}
                onLoadStart={() => setLoading(true)}
                onLoad={() => setLoading(false)}
                onError={() => {
                    setError(true);
                    setLoading(false);
                }}
            />
            {loading && (
                <View style={[styles.loadingContainer, { height: size, width: size }]}>
                    <ActivityIndicator size="small" color="#84cc16" />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    avatar: {
        borderRadius: 100,  // Esto hará que sea completamente circular
        borderCurve: 'continuous',
        borderColor: '#84cc16',
        borderWidth: 2,
        backgroundColor: '#f0f0f0',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(240, 240, 240, 0.7)',
        borderRadius: 100,
    }
})