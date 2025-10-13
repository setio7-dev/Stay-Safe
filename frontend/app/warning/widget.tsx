import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { useRouter } from 'expo-router'
import icon from "@/assets/images/warning/widget.png";
import API from '../lib/server'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { showError, showSuccess } from '../lib/toast'

const boardingData = {
    image: icon,
    name: "Widget Darurat",
    desc: "Widget Darurat adalah fitur akses cepat di layar utama ponsel yang memudahkan Anda terhubung dengan polisi atau rumah sakit terdekat hanya dengan sekali sentuh, sehingga bantuan dapat datang lebih cepat tanpa perlu membuka aplikasi terlebih dahulu.",
    route: "/warning" as any
}

export default function Widget() {
    const navigate = useRouter();
    const [status, setStatus] = useState("");

    const fetchMe = async() => {
        const token = await AsyncStorage.getItem("token");
        const response = await API.get("/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        setStatus(response.data.data.warning_widget);
    }

    useEffect(() => {
        fetchMe();
    }, []);
    
    const handleWidget = async() => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await API.put("/guest/warning", {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            showSuccess(response.data.message);
            fetchMe();
        } catch (error: any) {
            showError(error);
        }
    }

  return (
    <SafeAreaView style={{ flex: 1 }} className='bg-white'>
        <ScrollView>
            <LinearGradient
              colors={["#1D4ED8", "#137DD3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-6 py-8 relative h-auto flex-col gap-4"
              style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12, }}
            >
            <View className='flex-row justify-start items-center gap-2'>
              <TouchableOpacity onPress={() => navigate.back()} className='flex-row justify-start items-center gap-2'>
                <Image source={back} className='w-[24px] h-[24px]'/>
                <Text className='text-white font-poppins_semibold text-[14px]'>Kembali</Text>
              </TouchableOpacity>
              <View></View>
            </View>
            </LinearGradient>
            <View className='w-full mt-12 h-full flex-col items-center justify-center px-6 gap-10'>
                <Image source={boardingData.image} className='w-[140px] h-[140px]'/>
                <View className='flex-col gap-2'>
                    <Text className='text-[24px] text-center font-poppins_semibold text-primary'>{boardingData.name}</Text>
                    <Text className='text-center font-poppins_regular text-black text-[12px]'>{boardingData.desc}</Text>
                </View>
                <TouchableOpacity className='w-full' onPress={handleWidget}>
                    <LinearGradient
                        colors={["#1D4ED8", "#137DD3"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="px-8 py-4 relative h-auto flex-col gap-4"
                        style={{ borderRadius: 6 }}
                    >
                        <Text className='text-center font-poppins_medium text-white text-[16px]'>{status === "false" ? "Aktifkan" : "Nonaktifkan"}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </SafeAreaView>
  )
}
