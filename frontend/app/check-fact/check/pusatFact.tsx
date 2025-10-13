import API, { StorageAPI } from '@/app/lib/server';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { LinearGradient } from 'expo-linear-gradient';
import hoaxIcon from "@/assets/images/check-fact/hoax.png";
import factIcon from "@/assets/images/check-fact/fact.png";
import { Loader } from '@/app/lib/loader';

export default function PusatFact() {
    interface factProp {
        id: number;
        title: string;
        image: string;
        desc: string;
        detail: string;
        category: string;
    }

    const navigate = useRouter();
    const [fact, setFact] = useState<factProp[]>([]);
    const [isLoader, setIsLoader] = useState(true);

    useEffect(() => {
        const fetchFact = async() => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await API.get("/guest/fact", {
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
    }, []);
    
  return (
    <SafeAreaView edges={['top']} className='flex-1 bg-white'>
      {!isLoader ? (
        <View className='flex-1'>
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
              <Text className='text-white font-poppins_semibold text-[16px]'>Cek Fakta</Text>
              <View className='mr-6'></View>
            </View>
          </LinearGradient>
          <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 30 }}>
            <View className='px-6 flex-col gap-8'>
              {fact.map((item, index) => (
                  <View
                      key={index}
                      className='w-full h-auto relative bg-white pb-6'
                      style={{
                          borderRadius: 8,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.40,
                          shadowRadius: 4.84,
                          elevation: 5,
                      }}
                  >
                      <LinearGradient
                          colors={["#1D4ED8", "#137DD3"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className="px-4 py-3 h-auto w-fit flex-row items-center gap-4 absolute z-10"
                          style={{ borderTopLeftRadius: 8, borderBottomRightRadius: 8 }}
                      >
                          <Text className='text-white font-poppins_medium z-30 text-[12px]'>{item.category}</Text>
                      </LinearGradient>
                      <View className='h-[180px] relative'>
                          <Image className='absolute top-1/2 left-1/2 -translate-x-1/2 z-20 -translate-y-1/2 w-[140px] h-[140px]' source={item.category === "hoax" ? hoaxIcon : factIcon}/>
                          <View className='absolute inset-0 bg-black/50 z-10 rounded-lg' />
                          <Image source={{ uri: `${StorageAPI}/${item.image}` }} className='w-full h-full object-cover bg-cover rounded-lg' resizeMode="cover"/> 
                      </View>
                      <View className='mt-4 px-4 pb-6'>
                          <Text className='text-black font-poppins_semibold text-[16px]'>{item.title}</Text>
                          <Text className='text-black font-poppins_medium text-[10px] text-justify'>{item.desc}</Text>
                      </View>
                      <View className='px-4'>
                          <TouchableOpacity onPress={() => navigate.push({ pathname: '/check-fact/check/result/detail', params: { id: item.id } })}>
                              <LinearGradient
                                  colors={["#1D4ED8", "#137DD3"]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  className="px-4 py-3 h-auto w-[120px] flex-row items-center justify-center"
                                  style={{ borderRadius: 8 }}
                              >
                                  <Text className='text-white text-center font-poppins_medium text-[12px]'>Detail</Text>
                              </LinearGradient>
                          </TouchableOpacity>
                      </View>
                  </View>
              ))}
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
