import React, { useEffect, useState } from 'react'
import back from "@/assets/images/icon/back.png"
import { View, ScrollView, Image, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router';
import API, { StorageAPI } from '@/app/lib/server';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Loader } from '@/app/lib/loader';
import { LinearGradient } from 'expo-linear-gradient';
import hoaxIcon from "@/assets/images/check-fact/hoax.png";
import factIcon from "@/assets/images/check-fact/fact.png";

export default function Detail() {
    interface factProp {
        id: number;
        title: string;
        image: string;
        desc: string;
        detail: string;
        category: string;
    }

    const navigate = useRouter();
    const [fact, setFact] = useState<factProp | null>(null);
    const [isLoader, setIsLoader] = useState(true);
    const { id } = useLocalSearchParams();

    useEffect(() => {
        const fetchFact = async() => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await API.get(`/guest/fact/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setFact(response.data.data);
            } catch (error) {
                
            } finally {
                setIsLoader(false);
            }
        }

        fetchFact();
    }, [id]);
  return (
    <SafeAreaView edges={['top']} className='flex-1 bg-white'>
      {!isLoader ? (
        <View className='w-full flex-1'>   
            <LinearGradient
              colors={["#1D4ED8", "#137DD3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-6 py-8 flex-col gap-4"
              style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
            >
              <View className='flex-row justify-between items-center'>
                <TouchableOpacity onPress={() => navigate.push('/check-fact/check/pusatFact')}>
                  <Image source={back} className='w-[24px] h-[24px]'/>
                </TouchableOpacity>
                <Text className='text-white font-poppins_semibold text-[16px]'>Cek Fakta</Text>
                <View className='mr-6'></View>
              </View>
            </LinearGradient>
            <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 40, paddingTop: 30 }}>
                <View className='px-6'>
                    <View className='relative'>
                        <LinearGradient
                            colors={["#1D4ED8", "#137DD3"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="px-4 py-3 h-auto w-fit flex-row items-center gap-4 absolute z-10"
                            style={{ borderTopLeftRadius: 8, borderBottomRightRadius: 8 }}
                        >
                            <Text className='text-white font-poppins_medium z-30 text-[12px]'>{fact?.category}</Text>
                        </LinearGradient>
                        <View className='h-[180px] relative'>
                            <Image className='absolute top-1/2 left-1/2 -translate-x-1/2 z-20 -translate-y-1/2 w-[140px] h-[140px]' source={fact?.category === "hoax" ? hoaxIcon : factIcon}/>
                            <View className='absolute inset-0 bg-black/50 z-10 rounded-lg' />
                            <Image source={{ uri: `${StorageAPI}/${fact?.image}` }} className='w-full h-full object-cover bg-cover rounded-lg' resizeMode="cover"/> 
                        </View>
                    </View>
                    <Text className='mt-6 text-black font-poppins_semibold text-justify text-[16px]'>{fact?.title}</Text>
                    <Text className='mt-4 text-black font-poppins_medium text-justify text-[12px]'>{fact?.detail}</Text>
                </View>
            </ScrollView>
        </View>
      ) : (
        <View className='flex justify-center items-center w-full h-full'>
            <Loader/>
        </View>
      )}
    </SafeAreaView>
  )
}
