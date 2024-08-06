import { Pressable, StyleSheet, Text } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Button = ({
    buttonStyle,
    textStyle,
    title='',
    onPress= () => {},
    loading = false,
    hasShadow = true,
}) => {
    const shadowStyle = {

    }
    return (
        <Pressable onPress={onPress} className='bg-teal-700' style={[ styles.button, buttonStyle, hasShadow && shadowStyle ]}>
            <Text style={[ styles.text, textStyle ]}>{title}</Text>
        </Pressable>
    )
}

export default Button

const styles = StyleSheet.create({
    button: {
        height: hp(6.6),
        justifyContent: 'center',
        alignItems: 'center',
        borderCurve: 'continuous',
        borderRadius: 18,
    },
    text: {
        fontSize: hp(2.2),
        color: 'white',
        fontWeight: 'bold'
    }
})