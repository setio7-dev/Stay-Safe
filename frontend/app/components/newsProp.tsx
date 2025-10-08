import React, { useEffect, useState } from 'react'
import API, { StorageAPI } from '../lib/server'
import { View, Text, Image, ScrollView } from 'react-native'
import { useRouter } from 'expo-router';
import { showError } from '../lib/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dateFormat } from '../lib/dateFormat';

export default function NewsProp() {
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
    <ScrollView className='' horizontal>
      <View className='flex-row items-center gap-10 mt-4 mr-6'>
        {news.map((item) => (
            <View key={item.id} className='flex-col gap-2 w-[260px]'>
                <Image source={{ uri: `${StorageAPI}/${item.image}` }} className='w-[260px] drop-shadow-xl object-cover bg-cover h-[160px] rounded-lg'/>
                <Text className='text-black font-poppins_regular text-justify text-[10px] mt-2'>{dateFormat(item.updated_at)}</Text>
                <Text className='text-black font-poppins_semibold text-justify text-[14px]'>{item.title}</Text>
                <Text className='text-black font-poppins_medium text-justify text-[10px]'>{item.desc}</Text>
            </View>
        ))}
      </View>
    </ScrollView>
  )
}
