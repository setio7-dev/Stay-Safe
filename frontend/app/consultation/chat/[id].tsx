import API, { StorageAPI } from '@/app/lib/server';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, Keyboard, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { Loader } from '@/app/lib/loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import send from "@/assets/images/icon/send.png"
import upload from "@/assets/images/icon/upload.png"
import left from "@/assets/images/consultation/left.png"
import right from "@/assets/images/consultation/right.png"
import guest from "@/assets/images/home/guest.png"
import mime from "mime";
import { formatTime } from '@/app/lib/clockFormat';
import { handleUploadImage } from '@/app/lib/uploadFile';
import { showError, showSuccess } from '@/app/lib/toast';
import DynamicImage from '@/app/lib/dynamicImage';

export default function ConsultationChat() {
  interface userProp {
    id: number;
    name: string;
    email: string;
    image: string;
  }
  
  interface conversationProp {
    id: number;
    category: string;
    hospital: string;
    user_id: number;
    receivers: userProp
  }

  interface messageProp {
    id: number;
    image: string;
    message: string;
    created_at: string;
    sender: userProp;
  }

  const { id } = useLocalSearchParams();
  const navigate = useRouter();
  const [conversation, setConversation] = useState<conversationProp | null>(null);
  const [isLoader, setIsLoader] = useState(true);
  const [message, setMessage] = useState<messageProp[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [userId, setUserId] = useState(0);
  const [image, setImage] = useState<any>(null);

  useEffect(() => {
    const fetchCoversation = async() => {
      const token = await AsyncStorage.getItem("token");
      const response = await API.get(`/conversation/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      setConversation(response.data.data);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoader(false);
    }

    const fetchMessage = async() => {
      const token = await AsyncStorage.getItem("token");
      const response = await API.get(`/conversations/message/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      setMessage(response.data.data);
    }

    const fetchMe = async() => {
      const token = await AsyncStorage.getItem("token");
      const response = await API.get('/me', { headers: { Authorization: `Bearer ${token}` }});
      setUserId(response.data.data.id);
    }

    fetchCoversation();
    fetchMessage();
    fetchMe();
    setInterval(() => {
      fetchMessage();
    }, 5000);
  }, [id]);

  const handlePost = async() => {
    let newImageUri: any;
    if (image) {
      newImageUri =  "file:///" + image.uri?.split("file:/").join("");
    }

    const formData = new FormData();
    if (image) {
      formData.append('image', {
        uri: newImageUri,
        type: mime.getType(newImageUri),    
        name: newImageUri?.split("/").pop(),
      } as any);
    }
    formData.append("message", userMessage);
    formData.append("conversation_id", id.toString());

    try {      
      const token = await AsyncStorage.getItem("token");
      await API.post("/conversations/message", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      Keyboard.dismiss();
      setUserMessage("");
      setImage(null);    
    } catch (error: any) {
      Keyboard.dismiss();
      showError(error.response?.data?.message);
    }
  }

  const handleDelete = async (messageId: number) => {
    Alert.alert(
      'Hapus Pesan',
      'Apakah kamu yakin ingin menghapus pesan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await API.delete(`/conversations/message/${messageId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(prev => prev.filter(m => m.id !== messageId));
            showSuccess("Pesan berhasil dihapus");
          } catch (error: any) {
            showError(error.response?.data?.message || "Gagal menghapus pesan");
          }
        }},
      ]
    );
  }

  const handleUploadFile = async () => {
    const imageFile = await handleUploadImage()
    if (imageFile) {
      setImage(imageFile)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className='bg-white' edges={['top', 'bottom']}>
        {!isLoader ? (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
              <View style={{ flex: 1 }}>
                <LinearGradient
                  colors={["#1D4ED8", "#137DD3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="px-6 py-6 relative flex-col gap-4"
                  style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
                >
                  <View className='flex-row gap-2 items-center'>
                    <TouchableOpacity onPress={() => navigate.push('/consultation/chat/consultationChat')}>
                      <Image source={back} className='w-[24px] h-[24px]'/>
                    </TouchableOpacity>
                    <Image source={{ uri: `${StorageAPI}/${conversation?.receivers?.image}` }} className='w-[50px] h-[50px] rounded-full'/>
                    <View className='flex-col ml-2'>
                      <Text className='font-poppins_semibold text-white text-[14px]'>{conversation?.receivers?.name}</Text>
                      <Text className='font-poppins_regular text-white text-[12px]'>Online</Text>
                    </View>
                  </View>
                </LinearGradient>
                <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false} className='h-full pt-8'>
                  <View className='flex-col gap-10 px-6'>
                    {message.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        onLongPress={() => handleDelete(item.id)}
                        delayLongPress={500}
                        activeOpacity={0.8}
                      >
                        <View className={`${item.sender.id === userId ? 'flex-row justify-end' : 'flex-row-reverse justify-end'} items-start gap-2 w-full`}>
                          <View className={`${item.sender.id === userId ? 'flex-row' : 'flex-row-reverse'} items-start`}>
                            <LinearGradient
                              colors={["#1D4ED8", "#137DD3"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              className="p-4 relative max-w-[240px] flex-col gap-2"
                              style={{ borderBottomLeftRadius: 6, borderBottomRightRadius: 6, borderTopLeftRadius: 6 }}
                            >
                              {item.image && (
                                <View className='border-2 border-white rounded-lg'>
                                  <DynamicImage source={`${StorageAPI}/${item.image}`}/>
                                </View>
                              )}
                              <Text className='text-white font-poppins_medium text-justify text-[12px]'>{item.message}</Text>
                              <Text className={`${item.sender.id === userId ? 'text-end self-end' : 'text-start'} text-white font-poppins_regular text-[10px]`}>{formatTime(item.created_at)}</Text>
                            </LinearGradient>
                            {item.sender.id === userId ? (
                              <Image source={right} className='w-[20px] h-[20px] -translate-x-2'/>
                            ) : (
                              <Image source={left} className='w-[20px] h-[20px] translate-x-2'/>
                            )}
                          </View>
                          <View>
                            <Image source={item?.sender?.image ? { uri: `${StorageAPI}/${item?.sender?.image}` } : guest} className='w-[44px] h-[44px] rounded-full'/>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                <View className={`bg-white border-t-[1px] border-gray px-4 pt-8 pb-6`}>
                <Image source={{ uri: image?.uri }} className={`${image ? 'w-[60px] h-[60px] mb-4 rounded-md' : 'hidden'}`}/>
                <View className='flex-row gap-4 items-center'>
                  <View className='flex-row border-[1px] border-gray rounded-lg flex-1 items-center px-4'>
                    <TouchableOpacity onPress={() => handleUploadFile()}>
                      <Image source={upload} className='w-[20px] h-[20px]'/>
                    </TouchableOpacity>
                    <TextInput
                      placeholder='Ketik Pesan...'
                      className='text-[12px] font-poppins_regular text-black flex-1 px-2'
                      value={userMessage}
                      multiline
                      onChangeText={(e) => setUserMessage(e)}
                    />
                  </View>
                  <TouchableOpacity onPress={() => handlePost()}>
                    <Image source={send} className='w-[40px] h-[40px]'/>
                  </TouchableOpacity>
                </View>
              </View>
              </View>
          </KeyboardAvoidingView>
        ) : (
          <View className='h-full w-full flex justify-center items-center'>
            <Loader/>
          </View>
        )}
    </SafeAreaView>
  )
}
