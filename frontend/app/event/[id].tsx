/* eslint-disable @typescript-eslint/no-unused-vars */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { View, Image, ScrollView, TouchableOpacity, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import API, { StorageAPI } from '../lib/server';
import { Loader } from '../lib/loader';
import { LinearGradient } from 'expo-linear-gradient';
import back from "@/assets/images/icon/back.png";
import DynamicImage from '../lib/dynamicImage';
import location from "@/assets/images/event/location-detail.png";
import calendar from "@/assets/images/event/calendar-detail.png";
import ticket from "@/assets/images/event/ticket-detail.png";
import { dateFormat } from '../lib/dateFormat';
import { rupiahFormat } from '../lib/rupiahFormat';
import { showError, showSuccess } from '../lib/toast';

export default function EventDetail() {
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

    const [isLoader, setIsLoader] = useState(true);
    const [event, setEvent] = useState<eventProp | null>(null);
    const navigate = useRouter();
    const { id } = useLocalSearchParams();

    useEffect(() => {
        const fetchEvent = async() => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await API.get(`/guest/event/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setEvent(response?.data?.data);
            } catch (error: any) {
                
            } finally {
                setIsLoader(false)
            }
        }

        fetchEvent();
    }, [id]);

    const handleEventTransaction = async(event_id: any) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await API.post('/events/transaction', {
                event_id: event_id,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            showSuccess(response.data.message);
            setTimeout(() => {
                navigate.push("/event")
            }, 3000);
        } catch (error: any) {
            showError(error.response.data.message);
        }
    }

  return (
    <SafeAreaView edges={['top', 'bottom']} className='flex-1 bg-white'>
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
                <TouchableOpacity onPress={() => navigate.back()}>
                  <Image source={back} className='w-[24px] h-[24px]'/>
                </TouchableOpacity>
                <Text className='text-white font-poppins_semibold text-[16px]'>Detail Webinar</Text>
                <View></View>
              </View>
            </LinearGradient>
            <ScrollView className='pt-8'>
                <DynamicImage source={ `${StorageAPI}/${event?.image}` }/>
                <View className='px-6 mt-4 flex-col gap-2 pb-20'>
                    <Text className='text-black text-[16px] font-poppins_semibold text-justify'>{event?.title}</Text>
                    <Text className='text-black text-[12px] font-poppins_medium text-justify'>{event?.detail}</Text>
                    <View className='flex-row items-center gap-4 mt-4'>
                        <Image source={location} className='w-[16px] h-[20px]'/>
                        <Text className='text-black text-[12px] font-poppins_regular text-justify'>{event?.location}</Text>
                    </View>
                    <View className='flex-row items-center gap-4 mt-2'>
                        <Image source={calendar} className='w-[16px] h-[20px]'/>
                        <Text className='text-black text-[12px] font-poppins_regular text-justify'>{dateFormat(event?.date)}</Text>
                    </View>
                    <View className='flex-row items-center gap-4 mt-2'>
                        <Image source={ticket} className='w-[16px] h-[14px]'/>
                        <Text className='text-black text-[12px] font-poppins_regular text-justify'>{rupiahFormat(Number(event?.price))}</Text>
                    </View>
                </View>
            </ScrollView>
            <View className='bg-white px-8 py-4 border-t-[1px] border-gray'>
                <TouchableOpacity onPress={() => handleEventTransaction(id)}>
                    <LinearGradient
                        colors={["#1D4ED8", "#137DD3"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="py-4 relative h-auto flex-col gap-4"
                        style={{ borderRadius: 8 }}
                    >
                        <Text className='text-center font-poppins_semibold text-white text-[16px]'>Pesan</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
      ) : (
        <View className='w-full h-full flex-row justify-center items-center'>
            <Loader/>
        </View>
      )}
    </SafeAreaView>
  )
}
