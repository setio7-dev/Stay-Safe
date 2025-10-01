import React from 'react'
import logo from "@/assets/images/logo/logo-text.png"
import top from "@/assets/images/auth/top.png"
import google from "@/assets/images/auth/google.png"
import { Image, View, Text, TextInput } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Progress from "react-native-progress"

export default function Auth() {

  return (
    <View>
        <Image source={top} className='w-full h-[34vh] relative'/>
        <View className='flex flex-col justify-center items-center absolute w-full z-20 gap-6 top-24'>
          <Image source={logo} className='w-[150px] h-[50px]'/>
          <View className='bg-white w-[88%] h-auto rounded-2xl flex-col justify-center items-center shadow-md py-12'>
            <View className='flex-row w-full justify-between items-center px-8'>
              <LinearGradient
                colors={["#1D4ED8", "#137DD3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-10 py-3"
                style={{ borderRadius: 1000 }}
              >
                <Text className='font-poppins_medium text-white text-[16px]'>Masuk</Text>
              </LinearGradient>
              <View className="px-8 py-3">
                <Text className='font-poppins_medium text-primary text-[16px]'>Daftar</Text>
              </View>
            </View>
            <View className='w-full px-8 mt-12 flex-col gap-8'>
              <View className='flex-col gap-2'>
                <Text className='text-black font-poppins_medium text-[1rem]'>Email</Text>
                <TextInput className='border-2 pl-4 font-poppins_regular text-[12px] rounded-lg border-gray w-full' placeholder='Masukkan Email' placeholderTextColor="#ACACAC"/>
              </View>
              <View className='flex-col gap-2'>
                <Text className='text-black font-poppins_medium text-[14px]'>Kata Sandi</Text>
                <TextInput className='border-2 pl-4 font-poppins_regular text-[12px] rounded-lg border-gray w-full' placeholder='Masukkan Kata Sandi' placeholderTextColor="#ACACAC"/>
              </View>
              <LinearGradient
                colors={["#1D4ED8", "#137DD3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-8 py-4 mt-4"
                style={{ borderRadius: 8 }}
              >
                <Text className='font-poppins_medium text-white text-center text-[16px]'>Masuk</Text>
              </LinearGradient>
              <Text className='text-center font-poppins_regular text-gray text-[14px]'>Atau Dengan</Text>
              <View className='border-2 rounded-sm border-gray flex-row justify-center items-center gap-2 py-3'>
                <Image source={google} className='w-[22px] h-[22px]'/>
                <Text className='font-poppins_regular text-gray text-center text-[12px]'>Google</Text>
              </View>
            </View>
          </View>
        </View>
    </View>
  )
}
