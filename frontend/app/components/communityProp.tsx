import React, { useEffect, useState } from 'react'
import API, { StorageAPI } from '../lib/server'
import { View, Image, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showError, showSuccess } from '../lib/toast';
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
    const [isLoader, setIsLoader] = useState(true);
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
                setCommunity(community);
            } catch (error: any) {
                showError(error.response.data.message);
            } finally {
                setIsLoader(false);
            }
        }

        fetchCommunity();
        setInterval(() => {
            fetchCommunity();        
        }, 3000);
    }, []);

    const handleJoin = async(communityID: number) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await API.post('/member/community', {
                community_id: communityID
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            showSuccess(response.data.message);
            navigate.push({ pathname: "/community/[id]", params: { id: communityID } })
        } catch (error: any) {
            showError(error.response.data.message);
            navigate.push({ pathname: "/community/[id]", params: { id: communityID } })
        }
    }

  return (
    <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 6 }} className='py-2'>
        <View className='flex-row items-center gap-8 mt-4 mr-6'>
          {community.length > 0 && !isLoader ? (
            community.map((item) => (
              <View key={item.id} className='flex-col bg-white rounded-lg w-[200px] h-[300px] items-center justify-center gap-6'
               style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.40,
                  shadowRadius: 4.84,
                  elevation: 5,
                }}>
                  <Image source={{ uri: `${StorageAPI}/${item.image}` }} className='w-[60px] rounded-full border-[1px] border-primary h-[60px]'/>
                  <View>
                      <Text className='font-poppins_semibold  text-center text-[16px text-black]'>{item.name}</Text>
                      <Text className='font-poppins_regular text-center text-gray text-[12px]'>{item.desc}</Text>
                  </View>
                  {item.user.length > 0 ? (
                    <View className='-mt-2 flex-row -gap-6'>
                      {item.user.map((profile) => (
                          <View key={profile.id} className='flex justify-center items-center -mr-2'>
                              {profile.image ? (
                                  <Image source={{ uri: `${StorageAPI}/${profile.image}` }} className='w-[20px] h-[20px] border-[1px] border-primary rounded-full'/>
                              ) : (
                                  <Image source={guest} className='w-[20px] h-[20px] border-[1px] border-primary rounded-full'/>
                              )}
                          </View>
                      ))}
                  </View>
                  ) : (
                    <View className='h-[20px] -mt-2'></View>
                  )}
                  <TouchableOpacity onPress={() => handleJoin(item.id)}>
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
