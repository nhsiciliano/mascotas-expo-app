import { View, Text, Image } from 'react-native'
import React from 'react'
import PetSubInfoCard from './PetSubInfoCard'

export default function PetSubinfo({ pet }) {
    return (
        <View className='px-3'>
            <View className='flex flex-row'>
                <PetSubInfoCard
                    icon={require('../../assets/images/calendario-reloj.png')}
                    title={'Edad'}
                    value={pet?.age}
                />
                <PetSubInfoCard
                    icon={require('../../assets/images/venus-marte.png')}
                    title={'Sexo'}
                    value={pet?.sex}
                />
            </View>
            <View className='flex flex-row'>
                <PetSubInfoCard
                    icon={require('../../assets/images/libro-medico.png')}
                    title={'Castrado'}
                    value={pet?.castrado}
                />
                <PetSubInfoCard
                    icon={require('../../assets/images/bacteria.png')}
                    title={'Desparasitado'}
                    value={pet?.desparasitado}
                />
            </View>
        </View>
    )
}