import React, { useState, useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { ScrollView, View, Text, Image, TextInput, TouchableWithoutFeedback, Keyboard, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import search from "@/assets/images/news/search.png"
import NewsProp from '../components/newsProp'
import { useRouter } from 'expo-router';
import { showError } from '../lib/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API, { StorageAPI } from '../lib/server';
import LoaderCircle from '../lib/loaderCircle'

export default function News() {
  interface newsProp {
        id: number;
        title: string;
        image: string;
        desc: string;
        detail: string;
        updated_at: string;
    }

    const [news, setNews] = useState<newsProp[]>([]);    
    const navigate = useRouter();

    useEffect(() => {
        const fetchNews = async() => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await API.get("/guest/news", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const news = response.data.data;
                setNews(news);
            } catch (error: any) {
                showError(error.response.data.message);
            }
        }        

        fetchNews();
    }, []);
  return (
    <SafeAreaView edges={['top']}>
      <StatusBar backgroundColor="#1D4ED8" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>            
            <LinearGradient
              colors={["#1D4ED8", "#137DD3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-6 py-8 relative h-[26vh] flex-col gap-4"
              style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12, }}
            >
              <View className='flex-col gap-4 mt-4'>
                <Text className='text-white font-poppins_semibold text-[18px]'>Temukan Semua Berita yang ingin Anda Ketahui</Text>
                <Text className='font-poppins_regular text-[12px] text-white'>Tetap Terhubung dengan Informasi Terkini</Text>
              </View>
            </LinearGradient>
            <View className='flex-col px-6'>
                <View className='px-6 bg-white rounded-lg py-2 flex-row items-center gap-4 -mt-8 drop-shadow-2xl'>
                  <Image source={search} className='w-[20px] h-[20px]'/>
                  <TextInput placeholder='Cari Sesuatu...' placeholderTextColor="#ACACAC" className='font-poppins_regular text-[14px] pr-8' />
                </View>
            </View>
            <View className='pl-6 mt-2'>
              <Text className='font-poppins_semibold text-[20px] text-black mt-4'>Berita Terkini</Text>
              <NewsProp/>
            </View>
            <View className='px-6 pb-10'>
              <Text className='font-poppins_semibold text-black text-[20px] mt-8'>Rekomendasi</Text>
              <View className='flex-col gap-6 mt-4'>
                {news.length > 0 ? (
                  news.map((item) => (
                    <View key={item.id} className='flex-row gap-4 items-center pr-28'>
                      <Image source={{ uri: `${StorageAPI}/${item.image}` }} className='w-[90px] rounded-lg h-[90px]'/>
                      <View className='flex-col gap-2'>
                        <Text className='text-black font-poppins_semibold text-[12px] text-justify'>{item.title}</Text>
                        <Text className='text-black font-poppins_medium text-[10px] text-justify'>{item.desc.slice(0, 110) + "..."}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className='w-full flex-col mt-12 gap-24 items-center justify-center'>
                    {[1, 2, 3].map((item, index) => (
                      <LoaderCircle key={index}/>
                    ))};
                  </View>
                )}
              </View>
            </View>
        </ScrollView>
      </TouchableWithoutFeedback>      
    </SafeAreaView>
  )
}
