import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { useRouter } from 'expo-router'
import status2 from "@/assets/images/cek-mental/status2.png";
import DynamicImage from '../lib/dynamicImage'
import { showError, showSuccess } from '../lib/toast'
import axios from 'axios'
import { moodDetectionAPI } from '../lib/server'

export default function CekMental() {
    const navigate = useRouter();
    const [answer, setAnswer] = useState<any>([]);

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

    const handleChange = (text: any, index: any) => {
      const newAnswers = [...answer];
      newAnswers[index] = { text };
      setAnswer(newAnswers);
    };

    const handleSubmit = async() => {
        try {
            if (answer.length < 10) {
                showError("Pertanyaan Harus Dijawab!");
                return;
            }

            const formattedAnswer = answer.map((a: any) => {
                const data = { "text": a.text }
                return data;
            });

            const response = await axios.post(moodDetectionAPI, formattedAnswer);
            showSuccess("Jawaban Berhasil Dianalisis");

            setTimeout(() => {
                navigate.push({ pathname: '/check-mental/resultMental', params: { result: JSON.stringify(response.data) } });
            }, 3000);
        } catch (error: any) {
            showError(error);
        }
    }

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
                            <Text className='text-[14px] text-justify font-poppins_medium text-black'>{item.id}. {item.question}</Text>
                            <TextInput value={answer[index]?.text || ''} onChangeText={(text) => handleChange(text, index)} className='px-3 h-[160px] text-black text-[12px] font-poppins_regular border-[1px] border-gray align-top focus:border-primary rounded-md mt-6' placeholder='Ketik Jawaban...'/>
                        </View>
                    ))}
                    <TouchableOpacity className='w-full' onPress={handleSubmit}>
                        <LinearGradient
                            colors={["#1D4ED8", "#137DD3"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="px-8 py-4 relative h-auto flex-col gap-4"
                            style={{ borderRadius: 6 }}
                        >
                            <Text className='text-center font-poppins_medium text-white text-[16px]'>Periksa</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    </SafeAreaView>
  )
}
