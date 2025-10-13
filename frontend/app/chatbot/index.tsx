import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import back from "@/assets/images/icon/back.png";
import send from "@/assets/images/icon/send.png";
import upload from "@/assets/images/icon/upload.png";
import left from "@/assets/images/consultation/left.png";
import right from "@/assets/images/consultation/right.png";
import guest from "@/assets/images/home/guest.png";
import chatbotWhite from "@/assets/images/chatbot/chatbot-white.png";
import icon from "@/assets/images/chatbot/icon.png";
import DynamicImage from '@/app/lib/dynamicImage';
import { handleUploadImage } from '@/app/lib/uploadFile';
import API, { StorageAPI } from '@/app/lib/server';
import { useRouter } from 'expo-router';
import { showError } from '@/app/lib/toast';
import { GoogleGenAI } from "@google/genai";

export default function Index() {
  interface messageProp { id: number; image?: string; message: string; user: string; }
  interface userProp { id: number; name: string; image: string; }

  const navigate = useRouter();
  const [message, setMessage] = useState<messageProp[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [image, setImage] = useState<any>(null);
  const [user, setUser] = useState<userProp | null>(null);

  const client = new GoogleGenAI({ apiKey: "AIzaSyB_cFfG3bQBRspFln-raNP6FFJjglkc-7k" });

  useEffect(() => {
    const fetchMe = async() => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const response = await API.get("/me", { headers: { Authorization: `Bearer ${token}` } });
      setUser(response.data.data);
    }
    fetchMe();
  }, []);

  const handleUploadFile = async () => {
    const imageFile = await handleUploadImage()
    if (imageFile) setImage(imageFile)
  }

  const handlePost = async() => {
    if (!userMessage && !image) return;

    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes('siapa kamu') || lowerMsg.includes('kamu siapa') || lowerMsg.includes('tugas kamu')) {
      const reply = 'Saya Asisten Pintar dari Stay Safe, siap membantu Anda dengan informasi dan bimbingan.';
      setMessage([...message, { id: Date.now(), message: userMessage, user: 'user' }, { id: Date.now()+1, message: reply, user: 'bot' }]);
      setUserMessage('');
      setImage(null);
      return;
    }

    try {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMessage
      });

      const botMessage = typeof response?.text === "string" ? response.text : "Tidak ada balasan";
      setMessage([...message, { id: Date.now(), message: userMessage, user: 'user', image: image?.uri }, { id: Date.now()+1, message: botMessage, user: 'bot' }]);
      setUserMessage('');
      setImage(null);

    } catch (error: any) {
      showError(error?.message || 'Gagal mengirim pesan');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className='bg-white' edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <LinearGradient colors={["#1D4ED8", "#137DD3"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="px-6 py-6 relative flex-col gap-4" style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
            <View className='flex-row gap-2 items-center'>
              <TouchableOpacity onPress={() => navigate.push('/home')}>
                <Image source={back} className='w-[24px] h-[24px]'/>
              </TouchableOpacity>
              <Image source={chatbotWhite} className='w-[50px] h-[50px] rounded-full'/>
              <View className='flex-col ml-2'>
                <Text className='font-poppins_semibold text-white text-[14px]'>Asisten Pintar</Text>
                <Text className='font-poppins_regular text-white text-[12px]'>Stay Safe</Text>
              </View>
            </View>
          </LinearGradient>

          <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false} className='h-full pt-8'>
            <View className='flex-col gap-10 px-6'>
              {message.map((item, index) => (
                <View key={index} className={`${item.user === "user" ? 'flex-row justify-end' : 'flex-row-reverse justify-end'} items-start gap-2 w-full`}>
                  <View className={`${item.user === "user" ? 'flex-row' : 'flex-row-reverse'} items-start`}>
                    <LinearGradient colors={["#1D4ED8", "#137DD3"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="p-4 relative max-w-[240px] flex-col gap-2" style={{ borderBottomLeftRadius: 6, borderBottomRightRadius: 6, borderTopLeftRadius: 6 }}>
                      {item.image && (
                        <View className='border-2 border-white rounded-lg'>
                          <DynamicImage source={item.image.includes('http') ? item.image : `${StorageAPI}/${item.image}`}/>
                        </View>
                      )}
                      <Text className='text-white font-poppins_medium text-justify text-[12px]'>{item.message}</Text>
                    </LinearGradient>
                    {item.user === "user" ? (
                      <Image source={right} className='w-[20px] h-[20px] -translate-x-2'/>
                    ) : (
                      <Image source={left} className='w-[20px] h-[20px] translate-x-2'/>
                    )}
                  </View>
                  <View>
                    <Image source={item.user === "user" && user?.image ? { uri: `${StorageAPI}/${user.image}` } : item.user === "bot" ? { uri: icon } : guest} className='w-[44px] h-[44px] rounded-full'/>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View className={`bg-white border-t-[1px] border-gray px-4 pt-8 pb-6`}>
            <Image source={{ uri: image?.uri }} className={`${image ? 'w-[60px] h-[60px] mb-4 rounded-md' : 'hidden'}`}/>
            <View className='flex-row gap-4 items-center'>
              <View className='flex-row border-[1px] border-gray rounded-lg flex-1 items-center px-4'>
                <TouchableOpacity onPress={handleUploadFile}>
                  <Image source={upload} className='w-[20px] h-[20px]'/>
                </TouchableOpacity>
                <TextInput placeholder='Ketik Pesan...' className='text-[12px] font-poppins_regular text-black flex-1 px-2' value={userMessage} multiline onChangeText={setUserMessage}/>
              </View>
              <TouchableOpacity onPress={handlePost}>
                <Image source={send} className='w-[40px] h-[40px]'/>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
