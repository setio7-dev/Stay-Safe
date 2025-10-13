import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import { View, Text, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MapView, { Marker, Circle } from 'react-native-maps'
import * as Location from 'expo-location'
import * as ImagePicker from 'expo-image-picker'
import back from "@/assets/images/icon/back.png"
import { useRouter } from 'expo-router'
import DropDownPicker from "react-native-dropdown-picker"
import upload from "@/assets/images/report/upload.png"
import DynamicImage from '../lib/dynamicImage'
import { showError, showSuccess } from '../lib/toast'
import AsyncStorage from '@react-native-async-storage/async-storage'
import mime from "mime"
import API from '../lib/server'

export default function Report() {
  type Locate = {
    address: string | undefined;
    latitude: number | undefined;
    longitude: number | undefined;
    radius: number;
  } | null;

  const navigate = useRouter()
  const [category, setCategory] = useState("")
  const [image, setImage] = useState<any>(null)
  const [desc, setDesc] = useState("")
  const [locate, setLocate] = useState<Locate>(null)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([
    { label: 'Kecelakaan', value: 'Kecelakaan' },
    { label: 'Kriminalitas', value: 'Kriminalitas' },
    { label: 'Bencana Alam', value: 'Bencana Alam' },
  ])
  const [location, setLocation] = useState<{latitude: number, longitude: number, address: string} | null>(null)
  const [mapRegion] = useState({
    latitude: -6.200000,
    longitude: 106.816666,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  })

  const selectLocation = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate
    let address = ''
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude })
      if (place) {
        address = `${place.name ?? ''} ${place.street ?? ''} ${place.city ?? ''}`.trim()
      }
    } catch {}
    setLocation({ latitude, longitude, address })
  }

  const handleReport = async() => {
    let newImageUri: any
    if (image) newImageUri =  "file:///" + image.uri?.split("file:/").join("")
    const formData = new FormData()
    if (image) {
      formData.append('image', {
        uri: newImageUri,
        type: mime.getType(newImageUri),
        name: newImageUri?.split("/").pop(),
      } as any)
    }
    formData.append("category", category)
    formData.append("message", desc)
    formData.append("location", JSON.stringify(locate))

    try {
      const token = await AsyncStorage.getItem("token")
      const response = await API.post("/guest/report", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      })
      showSuccess(response?.data?.message)
      setTimeout(() => {
        setLocate(null)
        setImage(null)
        setDesc("")
        setCategory("")
      }, 3000)
    } catch (error: any) {
      showError(error?.response?.data?.message)
    }
  }

  const pickImage = async () => {
    Alert.alert(
      "Upload Gambar",
      "Pilih sumber gambar",
      [
        { text: "Camera", onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 1,
            })
            if (!result.canceled) setImage(result.assets[0])
        }},
        { text: "Gallery", onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 1,
            })
            if (!result.canceled) setImage(result.assets[0])
        }},
        { text: "Batal", style: "cancel" }
      ]
    )
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }} className='w-full bg-white h-full'>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
        <LinearGradient
          colors={["#1D4ED8", "#137DD3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="px-6 py-8 flex-col gap-4"
          style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
        >
          <View className='flex-row justify-between items-center'>
            <TouchableOpacity onPress={() => navigate.push("/home")}>
              <Image source={back} className='w-[24px] h-[24px]'/>
            </TouchableOpacity>
            <Text className='text-white font-poppins_semibold text-[16px]'>Lapor Cepat</Text>
            <View className='mr-6'></View>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
          <View className='flex-col gap-12 items-center px-6'>
            <View className='flex-col gap-2 w-full'>
              <Text className='font-poppins_medium text-[16px] text-black'>Jenis Kejadian</Text>
              <DropDownPicker
                open={open}
                value={category}
                items={items}
                setOpen={setOpen}
                setValue={setCategory}
                setItems={setItems}
                placeholder="Pilih Jenis..."
                style={{
                  borderColor: open ? '#1D4ED8' : '#ACACAC',
                  backgroundColor: '#ffffff',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                }}
                textStyle={{
                  color: '#1D4ED8',
                  fontFamily: 'poppins_regular',
                  fontSize: 14,
                }}
                placeholderStyle={{
                  color: '#9CA3AF',
                  fontFamily: 'poppins_regular',
                }}
                dropDownContainerStyle={{
                  borderColor: '#1D4ED8',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                }}
              />
            </View>

            <TouchableOpacity onPress={pickImage} className='flex-col w-full gap-2'>
              {image ? (
                <Image source={{ uri: image.uri }} className='w-full h-60 rounded-lg'/>
              ) : (
                <DynamicImage source={upload}/>
              )}
            </TouchableOpacity>

            <View className='flex-col w-full gap-2'>
              <Text className='font-poppins_medium text-[16px] text-black'>Deskripsi Singkat</Text>
              <TextInput
                placeholder='Deskripsi...'
                multiline
                value={desc}
                onChangeText={setDesc}
                className='font-poppins_regular align-top text-[14px] text-black border-[1px] border-gray p-4 rounded-lg min-h-[120px]'
              />
            </View>

            <TouchableOpacity activeOpacity={0.8} className='flex-col w-full gap-2' onPress={() => setLocate({ address: location?.address, latitude: location?.latitude, longitude: location?.longitude, radius: 500 })}>
              <Text className='font-poppins_medium text-[16px] text-black'>Lokasi</Text>
              <View style={{ width: '100%', height: 200, borderRadius: 12, overflow: 'hidden' }} className='border-2 border-primary'>
                <MapView
                  style={{ width: '100%', height: 200 }}
                  region={mapRegion}
                  onPress={selectLocation}
                >
                  {location && (
                    <>
                      <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
                      <Circle
                        center={{ latitude: location.latitude, longitude: location.longitude }}
                        radius={500}
                        strokeColor="rgba(29, 78, 216, 0.5)"
                        fillColor="rgba(29, 78, 216, 0.2)"
                      />
                    </>
                  )}
                </MapView>
              </View>
              {location && (
                <View className='mt-2'>
                  <Text className='font-poppins_regular text-[12px] text-black'>Alamat: {location.address}</Text>
                  <Text className='font-poppins_regular text-[12px] text-black'>Latitude: {location.latitude}</Text>
                  <Text className='font-poppins_regular text-[12px] text-black'>Longitude: {location.longitude}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity className='w-full mb-12' onPress={handleReport}>
              <LinearGradient
                  colors={["#1D4ED8", "#137DD3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="px-6 py-4 w-full flex-col gap-4"
                  style={{ borderRadius: 6 }}
              >
                  <Text className='text-[16px] text-center font-poppins_semibold text-white'>Kirim</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
