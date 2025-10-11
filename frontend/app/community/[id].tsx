import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { View, ScrollView, Text, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import API, { StorageAPI } from '../lib/server'
import { showError, showSuccess } from '../lib/toast'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams, useRouter } from 'expo-router/build/hooks'
import guest from "@/assets/images/home/guest.png"
import { timeAgo } from '../lib/timeAgo'
import hamburger from "@/assets/images/icon/hambuger.png"
import DynamicImage from '../lib/dynamicImage'
import send from "@/assets/images/icon/send.png"
import upload from "@/assets/images/icon/upload.png"

export default function CommunityDetail() {
  interface communityProp {
    id: number;
    name: string;
    image: string;
    desc: string;
    post: communityPostProp[];
    user: communityUser[];
  }
  
  interface communityPostProp {
    id: number;
    message: string;
    image: string;
    user: communityUser
    created_at: string;
  }

  interface communityUser {
    id: number;
    name: string;
    image: string;    
  }

  const [communityPost, setCommunityPost] = useState<communityProp | null>(null);
  const { id } = useLocalSearchParams();
  const navigate = useRouter();
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await API.get(`/guest/community/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCommunityPost(response.data.data);
      } catch (error: any) {
        showError(error);
      }
    }
    fetchCommunity();
  }, [id]);

  const handlePost = async() => {
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("message", message);
      formData.append("community_id", id.toString());
      
      const token = await AsyncStorage.getItem("token");
      const response = await API.post("/communities/post", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      showSuccess(response.data.message);
    } catch (error: any) {
      showError(error.response.data.message);
    }
  }

  return (
    <SafeAreaView edges={["top"]} className='bg-white flex-1'>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <LinearGradient
          colors={["#1D4ED8", "#137DD3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="px-6 py-8 relative flex-col gap-4"
          style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
        >
          <View className='flex-row gap-2 items-center'>
            <TouchableOpacity onPress={() => navigate.push("/community/userCommunity")}>
              <Image source={back} className='w-[24px] h-[24px]'/>
            </TouchableOpacity>
            <Image source={{ uri: `${StorageAPI}/${communityPost?.image}` }} className='w-[52px] h-[52px]'/>
            <View className='flex-col ml-2'>
              <Text className='font-poppins_semibold text-white text-[16px]'>{communityPost?.name}</Text>
              <Text className='font-poppins_regular text-white text-[10px]'>{communityPost?.user?.length ?? 0} Pengikut</Text>
            </View>
          </View>
        </LinearGradient>
        <ScrollView 
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {communityPost?.post?.length ?? 0 > 0 ? (
            communityPost?.post.map((item, index) => (
              <View
                key={index}
                className='w-full h-auto p-6 bg-white mb-6'
                style={{
                  borderRadius: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.40,
                  shadowRadius: 4.84,
                  elevation: 5,
                }}
              >
                <View className='flex-row gap-4 items-center justify-between'>
                  <View className='flex-row gap-4'>
                    <Image 
                      source={item.user.image ? { uri: `${StorageAPI}/${item.user.image}` } : guest} 
                      className={`${item.user.image ? 'border-0' : 'border-[1px] border-primary'} w-[40px] h-[40px] rounded-full`} 
                    />
                    <View>
                      <Text className='font-poppins_semibold text-black text-[14px]'>{item.user.name}</Text>
                      <Text className='font-poppins_regular text-gray text-[10px]'>{timeAgo(item.created_at)}</Text>
                    </View>
                  </View>
                  <Image source={hamburger} className='w-[18px] h-[4px] -mt-8'/>
                </View>

                {item.image && (
                  <View className='mt-6'>
                    <DynamicImage uri={`${StorageAPI}/${item.image}`} />
                  </View>
                )}

                <Text className='w-full text-justify font-poppins_medium text-black text-[12px] mt-6'>
                  {item.message}
                </Text>
              </View>
            ))
          ) : (
            <View>
              <Text>Belum ada postingan</Text>
            </View>
          )}
        </ScrollView>
        <View className='bg-white border-t-[1px] border-gray px-4 py-6'>
          <View className='flex-row gap-4 items-center'>
            <View className='flex-row border-[1px] border-gray rounded-lg flex-1 items-center px-4'>
              <Image source={upload} className='w-[20px] h-[20px]'/>
              <TextInput
                placeholder='Ketik Pesan...'
                className='text-[12px] font-poppins_regular text-black flex-1 px-2'
                value={message}
                onChangeText={(e) => setMessage(e)}
              />
            </View>
            <TouchableOpacity onPress={() => handlePost()}>
              <Image source={send} className='w-[40px] h-[40px]'/>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
