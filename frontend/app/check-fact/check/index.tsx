import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, ScrollView, Text, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import DynamicImage from '@/app/lib/dynamicImage'
import example from "@/assets/images/check-fact/example.png"
import upload from "@/assets/images/check-fact/upload.png"
import axios from 'axios'
import { factDetectionAPI } from '@/app/lib/server'
import { showError, showSuccess } from '@/app/lib/toast'
import { handleUploadImage } from '@/app/lib/uploadFile'
import mime from "mime"

export default function Index() {
    const navigate = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<any>(null);
    const [news_url, setNewsUrl] = useState("");

    const handleSubmit = async() => {
      try {
        if (!title || !description) {
          showError("Judul dan Deskripsi Berita Wajib Diisi");
          return;
        }

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
        formData.append("title", title);
        formData.append("description", description);
        formData.append("news_url", news_url);

        const response = await axios.post(factDetectionAPI, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        showSuccess("Berhasil Dianalisis");

        setTimeout(() => {
          navigate.push({ pathname: '/check-fact/check/result', params: { result: JSON.stringify(response.data) } })
        }, 3000);
      } catch (error: any) {
        showError(error);
      }
    }

    const handleUploadFile = async () => {
      const imageFile = await handleUploadImage()
      if (imageFile) {
        setImage(imageFile)
      }
    }

  return (
    <SafeAreaView edges={['top']} className='bg-white flex-1'>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className='flex-1'>
                <LinearGradient
                  colors={["#1D4ED8", "#137DD3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="px-6 py-8 flex-col gap-4"
                  style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
                >
                  <View className='flex-row justify-between items-center'>
                    <TouchableOpacity onPress={() => navigate.push('/home')}>
                      <Image source={back} className='w-[24px] h-[24px]'/>
                    </TouchableOpacity>
                    <Text className='text-white font-poppins_semibold text-[16px]'>Cek Fakta</Text>
                    <View className='mr-6'></View>
                  </View>
                </LinearGradient>
                <ScrollView className='flex-1' contentContainerStyle={{ paddingTop: 30, paddingBottom: 40 }}>
                    <View className='px-6 flex-col gap-8'>
                        <DynamicImage source={example}/>
                        <TouchableOpacity onPress={() => handleUploadFile()}>
                            <DynamicImage source={upload}/>
                        </TouchableOpacity>
                        <View className='flex-col gap-2'>
                          <Text className='text-black font-poppins_medium text-[1rem]'>Nama Berita</Text>
                          <TextInput value={title} onChangeText={(e) => setTitle(e)} className='border-2 pl-4 font-poppins_regular text-[12px] rounded-lg border-gray w-full focus:border-primary' placeholder='Masukkan Nama Berita...' placeholderTextColor="#ACACAC"/>
                        </View>
                        <View className='flex-col gap-2'>
                          <Text className='text-black font-poppins_medium text-[1rem]'>Deskripsi Berita</Text>
                          <TextInput value={description} onChangeText={(e) => setDescription(e)} className='border-2 pl-4 font-poppins_regular text-[12px] rounded-lg border-gray w-full h-[120px] align-top pt-3 focus:border-primary' placeholder='Masukkan Deskripsi Berita...' placeholderTextColor="#ACACAC"/>
                        </View>
                        <View className='flex-col gap-2'>
                          <Text className='text-black font-poppins_medium text-[1rem]'>Link Berita (Jika Ada)</Text>
                          <TextInput value={news_url} onChangeText={(e) => setNewsUrl(e)} className='border-2 pl-4 font-poppins_regular text-[12px] rounded-lg border-gray w-full focus:border-primary' placeholder='Masukkan Link Berita...' placeholderTextColor="#ACACAC"/>
                        </View>
                        <Text className='text-black font-poppins_medium text-center text-[12px]'>Unggah Link, foto, atau artikel yang ingin diperiksa, lalu sistem akan menganalisis dan mencocokkannya dengan sumber terpercaya. Hasil verifikasi beserta riwayat pencarian akan tersimpan dalam bentuk artikel terverifikasi yang bisa dibaca kembali kapan saja.</Text>
                        <TouchableOpacity className='w-full' onPress={handleSubmit}>
                            <LinearGradient
                                colors={["#1D4ED8", "#137DD3"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="px-8 py-4 relative h-auto flex-col gap-4"
                                style={{ borderRadius: 6 }}
                            >
                                <Text className='text-center font-poppins_medium text-white text-[16px]'>Analisa</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
