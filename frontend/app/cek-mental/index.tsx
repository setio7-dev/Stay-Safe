import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { useRouter } from 'expo-router'
import icon from "@/assets/images/cek-mental/icon1.png";
import status1 from "@/assets/images/cek-mental/status1.png";
import DynamicImage from '../lib/dynamicImage'

const boardingData = {
    image: icon,
    desc: "Jawablah beberapa pertanyaan sederhana tentang perasaan dan keseharianmu. Proses ini hanya butuh 2–3 menit, tidak ada jawaban benar atau salah. Semua jawaban aman, bersifat pribadi, dan akan dianalisis oleh AI untuk memberikan gambaran kondisi mental serta saran positif untukmu.",
    route: "/cek-mental/cekMental" as any
}

export default function Index() {
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
              <View className='flex-row justify-between items-center'>
                <TouchableOpacity onPress={() => navigate.back()}>
                  <Image source={back} className='w-[24px] h-[24px]'/>
                </TouchableOpacity>
                <Text className='text-white font-poppins_semibold text-[16px]'>Cek Mental</Text>
                <View className='mr-6'></View>
              </View>
            </LinearGradient>
            <View className='w-full mt-0 h-full flex-col items-center justify-center px-6 gap-10'>
                <DynamicImage source={status1}/>
                <Image source={boardingData.image} className='w-[140px] h-[140px] mt-4'/>
                <Text className='text-center font-poppins_regular text-black text-[12px]'>{boardingData.desc}</Text>
                <TouchableOpacity className='w-full' onPress={() => navigate.push(boardingData.route)}>
                    <LinearGradient
                        colors={["#1D4ED8", "#137DD3"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="px-8 py-4 relative h-auto flex-col gap-4"
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
