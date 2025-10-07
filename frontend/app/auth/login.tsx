import React, { useState } from 'react'
import logo from "@/assets/images/logo/logo-text.png"
import top from "@/assets/images/auth/top.png"
import google from "@/assets/images/auth/google.png"
import { Image, View, Text, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import API from '../lib/server'
import { showError, showSuccess } from '../lib/toast'
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Register() {
  const navigate = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async() => {
    try {
      const response = await API.post("/login", {
        email,
        password
      });
      
      const token = response?.data?.data?.token;
      await AsyncStorage.setItem("token", token);

      showSuccess(response.data.message);
      setTimeout(() => {
        navigate.push("/onboarding");
      }, 3000);
    } catch (error: any) {
      showError(error.response?.data?.message);
    }
  }

  return (
    <View className='flex-col h-full justify-around'>
      <Image source={top} className='w-full h-[34vh] absolute top-0 -z-10'/>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'position'} keyboardVerticalOffset={-200}  className='w-full'>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className='flex flex-col justify-center items-center w-full gap-6 -mt-14'>
            <Image source={logo} className='w-[150px] h-[50px]'/>
            <View className='bg-white w-[88%] h-auto rounded-2xl flex-col justify-center items-center shadow-md py-8'>
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
                  <Text onPress={() => navigate.push("/auth/register")} className='font-poppins_medium text-primary text-[16px]'>Daftar</Text>
                </View>
              </View>
              <View className='w-full px-8 mt-14 flex-col gap-6'>
                <View className='flex-col gap-2'>
                  <Text className='text-black font-poppins_medium text-[1rem]'>Email</Text>
                  <TextInput value={email} onChangeText={(e) => setEmail(e)} className='border-2 pl-4 font-poppins_regular text-[12px] rounded-lg border-gray w-full focus:border-primary' placeholder='Masukkan Email' placeholderTextColor="#ACACAC"/>
                </View>
                <View className='flex-col gap-2'>
                  <Text className='text-black font-poppins_medium text-[14px]'>Kata Sandi</Text>
                  <TextInput value={password} onChangeText={(e) => setPassword(e)} className='border-2 pl-4 font-poppins_regular text-[12px] rounded-lg border-gray w-full focus:border-primary' placeholder='Masukkan Kata Sandi' placeholderTextColor="#ACACAC"/>
                </View>
                <LinearGradient
                  colors={["#1D4ED8", "#137DD3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="px-8 py-4 mt-10"
                  style={{ borderRadius: 8 }}
                >
                  <Text onPress={handleLogin} className='font-poppins_medium text-white text-center text-[16px]'>Masuk</Text>
                </LinearGradient>
                <Text className='text-center font-poppins_regular text-gray text-[14px]'>Atau Dengan</Text>
                <TouchableOpacity onPress={() => navigate.push("/home")} className='border-2 z-50 rounded-sm border-gray flex-row justify-center items-center gap-2 py-3'>
                  <Image source={google} className='w-[22px] h-[22px]'/>
                  <Text className='font-poppins_regular text-gray text-center text-[12px]'>Google</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  )
}
