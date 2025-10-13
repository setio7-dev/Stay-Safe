import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React from 'react'
import { View, ScrollView, Text, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import DynamicImage from '@/app/lib/dynamicImage'
import example from "@/assets/images/check-fact/example.png"
import upload from "@/assets/images/check-fact/upload.png"

export default function Index() {
    const navigate = useRouter();

  return (
    <SafeAreaView edges={['top']} className='bg-white flex-1'>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                <ScrollView className='flex-1' contentContainerStyle={{ paddingTop: 30, paddingBottom: 80 }}>
                    <View className='px-6 flex-col gap-8'>
                        <DynamicImage source={example}/>
                        <TouchableOpacity>
                            <DynamicImage source={upload}/>
                        </TouchableOpacity>
                        <View className='flex-col gap-2'>
                          <Text className='text-black font-poppins_medium text-[1rem]'>Nama Berita</Text>
                          <TextInput className='border-2 pl-4 font-poppins_regular text-[12px] rounded-lg border-gray w-full focus:border-primary' placeholder='Masukkan Nama Berita...' placeholderTextColor="#ACACAC"/>
                        </View>
                        <View className='flex-col gap-2'>
                          <Text className='text-black font-poppins_medium text-[1rem]'>Link Berita (Jika Ada)</Text>
                          <TextInput className='border-2 pl-4 font-poppins_regular text-[12px] rounded-lg border-gray w-full focus:border-primary' placeholder='Masukkan Link Berita...' placeholderTextColor="#ACACAC"/>
                        </View>
                        <Text className='text-black font-poppins_medium text-center text-[12px]'>Unggah Link, foto, atau artikel yang ingin diperiksa, lalu sistem akan menganalisis dan mencocokkannya dengan sumber terpercaya. Hasil verifikasi beserta riwayat pencarian akan tersimpan dalam bentuk artikel terverifikasi yang bisa dibaca kembali kapan saja.</Text>
                        <TouchableOpacity className='w-full' onPress={() => navigate.push('/home')}>
                            <LinearGradient
                                colors={["#1D4ED8", "#137DD3"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="px-8 py-4 relative h-auto flex-col gap-4"
                                style={{ borderRadius: 6 }}
                            >
                                <Text className='text-center font-poppins_medium text-white text-[16px]'>Analisa</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
