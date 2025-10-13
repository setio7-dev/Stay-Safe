import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { useRouter, useLocalSearchParams } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import API, { StorageAPI } from '../../lib/server'
import { Loader } from '../../lib/loader'
import { showError } from '../../lib/toast'
import useRefresh from '../../lib/refresh'
import { ResizeMode, Video } from 'expo-av'

export default function VideoDetail() {
  interface meditationProp {
      id: number;
      title: string;
      author: string;
      thumbnail: string;
      video: string;
      desc: string;
      detail: string;
  }

  const navigate = useRouter();
  const { id } = useLocalSearchParams();
  const [meditation, setMeditation] = useState<meditationProp | null>(null);
  const [isLoader, setIsLoader] = useState(true);

  const fetchData = async() => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  const { refreshing, onRefresh } = useRefresh(fetchData);

  useEffect(() => {
    const fetchNews = async() => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await API.get(`/guest/meditation/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setMeditation(response.data.data);
      } catch (error: any) {
        showError(error);
      } finally {
        setIsLoader(false);
      }
    }
    fetchNews();
  }, [id]);

  return (
    <SafeAreaView style={{ flex: 1 }} className='bg-white'>
      {isLoader ? (
        <View className='flex-col h-full w-full justify-center items-center'>
          <Loader/>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <LinearGradient
            colors={["#1D4ED8", "#137DD3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 py-8 flex-col gap-4"
            style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
          >
            <View className='flex-row justify-between items-center'>
              <TouchableOpacity onPress={() => navigate.push('/meditation')}>
                <Image source={back} className='w-[24px] h-[24px]'/>
              </TouchableOpacity>
              <Text className='text-white font-poppins_semibold text-[16px]'>Meditasi</Text>
              <View className='mr-6'></View>
            </View>
          </LinearGradient>
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
            <View className='px-6 flex-col mt-6 gap-2'>
              <Text className='font-poppins_semibold text-black text-[16px] text-justify'>{meditation?.title}</Text>
              <Text className='font-poppins_regular text-black text-[12px]'>{meditation?.author}</Text>
              <View className='w-full'>
                <Video source={{ uri: `${StorageAPI}/${meditation?.video}` }} resizeMode={ResizeMode.COVER} useNativeControls style={{ width: '100%', height: 200, borderRadius: 8 }}/>
              </View>
            <Text style={{ textAlign: 'justify', lineHeight: 20 }} className='text-justify text-black text-[12px] font-poppins_medium mt-4'>{meditation?.detail}</Text>              
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  )
}
