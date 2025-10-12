import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { View, Image, Text, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, TextInput, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import API, { StorageAPI } from '../lib/server';
import useRefresh from '../lib/refresh';
import { Loader } from '../lib/loader';
import { LinearGradient } from 'expo-linear-gradient';
import back from "@/assets/images/icon/back.png";
import search from "@/assets/images/icon/search.png";
import star from "@/assets/images/consultation/star.png"
import location from "@/assets/images/consultation/location.png"
import { getShortName } from '../lib/getShortName';
import chat from "@/assets/images/icon/chat.png"

export default function Index() {  
  interface userProp {
    id: number;
    name: string;
    email: string;
    image: string;
  }
  
  interface doctorProp {
    id: number;
    category: string;
    hospital: string;
    user_id: number;
    user: userProp
  }
  
  const [isLoader, setIsLoader] = useState(true);
  const navigate = useRouter();
  const [doctor, setDoctor] = useState<doctorProp[]>([]);

  const fetchDoctor = async() => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await API.get("/guest/doctor", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setDoctor(response.data.data);
    } catch (error) {
      
    } finally {
      setIsLoader(false);
    }
  }

  const { refreshing, onRefresh } = useRefresh(fetchDoctor);
  useEffect(() => {
    fetchDoctor();
  }, []);

  const handleChat = async(id: number) => {
    try { 
      const token = await AsyncStorage.getItem("token");
      const response = await API.post("/conversation", {
        receiver: id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const conversationId = response.data.data.id;      
      navigate.push({ pathname: '/consultation/chat/[id]', params: { id: conversationId } });
    } catch (error: any) {
      navigate.push('/consultation/chat/consultationChat');
    }
  }

  return (
    <SafeAreaView edges={['top']} className='flex-1 bg-white w-full'>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: 1 }}>
          {!isLoader ? (
            <View className='flex-1'>
              <LinearGradient
                colors={["#1D4ED8", "#137DD3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-6 pt-8 pb-16 relative h-auto flex-col gap-4"
                style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12, }}
              >
                <View className='flex-row justify-between items-center'>
                  <TouchableOpacity onPress={() => navigate.push('/consultation/consultationBoarding')}>
                    <Image source={back} className='w-[24px] h-[24px]'/>
                  </TouchableOpacity>
                  <Text className='text-white font-poppins_semibold text-[16px]'>Konsultasi</Text>
                  <TouchableOpacity onPress={() => navigate.push('/consultation/chat/consultationChat')}>
                    <Image source={chat} className='w-[30px] h-[30px]'/>
                  </TouchableOpacity>
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
              <ScrollView className='pt-8 px-6' refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={refreshing}/>}>
                <View className='flex-col gap-8 items-center justify-center'>
                  {doctor.map((item, index) => (
                    <View key={index} className='p-4 bg-white w-full flex-row items-center justify-between gap-4'
                    style={{
                      shadowColor: '#000',
                      borderRadius: 10,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.40,
                      shadowRadius: 4.84,
                      elevation: 5,
                    }}>
                      <Image source={{ uri: `${StorageAPI}/${item.user.image}` }} className='w-[86px] h-[86px] rounded-lg object-cover bg-cover'/>
                      <View className='flex-col'>
                        <Text className='text-black text-[14px] font-poppins_semibold'>{getShortName(item.user.name)}</Text>
                        <Text className='text-gray text-[12px] font-poppins_regular'>{item.category}</Text>
                        <TouchableOpacity onPress={() => handleChat(item.user_id)}>
                            <LinearGradient
                                colors={["#1D4ED8", "#137DD3"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="px-2 mt-4 py-2 w-[90px] h-auto flex-col gap-4"
                                style={{ borderRadius: 6 }}
                            >
                                <Text className='text-white text-[12px] text-center font-poppins_semibold'>Hubungi</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                      </View>
                      <View className='flex-col justify-between items-end h-full py-2'>
                        <Image source={star} className='w-[34px] h-[14px]'/>
                        <View className='flex-row items-center gap-2'>
                          <Image source={location} className='w-[12px] h-[14px]'/>
                          <Text className='text-gray text-[10px] font-poppins_regular'>{item.hospital}</Text>
                        </View>
                      </View>
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
