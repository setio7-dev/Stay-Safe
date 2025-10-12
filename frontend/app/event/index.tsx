import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png";
import ticket from "@/assets/images/event/ticket.png";
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API, { StorageAPI } from '../lib/server';
import { showError } from '../lib/toast';
import { Loader } from '../lib/loader';
import DynamicImage from '../lib/dynamicImage';
import location from "@/assets/images/event/location.png";
import calendar from "@/assets/images/event/calendar.png";
import { dateFormat } from '../lib/dateFormat';

export default function Index() {
  interface eventProp {
    id: number;
    title: string;
    image: string;
    desc: string;
    detail: string;
    location: string;
    date: string;
    price: number;
  }

  const navigate = useRouter();
  const [event, setEvent] = useState<eventProp[]>([]);
  const [isLoader, setIsLoader] = useState(true);

  useEffect(() => {
    const fetchEvent = async() => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await API.get("/guest/event", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setEvent(response?.data?.data);
        } catch (error: any) {
            showError(error?.response?.data?.data); 
        } finally {
            setIsLoader(false);
        }
    }

    fetchEvent();
  }, []);
  return (
    <SafeAreaView edges={["top"]} className='bg-white w-full h-full'>
      {!isLoader ? (
        <View style={{ flex: 1 }}>
          <LinearGradient
            colors={["#1D4ED8", "#137DD3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 py-8 relative h-auto flex-col gap-4"
            style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12, }}
          >
            <View className='flex-row justify-between items-center'>
              <TouchableOpacity onPress={() => navigate.push('/home')}>
                <Image source={back} className='w-[24px] h-[24px]'/>
              </TouchableOpacity>
              <Text className='text-white font-poppins_semibold text-[16px]'>Webinar</Text>
              <TouchableOpacity onPress={() => navigate.push("/event/eventTransaction")}>
                <Image source={ticket} className='w-[24px] h-[20px]'/>
              </TouchableOpacity>
            </View>
          </LinearGradient>
          <ScrollView className='px-6' style={{ flex: 1 }}>
              <View className='flex-col gap-8 items-center w-full mt-8 pb-20'>
                {event.map((item, index) => (
                    <TouchableOpacity key={index} className='w-full' onPress={() => navigate.push({ pathname: "/event/[id]", params: { id: item.id } })}>
                        <View className='bg-white pb-8 rounded-lg' style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.40, shadowRadius: 4.84, elevation: 5, }}>
                            <View className='rounded-t-lg'>
                                <DynamicImage source={ `${StorageAPI}/${item.image}` }/>
                            </View>
                            <View className='px-4 mt-4 flex-col gap-1'>
                                <Text className='text-black text-[14px] font-poppins_semibold text-justify'>{item.title}</Text>
                                <Text className='text-black text-[12px] font-poppins_regular text-justify'>{item.desc}</Text>
                                <View className='flex-row items-center gap-4 mt-4'>
                                    <Image source={location} className='w-[14px] h-[18px]'/>
                                    <Text className='text-gray text-[10px] font-poppins_regular text-justify'>{item.location}</Text>
                                </View>
                                <View className='flex-row items-center gap-4 mt-2'>
                                    <Image source={calendar} className='w-[14px] h-[18px]'/>
                                    <Text className='text-gray text-[10px] font-poppins_regular text-justify'>{dateFormat(item.date)}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
              </View>   
          </ScrollView>          
        </View>
      ) : (
        <View className='w-full h-full flex-row justify-center items-center'>
            <Loader/>
        </View>
      )}
    </SafeAreaView>
  )
}
