import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { View, Image, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import guest from "@/assets/images/home/guest.png"
import { showError, showSuccess } from '../lib/toast'
import AsyncStorage from '@react-native-async-storage/async-storage'
import API, { StorageAPI } from '../lib/server'
import post from "@/assets/images/icon/post.png"
import privacy from "@/assets/images/icon/privacy.png"
import setting from "@/assets/images/icon/setting.png"
import profile from "@/assets/images/icon/profile.png"
import next from "@/assets/images/icon/next-profile.png"
import { useRouter } from 'expo-router'
import useRefresh from '../lib/refresh'
import Authenticated from '../context/Authenticated'

export default function Profile() {
  interface userProp {
    id: number;
    name: string;
    email: string;
    image: string;
  }

  const [user, setUser] = useState<userProp | null>(null);
  const navigate = useRouter();

  const fetchData = async() => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  const { refreshing, onRefresh } = useRefresh(fetchData);

  useEffect(() => {
    const fetchUser = async() => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await API.get("/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data.data);
      } catch (error: any) {
        showError("Terjadi Kesalahan", error);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async() => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await API.post("/logout", {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      showSuccess(response.data.message);
      await AsyncStorage.removeItem("token");
      setTimeout(() => {
        navigate.push("/");
      }, 3000);
    } catch (error: any) {
      showError(error);
    }
  }

  const settingData = [
    {
      id: 1,
      image: profile,
      name: "Ubah Profile",
      route: `/profile/[id]`
    },
    {
      id: 2,
      image: post,
      name: "Postingan Saya",
      route: "/home/profile"
    },
    {
      id: 3,
      image: privacy,
      name: "Keamanan & Privasi",
      route: "/home/profile"
    },
    {
      id: 4,
      image: setting,
      name: "Pengaturan",
      route: "/home/profile"
    },
  ];

  return (
    <SafeAreaView className='bg-white h-full w-full'>
      <Authenticated>
        <ScrollView refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={refreshing}/>}>
          <LinearGradient
            colors={["#1D4ED8", "#137DD3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 py-12 relative h-auto flex-col justify-center items-center gap-2 w-full"
            style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
          >
            <Image source={user?.image ? { uri: `${StorageAPI}/${user.image}`} : guest} className='w-[70px] h-[70px] rounded-full mb-4'/>
            <Text className='text-white font-poppins_semibold text-[20px]'>{user?.name}</Text>
            <Text className='text-white font-poppins_regular text-[14px]'>{user?.email}</Text>
          </LinearGradient>
          <View className='flex-col items-start w-full mt-14 gap-10 px-14'>
            {settingData.map((item, index) => (
              <TouchableOpacity onPress={() => {
                if (item.id === 1) {
                  navigate.push({
                    pathname: '/profile/[id]',
                    params: { id: String(user?.id) },
                  });
                } else {
                  navigate.push(item.route as any);
                }
              }} key={index}>
                <View className='flex-row items-center justify-between w-full'>
                  <View className='flex-row items-center gap-6'>
                    <Image source={item.image} className='w-[16px] h-[20px]'/>
                    <Text className='font-poppins_medium text-black text-[14px]'>{item.name}</Text>
                  </View>
                  <Image source={next} className='w-[24px] h-[24px]'/>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity className='w-full' onPress={() => handleLogout()}>
              <LinearGradient
                colors={["#1D4ED8", "#137DD3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 w-full"
                style={{ borderRadius: 12 }}
              >
                <Text className='font-poppins_semibold text-white text-center'>Keluar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Authenticated>
    </SafeAreaView>
  )
}
