import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { View, ScrollView, Text, Image, TouchableWithoutFeedback, Keyboard, TouchableOpacity, TextInput, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { showError } from '../lib/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API, { StorageAPI } from '../lib/server';
import { LinearGradient } from 'expo-linear-gradient';
import back from "@/assets/images/icon/back.png";
import search from "@/assets/images/icon/search.png";
import { Loader } from '../lib/loader';
import useRefresh from '../lib/refresh';

export default function UserCommunity() {
  interface communityProp {
    id: number;
    name: string;
    desc: string;
    image: string;    
  }

  const navigate = useRouter();
  const [community, setCommunity] = useState<communityProp[]>([]);
  const [isLoader, setIsLoader] = useState(true);

  const fetchData = async() => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  const { refreshing, onRefresh } = useRefresh(fetchData);

  useEffect(() => {
    const fetchCommunity = async() => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await API.get("/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setCommunity(response.data.data.community);
      } catch (error: any) {
        showError(error.response.data.message);
      } finally {
        setIsLoader(false);
      }
    }

    fetchCommunity();
  }, []);
  return (
    <SafeAreaView edges={["top"]} className='bg-white w-full h-full'>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {!isLoader ? (
            <View>
              <LinearGradient
                colors={["#1D4ED8", "#137DD3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-6 pt-8 pb-16 relative h-auto flex-col gap-4"
                style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12, }}
              >
                <View className='flex-row justify-between items-center'>
                  <TouchableOpacity onPress={() => navigate.back()}>
                    <Image source={back} className='w-[24px] h-[24px]'/>
                  </TouchableOpacity>
                  <Text className='text-white font-poppins_semibold text-[16px]'>Komunitas Saya</Text>
                  <View className='mr-6'></View>
                </View>
              </LinearGradient>
              <View className='px-6 -mt-8'>
                <View className='bg-white rounded-lg py-2 flex-row items-center gap-4 drop-shadow-2xl px-6' 
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.40,
                  shadowRadius: 4.84,
                  elevation: 5,
                }}>
                  <Image source={search} className='w-[20px] h-[20px]'/>
                  <TextInput placeholder='Cari Sesuatu...' placeholderTextColor="#ACACAC" className='font-poppins_regular text-[14px] pr-8' />
                </View>
              </View>
              <ScrollView contentContainerStyle={{ paddingBottom: 8 }} refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={refreshing}/>}>
                <View className='px-6 mt-8 flex-row justify-between flex-wrap'>
                  {community.map((item) => (
                    <View key={item.id} className='flex-col bg-white rounded-lg w-[150px] h-[260px] items-center justify-center gap-6'
                     style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.40,
                        shadowRadius: 4.84,
                        elevation: 5,
                      }}>
                        <Image source={{ uri: `${StorageAPI}/${item.image}` }} className='w-[60px] h-[60px]'/>
                        <View>
                            <Text className='font-poppins_semibold text-[16px text-black]'>{item.name}</Text>
                            <Text className='font-poppins_regular text-gray text-[12px]'>{item.desc}</Text>
                        </View>                  
                        <TouchableOpacity onPress={() => navigate.push({ pathname: "/community/[id]", params: { id: item.id } })}>
                            <Text className='text-[12px] font-poppins_semibold text-white bg-secondary px-6 py-2 rounded-lg'>Lihat</Text>
                        </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : (
            <View className='w-full h-full flex justify-center items-center'>
              <Loader/>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}
