import React, { useState, useEffect, useRef } from 'react'
import { Animated, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import top from "@/assets/images/onboarding/top.png"
import bottom from "@/assets/images/onboarding/bottom.png"
import image1 from "@/assets/images/onboarding/image1.png"
import image2 from "@/assets/images/onboarding/image2.png"
import image3 from "@/assets/images/onboarding/image3.png"
import nextBtn from "@/assets/images/onboarding/nextBtn.png"
import { useRouter } from 'expo-router'

const width = Dimensions.get("window").width;
const onBoardingData = [
  {
    id: 1,
    image: image1,
    title: "Tetap Aman, Tenang, dan Terlindungi",
    desc: " Stay Safe hadir untuk membantumu memantau sekitar, cek fakta, hingga menjaga ketenangan pikiran. Keamananmu adalah prioritas kami—kapan pun, di mana pun.",
    translate: width + (width / 4.5),
  },
  {
    id: 2,
    image: image2,
    title: "Ahli & Teknologi dalam Genggamanmu",
    desc: "Konsultasi dengan para profesional terpercaya, didukung AI pintar yang siap memberikan solusi cepat dan akurat untuk kebutuhanmu.",
    translate: 0
  },
  {
    id: 3,
    image: image3,
    title: "Mulaikan Perjalanan Amanmu",
    desc: "Kini saatnya melangkah lebih tenang. Dengan Stay Safe, perlindungan dan ketenangan selalu ada di genggamanmu.",
    translate: -width - (width / 4.5)
  },
];

export default function Index() {
  const [slideBar, setSlideBar] = useState(0);
  const navigate = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;
  
  const handleSlide = () => {
    if (slideBar < 2) {
      setSlideBar(slideBar + 1);
    } else {
      navigate.push("/home");
    }
  }

  useEffect(() => {
    const slideBarAnimated = () => {
      Animated.timing(translateX, {
        toValue: onBoardingData[slideBar].translate,
        duration: 700,
        useNativeDriver: true
      }).start();
    }

    slideBarAnimated();
  });
  return (
    <View className='flex flex-col items-center justify-center w-full h-full'>
      <Image source={top} className='w-[46%] h-[180px] absolute left-0 top-0'/>
      <Text onPress={() => navigate.push("/home")} className='text-[18px] text-gray font-poppins_medium ml-auto mr-8 mb-4'>Lewati</Text>
      <Animated.View className='flex-row gap-[80px]' style={{ transform: [{ translateX }]  }}>
        {onBoardingData.map((item) => (
          <View key={item.id} className='flex-col justify-center items-center gap-2 w-[360px]'>
            <Image source={item.image} className='w-[200px] h-[200px]'/>
            <Text className='font-poppins_semibold text-[#176AB4] text-[20px] px-10 text-center'>{item.title}</Text>
            <Text className='font-poppins_medium text-black text-[12px] px-10 text-center'>{item.desc}</Text>
          </View>
        ))}
      </Animated.View>
      <View className='flex-row justify-center gap-16 items-center flex w-full mt-8'>
        <Image source={nextBtn} className='w-[40px] h-[40px] opacity-0'/>
        <View className='flex-row justify-center items-center gap-2'>
          <View className={`${slideBar === 0 ? 'w-4 h-4 bg-primary' : 'w-2 h-2 bg-secondary'} rounded-full`}></View>
          <View className={`${slideBar === 1 ? 'w-4 h-4 bg-primary' : 'w-2 h-2 bg-secondary'} rounded-full`}></View>
          <View className={`${slideBar === 2 ? 'w-4 h-4 bg-primary' : 'w-2 h-2 bg-secondary'} rounded-full`}></View>
        </View>
        <TouchableOpacity onPress={handleSlide}>
          <Image source={nextBtn} className='w-[40px] h-[40px] '/>
        </TouchableOpacity>
      </View>
      <Image source={bottom} className='w-[46%] h-[180px] absolute right-0 bottom-0'/>
    </View>
  )
}
