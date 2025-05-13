import { View, Text, Image, FlatList, TouchableOpacity, Dimensions, StyleSheet, Animated } from 'react-native'
import React, { useState, useRef } from 'react'
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';


// Contenido para cada página del onboarding
const onboardingData = [
    {
        id: '1',
        image: require('../assets/images/onboarding01.png'),
        title: 'Encuentra a tu mascota cerca tuyo y dale una oportunidad.'
    },
    {
        id: '2',
        image: require('../assets/images/onboarding02.png'),
        title: 'Gestiona tus adopciones de forma rápida y sencilla. Conecta con refugios y adopciones a tu alrededor.'
    },
    {
        id: '3',
        image: require('../assets/images/onboarding03.png'),
        title: 'Unete a una comunidad de adoptantes y ayuda a miles de animales que necesitan una oportunidad.'
    }
];

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const slidesRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    // Renderizar cada slide/página
    const renderItem = ({ item }) => {
        return (
            <View style={[styles.slide, { width }]}>
                <Image
                    source={item.image}
                    style={styles.image}
                    resizeMode="contain"
                />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                </View>
            </View>
        );
    };

    // Renderizar los indicadores de página
    const Paginator = () => {
        return (
            <View style={styles.paginationContainer}>
                {onboardingData.map((_, i) => {
                    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [10, 20, 10],
                        extrapolate: 'clamp'
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp'
                    });

                    return (
                        <Animated.View
                            style={[styles.dot, { width: dotWidth, opacity }]}
                            key={i.toString()}
                        />
                    );
                })}
            </View>
        );
    };

    // Marcar que el onboarding ya fue visto
    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('@onboarding_completed', 'true');
            router.push('login');
        } catch (error) {
            console.error('Error saving onboarding status:', error);
            router.push('login');
        }
    };

    // Avanzar a la siguiente pantalla o finalizar
    const goToNextSlide = () => {
        if (currentIndex < onboardingData.length - 1) {
            slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            completeOnboarding();
        }
    };

    // Saltar el onboarding
    const skipOnboarding = () => {
        completeOnboarding();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
                <Text style={styles.skipText}>Omitir</Text>
            </TouchableOpacity>

            <Animated.FlatList
                data={onboardingData}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={32}
                onViewableItemsChanged={viewableItems => {
                    if (viewableItems.viewableItems.length > 0) {
                        setCurrentIndex(viewableItems.viewableItems[0].index);
                    }
                }}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                ref={slidesRef}
            />

            <View style={styles.bottomContainer}>
                <Paginator />

                <TouchableOpacity
                    style={styles.button}
                    onPress={goToNextSlide}
                >
                    <Text style={styles.buttonText}>
                        {currentIndex === onboardingData.length - 1 ? 'Comenzar' : 'Siguiente'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9fb',
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    image: {
        width: width * 0.8,
        height: height * 0.5,
        marginBottom: 30,
    },
    textContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    title: {
        fontSize: hp(2.5),
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: hp(3.5),
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginHorizontal: 5,
    },
    bottomContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: hp(2),
        fontWeight: 'bold',
    },
    skipButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    skipText: {
        fontSize: hp(1.8),
        color: COLORS.primary,
        fontWeight: '600',
    },
});