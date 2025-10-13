import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { useRouter } from 'expo-router'
import icon from "@/assets/images/check-fact/icon.png";

const boardingData = {
    image: icon,
    name: "Cek Fakta",
    desc: "Cek Fakta membantu memastikan informasi yang kamu terima benar dan terhindar dari hoaks.",
    route: "/check-fact/check" as any
}

export default function CheckFactBoarding() {
    const navigate = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }} className='bg-white'>
        <ScrollView>
            <LinearGradient
              colors={["#1D4ED8", "#137DD3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-6 py-8 relative h-auto flex-col gap-4"
              style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12, }}
            >
            <View className='flex-row justify-start items-center gap-2'>
              <TouchableOpacity onPress={() => navigate.push('/home')} className='flex-row justify-start items-center gap-2'>
                <Image source={back} className='w-[24px] h-[24px]'/>
                <Text className='text-white font-poppins_semibold text-[14px]'>Kembali</Text>
              </TouchableOpacity>
              <View></View>
            </View>
            </LinearGradient>
            <View className='w-full mt-12 h-full flex-col items-center justify-center px-6 gap-10'>
                <Image source={boardingData.image} className='w-[140px] h-[140px]'/>
                <View className='flex-col gap-2'>
                    <Text className='text-[24px] text-center font-poppins_semibold text-primary'>{boardingData.name}</Text>
                    <Text className='text-center font-poppins_regular text-black text-[12px]'>{boardingData.desc}</Text>
                </View>
                <TouchableOpacity onPress={() => navigate.push(boardingData.route)}>
                    <LinearGradient
                        colors={["#1D4ED8", "#137DD3"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="px-8 py-2 relative h-auto flex-col gap-4"
                        style={{ borderRadius: 6 }}
                    >
                        <Text className='text-center font-poppins_medium text-white text-[16px]'>Mulai</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </SafeAreaView>
  )
}
