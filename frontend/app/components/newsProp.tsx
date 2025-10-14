import React, { useEffect, useState } from 'react'
import API, { StorageAPI } from '../lib/server'
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router';
import { showError } from '../lib/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dateFormat } from '../lib/dateFormat';
import LoaderCircle from '../lib/loaderCircle';

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
    const [isLoader, setIsLoader] = useState(true);
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

                const news = response.data.data.slice(-3);
                setNews(prev => {
                  const ids = prev.map((item: any) => item.id);
                  const unique = news.filter((item: any) => !ids.includes(item.id));
                  return [...prev, ...unique];
                });
            } catch (error: any) {
                showError(error.response.data.message);
            } finally {
                setIsLoader(false);
            }
        }

        fetchNews();
        setInterval(() => {
            fetchNews();            
        }, 5000);
    }, []);
  return (
    <ScrollView className='' horizontal>
      <View className='flex-row items-center gap-10 mt-4 mr-6'>
        {news.length > 0 && !isLoader ? (
            news.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => navigate.push({ pathname: `/news/[id]`, params: { id: String(item.id) } })}>
                    <View className='flex-col gap-2 w-[260px]'>
                        <Image source={{ uri: `${StorageAPI}/${item.image}` }} className='w-[260px] drop-shadow-xl object-cover bg-cover h-[160px] rounded-lg'/>
                        <Text className='text-black font-poppins_regular text-justify text-[10px] mt-2'>{dateFormat(item.updated_at)}</Text>
                        <Text className='text-black font-poppins_semibold text-justify text-[14px]'>{item.title}</Text>
                        <Text className='text-black font-poppins_medium text-justify text-[10px]'>{item.desc}</Text>
                    </View>
                </TouchableOpacity>
            ))            
        ) : (
            <View className='w-full h-[20vh] flex-row justify-center items-center gap-32'>
                {[1, 2, 3].map((item, index) => (
                    <LoaderCircle key={index}/>
                ))}
            </View>
        )}
      </View>
    </ScrollView>
  )
}
