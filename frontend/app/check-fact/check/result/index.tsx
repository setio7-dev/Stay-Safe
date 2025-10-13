import React, { useMemo } from 'react'
import { View, ScrollView, Image, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import hoax from "@/assets/images/check-fact/hoax.png";
import fact from "@/assets/images/check-fact/fact.png";
import empty from "@/assets/images/check-fact/empty.png";
import MarkedText from '@/app/lib/markText'

export default function Index() {
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
    <SafeAreaView edges={['top']} className='flex-1 bg-white'>
      <View className='flex-1'>
        <LinearGradient
          colors={["#1D4ED8", "#137DD3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="px-6 py-8 flex-col gap-4"
          style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
        >
          <View className='flex-row justify-between items-center'>
            <TouchableOpacity onPress={() => navigate.push('/home')}>
              <Image source={back} className='w-[24px] h-[24px]'/>
            </TouchableOpacity>
            <Text className='text-white font-poppins_semibold text-[16px]'>Cek Fakta</Text>
            <View className='mr-6'></View>
          </View>
        </LinearGradient>
        <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 40 }} className='flex-1'>
            <View className='flex-col px-6'>
                <View className={`w-full rounded-lg overflow-hidden relative ${parsedResult.is_hoax ? 'h-[260px]' : 'h-[200px]'}`}>
                  <Image className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[140px] h-[140px]' source={parsedResult.is_hoax ? hoax : fact}/>
                  <Image
                    className={`w-full rounded-lg ${parsedResult.is_hoax ? 'h-[260px]' : 'h-[200px]'}`}
                    resizeMode="cover"
                    source={
                      parsedResult?.similar_news[0]?.thumbnail
                        ? { uri: parsedResult.similar_news[0].thumbnail }
                        : empty
                    }
                  />
                  <View className='absolute inset-0 bg-black/50' />
                  <View className='absolute bottom-4 left-1/2 z-20 -translate-x-1/2 px-6'>
                    <Text className='text-white font-poppins_semibold text-[14px]'>{parsedResult?.similar_news[0]?.blog_title ?? ""}</Text>
                  </View>
                </View>
            </View>
            {parsedResult.similar_news.length > 0 ? (
                <View className='mt-6 px-6'>
                    <Text className='text-black text-[16px] text-center font-poppins_medium'>Terakurasi</Text>
                    <Text className='text-primary text-[24px] text-center font-poppins_semibold'>{parsedResult?.confidence}%</Text>
                    <View className='mt-4 flex-col gap-4'>
                        <MarkedText text={parsedResult?.ai_description}/>
                        <MarkedText text={parsedResult?.similar_news[0]?.blog_check}/>
                        <MarkedText text={parsedResult?.similar_news[0]?.blog_conclusion}/>
                    </View>
                    <TouchableOpacity className='w-full mt-12' onPress={() => navigate.push('/check-fact/check')}>
                      <LinearGradient
                          colors={["#1D4ED8", "#137DD3"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className="px-6 py-4 w-full flex-col gap-4"
                          style={{ borderRadius: 6 }}
                      >
                          <Text className='text-[16px] text-center font-poppins_semibold text-white'>Kembali</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className='mt-6 px-6'>
                    <Text className='text-black text-[16px] text-center font-poppins_medium'>Terakurasi</Text>
                    <Text className='text-primary text-[24px] text-center font-poppins_semibold'>{parsedResult?.confidence}%</Text>
                    <View className='mt-6'>
                        <MarkedText text={parsedResult?.ai_description}/>
                    </View>
                    <TouchableOpacity className='w-full mt-12' onPress={() => navigate.push('/check-fact/check')}>
                      <LinearGradient
                          colors={["#1D4ED8", "#137DD3"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className="px-6 py-4 w-full flex-col gap-4"
                          style={{ borderRadius: 6 }}
                      >
                          <Text className='text-[16px] text-center font-poppins_semibold text-white'>Kembali</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
