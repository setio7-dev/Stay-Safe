import React, { useEffect, useState } from 'react'
import { ScrollView, View, Image, Text, TouchableOpacity, ImageBackground } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { useRouter } from 'expo-router'
import API, { StorageAPI } from '../lib/server'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Loader } from '../lib/loader'
import { LinearGradient } from 'expo-linear-gradient'
import play from "@/assets/images/meditation/play.png"
import playWhite from "@/assets/images/meditation/play-white.png"
import MusicProp from '../components/musicProp'

export default function Index() {
    interface meditationProp {
        id: number;
        title: string;
        author: string;
        thumbnail: string;
        video: string;
        desc: string;
        detail: string;
    }

    interface musicProp {
        id: number;
        title: string;
        author: string;
        image: string;
        song: string;
    }

    const navigate = useRouter();
    const [isLoader, setIsLoader] = useState(true);
    const [meditation, setMeditation] = useState<meditationProp[]>([]);
    const [musicTop, setMusicTop] = useState<musicProp[]>([]);

    useEffect(() => {
        const fetchMeditation = async() => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await API.get('/guest/meditation', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setMeditation(response.data.data);
            } catch (error) {
                
            } finally {
                setIsLoader(false);
            }
        }

        const fetchMusic = async() => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await API.get('/guest/music', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const musicRes = response.data.data;
                setMusicTop(musicRes.slice(-2));
            } catch (error) {
                
            } finally {
                setIsLoader(false);
            }
        }

        fetchMeditation();
        fetchMusic();
    }, []);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }} className='bg-white'>
      {!isLoader ? (
        <View style={{ flex: 1 }}>
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
                <Text className='text-white font-poppins_semibold text-[16px]'>Meditasi</Text>
                <View className='mr-6'></View>
              </View>
            </LinearGradient>
            <ScrollView contentContainerStyle={{ paddingBottom: 32,}}  className='pt-8'>
                <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 24 }}>
                    <View className='flex-row gap-6'>
                        {musicTop.map((item, index) => (
                            <ImageBackground key={index} source={{ uri: `${StorageAPI}/${item.image}` }} resizeMode="cover" className='w-[300px] h-[200px] flex-col justify-end rounded-lg'>
                                <View className="bg-black/50 p-6 rounded-lg flex-row justify-between items-center">
                                  <View>
                                    <Text className="text-white text-[16px] font-poppins_semibold">{item.title}</Text>
                                    <Text className="text-white text-[12px] font-poppins_medium">{item.author}</Text>
                                  </View>
                                  <TouchableOpacity onPress={() => navigate.push({ pathname: '/meditation/music/[id]', params: { id: item.id } })}>
                                    <Image source={playWhite} className='w-[40px] h-[40px]'/>
                                  </TouchableOpacity>
                                </View>
                            </ImageBackground>
                        ))}
                    </View>
                </ScrollView>
                <View className='px-6 mt-8'>
                    <Text className='text-[20px] font-poppins_semibold text-primary'>Meditasi Untukmu</Text>
                </View>
                <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 24 }} className='py-1'>
                    <View className='flex-row gap-6 mt-4'>
                        {meditation.map((item, index) => (
                            <TouchableOpacity key={index} onPress={() => navigate.push({ pathname: '/meditation/video/[id]', params: { id: item.id } })}>
                                <View className='p-6 bg-white rounded-lg w-[320px] flex-col gap-4' 
                                style={{
                                  shadowColor: '#000',
                                  shadowOffset: { width: 0, height: 0 },
                                  shadowOpacity: 0.40,
                                  shadowRadius: 4.84,
                                  elevation: 5,
                                }}>
                                    <Text className='font-poppins_semibold text-justify text-[14px] text-black'>{item.title}</Text>
                                    <Text className='font-poppins_regular text-justify text-[12px] text-gray'>{item.author}</Text>
                                    <View className='relative h-[160px]'>
                                        <Image source={play} className="w-[44px] h-[44px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" />
                                        <Image source={{ uri: `${StorageAPI}/${item.thumbnail}` }} className='w-full h-[160px] bg-cover object-cover rounded-lg'/>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                <View className='px-6 mt-8'>
                    <Text className='text-[20px] font-poppins_semibold text-primary'>Daftar Musik</Text>                    
                </View>
                <View className='px-6 mt-6 pb-12'>
                    <MusicProp/>
                </View>
            </ScrollView>
        </View>
      ) : (
        <View className='flex justify-center items-center h-full'>
            <Loader/>
        </View>
      )}
    </SafeAreaView>
  )
}
