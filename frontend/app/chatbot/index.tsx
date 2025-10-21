import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import back from "@/assets/images/icon/back.png";
import send from "@/assets/images/icon/send.png";
import left from "@/assets/images/consultation/left.png";
import right from "@/assets/images/consultation/right.png";
import guest from "@/assets/images/home/guest.png";
import chatbotWhite from "@/assets/images/chatbot/chatbot-white.png";
import icon from "@/assets/images/chatbot/icon.png";
import API, { StorageAPI } from '@/app/lib/server';
import { useRouter } from 'expo-router';
import { showError } from '@/app/lib/toast';
import { GoogleGenAI } from "@google/genai";

interface MessageProp {
  id: number;
  message: string;
  user: string;
  isLoading?: boolean;
}

interface UserProp {
  id: number;
  name: string;
  image: string;
}

export default function Index() {
  const navigate = useRouter();
  const [message, setMessage] = useState<MessageProp[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [user, setUser] = useState<UserProp | null>(null);
  const [loading, setLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState<{ [key: number]: string }>({});

  const client = new GoogleGenAI({ apiKey: "AIzaSyB_cFfG3bQBRspFln-raNP6FFJjglkc-7k" });

  useEffect(() => {
    const fetchMe = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const response = await API.get("/me", { headers: { Authorization: `Bearer ${token}` } });
      setUser(response.data.data);
    };
    fetchMe();
  }, []);

  useEffect(() => {
    const lastMessage = message[message.length - 1];
    if (lastMessage && lastMessage.user === 'bot' && lastMessage.isLoading === false) {
      const fullText = lastMessage.message;
      const currentDisplayed = displayedText[lastMessage.id] || '';

      if (currentDisplayed.length < fullText.length) {
        const timer = setTimeout(() => {
          const chunkSize = 5;
          const endIdx = Math.min(currentDisplayed.length + chunkSize, fullText.length);
          const newText = fullText.substring(0, endIdx);
          setDisplayedText(prev => ({
            ...prev,
            [lastMessage.id]: newText
          }));
        }, 2);

        return () => clearTimeout(timer);
      }
    }
  }, [displayedText, message]);

  const SkeletonMessage = () => (
    <View className='flex-col gap-2'>
      <View className='h-4 bg-gray-300 rounded w-48 mb-1'/>
      <View className='h-4 bg-gray-300 rounded w-40'/>
    </View>
  );

  const renderTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={idx} className='font-poppins_semibold'>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return part;
    });
  };

  const handlePost = async () => {
    if (!userMessage.trim() || loading) return;

    const userMsg = userMessage;
    setUserMessage("");
    setMessage(prev => [...prev, { id: Date.now(), message: userMsg, user: 'user' }]);

    const lowerMsg = userMsg.toLowerCase();
    if (lowerMsg.includes('siapa kamu') || lowerMsg.includes('kamu siapa') || lowerMsg.includes('tugas kamu')) {
      const reply = 'Saya Asisten Pintar dari Stay Safe, siap membantu Anda dengan informasi dan bimbingan.';
      const botId = Date.now() + 1;
      setMessage(prev => [...prev, { id: botId, message: reply, user: 'bot', isLoading: false }]);
      setDisplayedText(prev => ({ ...prev, [botId]: '' }));
      return;
    }

    const loadingId = Date.now() + 1;
    setMessage(prev => [...prev, { id: loadingId, message: '', user: 'bot', isLoading: true }]);
    setLoading(true);

    try {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
      Kamu adalah asisten pintar bernama Stay Safe. 
      Jawab **hanya** pertanyaan yang berhubungan dengan topik perlindungan, seperti:
      - perlindungan diri
      - keselamatan masyarakat
      - keamanan lingkungan
      - bencana alam
      - kesehatan darurat
      - pertolongan pertama
      - evakuasi dan pencegahan bahaya
            
      Jika pertanyaan di luar itu, jawab dengan sopan seperti:
      "Maaf, saya hanya bisa membantu dalam topik perlindungan dan keselamatan."
            
      Pertanyaan: ${userMsg}
      `
      });

      const botMessage = typeof response?.text === "string" ? response.text : "Tidak ada balasan";

      setMessage(prev =>
        prev.map(msg =>
          msg.id === loadingId
            ? { ...msg, message: botMessage, isLoading: false }
            : msg
        )
      );
      setDisplayedText(prev => ({ ...prev, [loadingId]: '' }));

    } catch (error: any) {
      showError(error?.message || 'Gagal mengirim pesan');
      setMessage(prev => prev.filter(msg => msg.id !== loadingId));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className='bg-white' edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <LinearGradient colors={["#1D4ED8", "#137DD3"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="px-6 py-6 relative flex-col gap-4" style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
            <View className='flex-row gap-2 items-center'>
              <TouchableOpacity onPress={() => navigate.push('/home')}>
                <Image source={back} className='w-[24px] h-[24px]' />
              </TouchableOpacity>
              <Image source={chatbotWhite} className='w-[50px] h-[50px] rounded-full' />
              <View className='flex-col ml-2'>
                <Text className='font-poppins_semibold text-white text-[14px]'>Asisten Pintar</Text>
                <Text className='font-poppins_regular text-white text-[12px]'>Stay Safe</Text>
              </View>
            </View>
          </LinearGradient>

          <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false} className='h-full pt-8'>
            <View className='flex-col gap-10 px-6'>
              {message.map((item) => (
                <View key={item.id} className={`${item.user === "user" ? 'flex-row justify-end' : 'flex-row-reverse justify-end'} items-start gap-2 w-full`}>
                  <View className={`${item.user === "user" ? 'flex-row' : 'flex-row-reverse'} items-start`}>
                    <LinearGradient colors={["#1D4ED8", "#137DD3"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="p-4 relative max-w-[240px] flex-col gap-2" style={{ borderRadius: 6 }}>
                      {item.isLoading ? (
                        <SkeletonMessage />
                      ) : (
                        <Text className='text-white font-poppins_regular text-justify text-[12px]'>
                          {item.user === 'bot' ? renderTextWithBold(displayedText[item.id] || item.message) : item.message}
                        </Text>
                      )}
                    </LinearGradient>
                    {item.user === "user" ? (
                      <Image source={right} className='w-[20px] h-[20px] -translate-x-2' />
                    ) : (
                      <Image source={left} className='w-[20px] h-[20px] translate-x-2' />
                    )}
                  </View>
                  <View>
                    <Image source={item.user === "user" && user?.image ? { uri: `${StorageAPI}/${user.image}` } : item.user === "bot" ? icon : guest} className='w-[44px] h-[44px] rounded-full' />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View className={`bg-white border-t-[1px] border-gray px-4 pt-8 pb-6`}>
            <View className='flex-row gap-4 items-center'>
              <View className='flex-row border-[1px] border-gray rounded-lg flex-1 items-center px-4'>
                <TextInput placeholder='Ketik Pesan...' className='text-[12px] font-poppins_regular text-black flex-1 px-2' value={userMessage} multiline onChangeText={setUserMessage} editable={!loading} />
              </View>
              <TouchableOpacity onPress={handlePost} disabled={loading}>
                <Image source={send} className='w-[40px] h-[40px]' style={{ opacity: loading ? 0.5 : 1 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}