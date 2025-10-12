import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { useRouter, useLocalSearchParams } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import API, { StorageAPI } from '../lib/server'
import { dateFormat } from '../lib/dateFormat'
import { Loader } from '../lib/loader'
import { showError } from '../lib/toast'
import useRefresh from '../lib/refresh'

export default function NewsDetail() {
  interface newsProp {
    id: number;
    title: string;
    desc: string;
    image: string;
    detail: string;
    created_at: string;
  }

  const navigate = useRouter();
  const { id } = useLocalSearchParams();
  const [news, setNews] = useState<newsProp | null>(null);
  const [isLoader, setIsLoader] = useState(true);

  const fetchData = async() => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  const { refreshing, onRefresh } = useRefresh(fetchData);

  useEffect(() => {
    const fetchNews = async() => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await API.get(`/guest/news/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setNews(response.data.data);
      } catch (error: any) {
        showError(error);
      } finally {
        setIsLoader(false);
      }
    }
    fetchNews();
  }, [id]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
              className="px-6 py-8 relative h-auto flex-col gap-4"
              style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12, }}
          >
            <TouchableOpacity onPress={() => navigate.back()}>
              <View className='flex-row items-center gap-4'>
                <Image source={back} className='w-[24px] h-[24px]'/>
                <Text className='text-white font-poppins_semibold text-[14px]'>Kembali</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
            <View className='px-6 flex-col mt-6 gap-2'>
              <Text className='font-poppins_semibold text-black text-[16px] text-justify'>{news?.title}</Text>
              <Text className='font-poppins_regular text-black text-[12px]'>{dateFormat(news?.created_at)}</Text>
              <Image source={{ uri: `${StorageAPI}/${news?.image}` }} className='w-full h-[200px] object-cover bg-cover rounded-lg mt-4'/>
              <Text style={{ textAlign: 'justify', lineHeight: 20 }} className='text-black text-[12px] font-poppins_medium mt-4 text-justify'>{news?.detail}</Text>
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  )
}
