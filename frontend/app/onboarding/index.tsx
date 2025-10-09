/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react'
import { Animated, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import top from "@/assets/images/onboarding/top.png"
import bottom from "@/assets/images/onboarding/bottom.png"
import image1 from "@/assets/images/onboarding/image1.png"
import image2 from "@/assets/images/onboarding/image2.png"
import image3 from "@/assets/images/onboarding/image3.png"
import nextBtn from "@/assets/images/onboarding/nextBtn.png"
import { useRouter } from 'expo-router'

const { width } = Dimensions.get("window")

const onBoardingData = [
  { id: 1, image: image1, title: "Tetap Aman, Tenang, dan Terlindungi", desc: "Stay Safe hadir untuk membantumu memantau sekitar, cek fakta, hingga menjaga ketenangan pikiran. Keamananmu adalah prioritas kami—kapan pun, di mana pun." },
  { id: 2, image: image2, title: "Ahli & Teknologi dalam Genggamanmu", desc: "Konsultasi dengan para profesional terpercaya, didukung AI pintar yang siap memberikan solusi cepat dan akurat untuk kebutuhanmu." },
  { id: 3, image: image3, title: "Mulaikan Perjalanan Amanmu", desc: "Kini saatnya melangkah lebih tenang. Dengan Stay Safe, perlindungan dan ketenangan selalu ada di genggamanmu." },
]

export default function Index() {
  const [slideBar, setSlideBar] = useState(0)
  const navigate = useRouter()
  const translateX = useRef(new Animated.Value(0)).current
  const animating = useRef(false)

  const handleSlide = () => {
    if (animating.current) return
    animating.current = true
    if (slideBar < onBoardingData.length - 1) {
      setSlideBar(prev => prev + 1)
    } else {
      navigate.push("/home")
    }
  }

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: -slideBar * width,
      duration: 600,
      useNativeDriver: true
    }).start(() => {
      animating.current = false
    })
  }, [slideBar])

  return (
    <View className='flex flex-col items-start justify-center w-full h-full bg-white'>
      <Image source={top} className='w-[46%] h-[180px] absolute left-0 top-0'/>
      <Text onPress={() => navigate.push("/home")} className='text-[18px] text-gray font-poppins_medium ml-auto mr-8 mb-4'>Lewati</Text>
      <Animated.View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          transform: [{ translateX }],
          width: width * onBoardingData.length,
        }}
      >
        {onBoardingData.map((item) => (
          <View key={item.id} style={{ width }} className='flex-col justify-center items-center gap-2 px-6'>
            <Image source={item.image} className='w-[200px] h-[200px]' resizeMode='contain'/>
            <Text className='font-poppins_semibold text-[#176AB4] text-[20px] text-center'>{item.title}</Text>
            <Text className='font-poppins_medium text-black text-[12px] text-center'>{item.desc}</Text>
          </View>
        ))}
      </Animated.View>
      <View className='flex-row justify-center gap-16 items-center w-full mt-8'>
        <Image source={nextBtn} className='w-[40px] h-[40px] opacity-0'/>
        <View className='flex-row justify-center items-center gap-2'>
          {onBoardingData.map((_, i) => (
            <View
              key={i}
              className={`${slideBar === i ? 'w-4 h-4 bg-primary' : 'w-2 h-2 bg-secondary'} rounded-full`}
            />
          ))}
        </View>
        <TouchableOpacity onPress={handleSlide}>
          <Image source={nextBtn} className='w-[40px] h-[40px]'/>
        </TouchableOpacity>
      </View>
      <Image source={bottom} className='w-[46%] h-[180px] absolute right-0 bottom-0'/>
    </View>
  )
}
