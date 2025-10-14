import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { View, Image, Text, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { useLocalSearchParams, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { showError, showSuccess } from '../lib/toast'
import API, { StorageAPI } from '../lib/server'
import guest from "@/assets/images/home/guest.png"
import pen from "@/assets/images/icon/edit.png"
import { handleUploadImage } from '../lib/uploadFile'
import mime from "mime"

export default function EditProfile() {
    interface userProp {
      id: number;
      name: string;
      email: string;
      image: string;
    }

    const navigate = useRouter();
    const { id } = useLocalSearchParams();
    const [user, setUser] = useState<userProp | null>(null);
    const [name, setName] = useState<any>("");
    const [email, setEmail] = useState<any>("");
    const [password, setPassword] = useState<any>("");
    const [image, setImage] = useState<any>(null);

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
          setEmail(user?.email);
          setImage(user?.image);
          setName(user?.name);
        } catch (error: any) {
          showError("Terjadi Kesalahan", error);
        }
      }
      fetchUser();
    }, [id, image, user]);

    const handleUpdateUser = async() => {
      try {
        const token = await AsyncStorage.getItem("token");        
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
        formData.append("_method", "PUT");
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);

        const response = await API.post(`/guest/user/${user?.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });

        showSuccess(response?.data?.message);
        setTimeout(() => {
          navigate.push('/home/profile');
        }, 3000);
      } catch (error: any) {
        showError(error.response?.data?.message);
        console.error(error)
      }
    }

    const handleUploadFile = async () => {
      const imageFile = await handleUploadImage()
      if (imageFile) {
        setImage(imageFile)
      }
    }

  return (
    <SafeAreaView edges={['top']} className='flex-1 bg-white'>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View>
                <LinearGradient
                    colors={["#1D4ED8", "#137DD3"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="px-6 py-8 relative h-auto flex-col gap-4"
                    style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12, }}
                >
                  <TouchableOpacity onPress={() => navigate.back()}>
                    <View className='flex-row items-center gap-4'>
                      <Image source={back} className='w-[24px] h-[24px]'/>
                      <Text className='text-white font-poppins_semibold text-[14px]'>Kembali</Text>
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
                <View className='pt-12 flex-col justify-center items-center px-6'>
                    <View className='relative'>
                      <Image source={ user?.image ? { uri: `${StorageAPI}/${user.image}` } : guest } className='w-[80px] h-[80px] rounded-full border-[1px] border-primary'/>
                      <TouchableOpacity onPress={handleUploadFile}>
                        <Image source={pen} className='w-[20px] h-[20px] absolute right-0 bottom-0'/>
                      </TouchableOpacity>
                    </View>
                    <View className='flex-col gap-2 w-full mt-6'>
                      <Text className='text-black font-poppins_medium text-[1rem]'>Nama</Text>
                      <TextInput value={name} onChangeText={(e) => setName(e)} className='border-2 pl-4 font-poppins_regular text-[12px] rounded-lg border-gray w-full focus:border-primary' placeholder='Masukkan Nama...' placeholderTextColor="#ACACAC"/>
                    </View>
                    <View className='flex-col gap-2 w-full mt-6'>
                      <Text className='text-black font-poppins_medium text-[1rem]'>Email</Text>
                      <TextInput value={email} onChangeText={(e) => setEmail(e)} className='border-2 pl-4 font-poppins_regular text-[12px] rounded-lg border-gray w-full focus:border-primary' placeholder='Masukkan Email...' placeholderTextColor="#ACACAC"/>
                    </View>
                    <View className='flex-col gap-2 w-full mt-6'>
                      <Text className='text-black font-poppins_medium text-[1rem]'>Kata Sandi</Text>
                      <TextInput value={password} onChangeText={(e) => setPassword(e)} className='border-2 pl-4 font-poppins_regular text-[12px] rounded-lg border-gray w-full focus:border-primary' placeholder='Masukkan Kata Sandi...' placeholderTextColor="#ACACAC"/>
                    </View>
                    <TouchableOpacity className='w-full mb-12 mt-24' onPress={handleUpdateUser}>
                      <LinearGradient
                          colors={["#1D4ED8", "#137DD3"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className="px-6 py-4 w-full flex-col gap-4"
                          style={{ borderRadius: 6 }}
                      >
                          <Text className='text-[16px] text-center font-poppins_semibold text-white'>Simpan</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
