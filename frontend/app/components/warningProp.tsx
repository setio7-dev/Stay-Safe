import React, { useState, useRef } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Audio } from 'expo-av'
import { useFocusEffect } from '@react-navigation/native'
import warning from "@/assets/images/maps/warning.png"
import cancel from "@/assets/images/icon/cancel.png"

export default function WarningProp({ onEvacuate = () => {} }: { onEvacuate?: () => void }) {
  const [show, setShow] = useState(true)
  const soundRef = useRef<Audio.Sound | null>(null)

  useFocusEffect(
    React.useCallback(() => {
      const loadSound = async () => {
        const { sound } = await Audio.Sound.createAsync(require('@/assets/images/maps/alarm.wav'))
        soundRef.current = sound
        if (show) await soundRef.current.replayAsync()
      }
      loadSound()

      return () => {
        if (soundRef.current) {
          soundRef.current.stopAsync()
          soundRef.current.unloadAsync()
        }
      }
    }, [show])
  )

  return (
    <SafeAreaView
      edges={['top']}
      className={`absolute top-0 left-0 right-0 bg-black/50 z-50 flex-1 h-full justify-center items-center ${show ? 'flex' : 'hidden'}`}
    >
      <View className='bg-white px-4 py-6 rounded-lg flex-col items-center justify-center w-[280px] relative'>
        <TouchableOpacity className='absolute top-6 right-6' onPress={() => setShow(false)}>
          <Image source={cancel} className='w-[20px] h-[20px]'/>
        </TouchableOpacity>
        <Image source={warning} className='w-[140px] h-[140px]'/>        
        <Text className='text-red text-center text-[24px] font-poppins_semibold'>PERINGATAN!!</Text>
        <Text className='text-center text-black font-poppins_medium text-[12px]'>
          Anda berada di area berisiko tinggi. Harap segera waspada dan ambil langkah untuk melindungi diri.
        </Text>
        <TouchableOpacity
          onPress={() => {
            setShow(false)
            onEvacuate()
          }}
        >
          <LinearGradient
            colors={["#1D4ED8", "#137DD3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 py-2 relative h-auto mt-6"
            style={{ borderRadius: 6 }}
          >
            <Text className='text-white font-poppins_medium text-[14px]'>Cari Jalur Evakuasi</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
