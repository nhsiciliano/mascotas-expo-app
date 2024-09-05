import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Button = ({
    source,
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
        <TouchableOpacity onPress={onPress} className='bg-white border-2 border-lime-800' style={[ styles.button, buttonStyle ]}>
            <Image source={source} style={{ height:30, width: 30 }} />
            <Text style={[ styles.text, textStyle ]}>{title}</Text>
        </TouchableOpacity>
    )
}

export default Button

const styles = StyleSheet.create({
    button: {
        height: hp(6.1),
        width: '90%',
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    text: {
        fontSize: hp(2.2),
        color: 'black',
        fontWeight: '700'
    }
})