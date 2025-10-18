import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { View, Image, Text, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, TextInput, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import API, { StorageAPI } from '../../lib/server';
import useRefresh from '../../lib/refresh';
import { Loader } from '../../lib/loader';
import { LinearGradient } from 'expo-linear-gradient';
import back from "@/assets/images/icon/back.png";
import search from "@/assets/images/icon/search.png";
import { getShortName } from '../../lib/getShortName';

export default function ConsultationChat() {  
  interface userProp {
    id: number;
    name: string;
    email: string;
    image: string;
    category: string;
  }
  
  interface conversationProp {
    id: number;
    unread_count: number;
    receiver: userProp
    message: messageProp[]
  }

  interface messageProp {
    id: number;
    message: string
  }
  
  const [isLoader, setIsLoader] = useState(true);
  const navigate = useRouter();
  const [doctor, setDoctor] = useState<conversationProp[]>([]);

  const fetchDoctor = async() => {
    try {
      const token = await AsyncStorage.getItem("token");
      const user = await API.get("/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const userId = user.data.data.id;
      const response = await API.get("/conversation", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const doctor = response.data.data;
      const filteredDoctor = doctor.filter((item: any) => item.sender.id === userId);
      setDoctor(filteredDoctor);
    } catch (error) {
      
    } finally {
      setIsLoader(false);
    }
  }

  const { refreshing, onRefresh } = useRefresh(fetchDoctor);
  useEffect(() => {
    fetchDoctor();
    setInterval(() => {
      fetchDoctor();      
    }, 5000);
  }, []);

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
                  <TouchableOpacity onPress={() => navigate.push('/consultation')}>
                    <Image source={back} className='w-[24px] h-[24px]'/>
                  </TouchableOpacity>
                  <Text className='text-white font-poppins_semibold text-[16px]'>Konsultasi Saya</Text>
                  <View></View>
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
                    <TouchableOpacity onPress={() => navigate.push({ pathname: '/consultation/chat/[id]', params: { id: item.id } })} key={index} className='p-4 bg-white w-full flex-row items-start justify-start gap-4'
                    style={{
                      shadowColor: '#000',
                      borderRadius: 10,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.40,
                      shadowRadius: 4.84,
                      elevation: 5,
                    }}>
                      <Image source={{ uri: `${StorageAPI}/${item.receiver.image}` }} className='w-[86px] h-[86px] rounded-lg object-cover bg-cover'/>
                      <View className='flex-col flex-1'>
                        <View className='flex-row justify-between'>
                          <View className='flex-col'>
                            <Text className='text-black text-[14px] font-poppins_semibold'>{getShortName(item.receiver.name)}</Text>
                            <Text className='text-gray text-[12px] font-poppins_regular'>{item.receiver.category}</Text>                    
                          </View>
                          <View className='rounded-full bg-red w-[20px] h-[20px] flex justify-center items-center'>
                              <Text className='font-poppins_semibold text-white text-[10px] pt-[1px]'>{item.unread_count === 0 ? 1 : item.unread_count}</Text>
                          </View>
                        </View>
                        {item.message.length > 0 ? (
                            <Text className='text-gray mt-2 text-[12px] font-poppins_medium'>{item.message[item.message.length - 1].message.slice(0, 12) }</Text>
                        ) : (
                            <View></View>
                        )}
                      </View>
                    </TouchableOpacity>
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
