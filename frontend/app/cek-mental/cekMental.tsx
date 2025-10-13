import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { useRouter } from 'expo-router'
import icon from "@/assets/images/cek-mental/icon1.png";
import status2 from "@/assets/images/cek-mental/status2.png";
import DynamicImage from '../lib/dynamicImage'

export default function CekMental() {
    const navigate = useRouter();
    const questionData = [
        {
            id: 1,
            question: "Apakah kamu sering merasa tidak aman di lingkungan tempat kamu berada sekarang?"
        },
        {
            id: 2,
            question: "Seberapa sering kamu merasa takut sesuatu yang buruk akan terjadi tanpa alasan jelas?"
        },
        {
            id: 3,
            question: "Apakah kamu merasa bisa mempercayai orang-orang terdekatmu ketika kamu butuh dukungan?"
        },
        {
            id: 4,
            question: "Apakah kamu pernah merasa sendirian walau ada orang lain di sekitarmu?"
        },
        {
            id: 5,
            question: "Seberapa sering kamu merasa cemas berlebihan hingga mengganggu aktivitas harianmu?"
        },
        {
            id: 6,
            question: "Apakah kamu merasa cukup aman untuk mengekspresikan pendapat atau perasaanmu?"
        },
        {
            id: 7,
            question: "Apakah kamu sering merasa tidak berdaya atau tidak mampu mengendalikan keadaan di sekitarmu?"
        },
        {
            id: 8,
            question: "Seberapa sering kamu merasa pikiranmu dipenuhi hal-hal negatif yang sulit dikendalikan?"
        },
        {
            id: 9,
            question: "Apakah kamu pernah merasa takut atau terancam oleh seseorang di lingkunganmu?"
        },
        {
            id: 10,
            question: "Apakah kamu merasa memiliki tempat atau orang yang bisa membuatmu merasa benar-benar aman?"
        },
    ];

  return (
    <SafeAreaView style={{ flex: 1 }} className='bg-white'>
        <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 100 }}>
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
                <DynamicImage source={status2}/>
                {questionData.map((item, index) => (
                    <View key={index} className='bg-white rounded-lg w-full p-6'
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.40,
                      shadowRadius: 4.84,
                      elevation: 5,
                    }}>
                        <Text className='text-[14px] text-justify font-poppins_semibold text-black'>{item.id}. {item.question}</Text>
                        <TextInput className='px-3 h-[140px] text-black text-[12px] font-poppins_regular border-[1px] border-gray align-top focus:border-primary rounded-md mt-6' placeholder='Ketik Jawaban...'/>
                    </View>
                ))}
            </View>
        </ScrollView>
    </SafeAreaView>
  )
}
