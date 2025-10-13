import { LinearGradient } from 'expo-linear-gradient'
import React, { useMemo } from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { useLocalSearchParams, useRouter } from 'expo-router'
import status3 from "@/assets/images/cek-mental/status3.png";
import consultation from "@/assets/images/cek-mental/consultation.png";
import meditation from "@/assets/images/cek-mental/meditation.png";
import DynamicImage from '../lib/dynamicImage'
import great from "@/assets/images/cek-mental/great.png";
import middleGreat from "@/assets/images/cek-mental/low-great.png";
import bad from "@/assets/images/cek-mental/no-great.png";
import MarkedText from '../lib/markText'

export default function ResultMental() {
    const navigate = useRouter();
    const { result } = useLocalSearchParams();
    const parsedResult = useMemo(() => {
      try {
        return JSON.parse(result as string);
      } catch {
        return [];
      }
    }, [result]);

  return (
    <SafeAreaView style={{ flex: 1 }} className='bg-white'>
        <View style={{ flex: 1 }}>
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
            <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 50, paddingTop: 30 }}>
                <View className='w-full mt-0 h-full flex-col items-center justify-center px-6 gap-10'>
                    <DynamicImage source={status3}/>
                    <View className='bg-white w-full p-4 rounded-lg border-[1px] border-gray flex-col justify-center items-center gap-6'>
                        <Image
                          source={
                            ["happy", "love", "surprise"].includes(parsedResult?.primary_mood)
                              ? great
                              : ["sadness", "fear"].includes(parsedResult?.primary_mood)
                              ? middleGreat
                              : bad
                          }
                          className="w-[160px] h-[160px]"
                        />
                        <Text className='font-poppins_semibold text-[24px] text-secondary'>{["happy", "love", "surprise"].includes(parsedResult?.primary_mood) && parsedResult?.percentage > 50 ? "Sangat Baik" : ["happy", "love", "surprise"].includes(parsedResult?.primary_mood) && parsedResult?.percentage < 50 ? "Kurang Baik" : "Tidak Baik"}</Text>
                        <View className='w-full flex-col'>
                            <View className='flex-row w-full items-center justify-between'>
                                <Text className='text-primary font-poppins_medium text-[14px]'>Persentase</Text>
                                <Text className='text-primary font-poppins_medium text-[14px]'>{parsedResult?.percentage ?? 100}%</Text>
                            </View>
                            <View className='bg-[#DDDDDD] rounded-full w-full h-[16px] mt-2'>
                                <View style={{ width: `${parsedResult?.percentage}%` }} className='h-full rounded-full bg-primary'></View>
                            </View>
                        </View>
                        <MarkedText text={parsedResult?.recommendation ?? "deskripsi"} />
                    </View>
                    <View className='flex-col mt-4'>
                        <Text className='text-[14px] font-poppins_semibold text-black text-center'>Sebaiknya Kamu Lakukan</Text>
                        <View className='flex-row justify-center items-center gap-8 mt-6'>
                            <TouchableOpacity onPress={() => navigate.push('/consultation/consultationBoarding')}>
                                <Image source={consultation} className='w-[55px] h-[73px]'/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigate.push('/meditation/meditationBoarding')}>
                                <Image source={meditation} className='w-[50px] h-[70px]'/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity className='w-full' onPress={() => navigate.push('/home')}>
                        <LinearGradient
                            colors={["#1D4ED8", "#137DD3"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="px-8 py-4 relative h-auto flex-col gap-4"
                            style={{ borderRadius: 6 }}
                        >
                            <Text className='text-center font-poppins_medium text-white text-[16px]'>Selesai</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    </SafeAreaView>
  )
}
