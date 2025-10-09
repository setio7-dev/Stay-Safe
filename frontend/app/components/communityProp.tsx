import React, { useEffect, useState } from 'react'
import API, { StorageAPI } from '../lib/server'
import { View, Image, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showError } from '../lib/toast';
import guest from "@/assets/images/home/guest.png";
import LoaderCircle from '../lib/loaderCircle';

export default function CommunityProp() {
    interface userProp {
        id: number;
        image: string;
    }

    interface communityProp {
        id: number;
        name: string;
        desc: string;
        image: string;
        user: userProp[];
    }

    const [community, setCommunity] = useState<communityProp[]>([]);
    const navigate = useRouter();

    useEffect(() => {
        const fetchCommunity = async() => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await API.get("/guest/community", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const community = response.data.data;
                const communityFilter = community.filter((item: any) => {
                    const data = item.user.length > 0 ? true : false;
                    return data;
                });

                setCommunity(communityFilter);
            } catch (error: any) {
                showError(error.response.data.message);
            }
        }

        fetchCommunity();
    }, []);

  return (
    <ScrollView horizontal className='overflow-x-auto'>
        <View className='flex-row items-center gap-4 mt-4 mr-6'>
          {community.length > 0 ? (
            community.map((item) => (
              <View key={item.id} className='flex-col bg-white drop-shadow-2xl rounded-lg w-[200px] h-[300px] items-center justify-center gap-6'>
                  <Image source={{ uri: `${StorageAPI}/${item.image}` }} className='w-[60px] h-[60px]'/>
                  <View>
                      <Text className='font-poppins_semibold text-[16px text-black]'>{item.name}</Text>
                      <Text className='font-poppins_regular text-gray text-[12px]'>{item.desc}</Text>
                  </View>
                  <View className='-mt-2'>
                      {item.user.map((profile) => (
                          <View key={profile.id} className='flex justify-center items-center'>
                              {profile.image ? (
                                  <Image source={{ uri: `${StorageAPI}/${profile.image}` }} className='w-[36px] h-[36px] border-[1px] border-primary rounded-full'/>
                              ) : (
                                  <Image source={guest} className='w-[36px] h-[36px] border-[1px] border-primary rounded-full'/>
                              )}
                          </View>
                      ))}
                  </View>
                  <TouchableOpacity>
                      <Text className='text-[12px] font-poppins_semibold text-white bg-secondary px-6 py-2 rounded-lg'>Gabung</Text>
                  </TouchableOpacity>
              </View>
            ))
          ) : (
            <View className='flex-row w-full h-[20vh] items-center justify-center gap-24'>
                {[1, 2, 3].map((item, index) => (
                    <LoaderCircle key={index}/>
                ))}
            </View>
          )}
        </View>
    </ScrollView>
  )
}
