import React, { useEffect, useState } from 'react'
import { ScrollView, StatusBar, View, Text, Image, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import search from "@/assets/images/news/search.png"
import chat from "@/assets/images/icon/chat.png"
import CommunityProp from '../components/communityProp'
import { useRouter } from 'expo-router'
import { showError } from '../lib/toast'
import AsyncStorage from '@react-native-async-storage/async-storage'
import API, { StorageAPI } from '../lib/server'
import LoaderCircle from '../lib/loaderCircle'
import guest from "@/assets/images/home/guest.png"
import { timeAgo } from '../lib/timeAgo'

export default function Community() {
  interface communityPostProp {
    id: number;
    community_id: number;
    user_id: number;
    message: string;
    image: string;
    created_at: string;
    user: userProp;
    community: communityProp;
  }

  interface communityProp {
    id: number;
    name: string;
    image: string;
    desc: string
  }

  interface userProp {
    id: number;
    name: string;
    image: string;    
  }

  const [communityPost, setCommunityPost] = useState<communityPostProp[]>([]);
  const navigate = useRouter();

  useEffect(() => {
    const fetchCommunity = async() => {
      try { 
        const token = await AsyncStorage.getItem("token");
        const response = await API.get("/communities/post", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setCommunityPost(response.data?.data);
        console.log(communityPost);
      } catch (error: any) {
        showError(error.response.data.message);
      }
    }

    fetchCommunity();
  }, []);
  return (
    <SafeAreaView edges={["top"]}>
      <StatusBar backgroundColor="#1D4ED8" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
          <LinearGradient
            colors={["#1D4ED8", "#137DD3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 pt-8 pb-16 relative h-auto flex-col gap-4"
            style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12, }}
          >
            <View className='flex-row items-center justify-between'>
              <View className='flex-col gap-2 mt-4 w-[260px]'>
                <Text className='text-white font-poppins_semibold text-[16px]'>Temukan Semua Komunitas yang Ingin Anda Gabung</Text>
                <Text className='font-poppins_regular text-[10px] text-white'>Terhubung dengan orang-orang seperti Anda</Text>
              </View>
              <Image source={chat} className='w-[32px] h-[32px]'/>
            </View>
          </LinearGradient>
           <View className='flex-col px-6'>
              <View className='px-6 bg-white rounded-lg py-2 flex-row items-center gap-4 -mt-8 drop-shadow-2xl'>
                <Image source={search} className='w-[20px] h-[20px]'/>
                <TextInput placeholder='Cari Sesuatu...' placeholderTextColor="#ACACAC" className='font-poppins_regular text-[14px] pr-8' />
              </View>
            </View>
            <ScrollView horizontal className='pl-6 mt-4'>
              <View className='mr-6 flex-row'>
                <CommunityProp/>
              </View>
            </ScrollView>
            <View className='px-6 mt-8'>
              <Text className='text-black font-poppins_semibold text-[18px]'>Postingan Terbaru</Text>
              <View className='flex-col justify-center w-full mt-6'>
                {communityPost.length > 0 ? (
                  communityPost.map((item) => (
                    <View key={item.id} className='w-full h-auto bg-white drop-shadow-2xl px-6 py-8 rounded-lg'>
                        <View className='flex-row items-center justify-between'>
                          <View className='flex-row items-center gap-4'>
                            <Image
                              source={
                                item.user?.image
                                  ? { uri: `${StorageAPI}/${item.user.image}` }
                                  : guest
                              }
                              className={`w-[40px] h-[40px] rounded-full ${item.user.image ? 'border-[1px] border-none' : 'border-[1px] border-primary'}`}
                            />
                            <View className='flex-col'>
                              <Text className='text-black font-poppins_semibold text-[14px]'>{item.user.name}</Text>
                              <Text className='text-black font-poppins_regular text-[10px]'>{timeAgo(item.created_at)}</Text>
                            </View>
                          </View>
                        </View>
                    </View>
                  ))
                ) : (
                  <View className='flex-col gap-6 w-full items-center justify-center'>
                    {[1, 2, 3].map((item, index) => (
                      <LoaderCircle key={index}/>
                    ))}
                  </View>
                )}
              </View>
            </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}
