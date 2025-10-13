import { Loader } from '@/app/lib/loader';
import API, { StorageAPI } from '@/app/lib/server';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import back from "@/assets/images/icon/back.png";
import playWhite from "@/assets/images/meditation/play-white.png";
import pauseWhite from "@/assets/images/meditation/resume.png";
import MusicProp from '@/app/components/musicProp';
import { Audio } from 'expo-av';
import { songDuration } from '@/app/lib/audioTime';

export default function MusicDetail() {
  interface musicProp {
    id: number;
    title: string;
    author: string;
    image: string;
    song: string;
  }

  const screenHeight = Dimensions.get('window').height;
  const [isLoader, setIsLoader] = useState(true);
  const [music, setMusic] = useState<musicProp | null>(null);
  const { id } = useLocalSearchParams();
  const navigate = useRouter();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("00:00");
  const [durationMillis, setDurationMillis] = useState(0);
  const [current, setCurrent] = useState("00:00");
  const [progress, setProgress] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
    }
  }, [isPlaying]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await API.get(`/guest/music/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMusic(response.data.data);
        const dur = await songDuration(`${StorageAPI}/${response.data.data.song}`);
        setDuration(dur);
      } finally {
        setIsLoader(false);
      }
    };
    fetchMusic();
  }, [id]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.stopAsync().catch(() => {});
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  const togglePlay = async () => {
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: `${StorageAPI}/${music?.song}` });
      setSound(newSound);
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) setDurationMillis(status.durationMillis || 0);
      await newSound.playAsync();
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.durationMillis) {
          const cur = Math.floor(status.positionMillis / 1000);
          const min = Math.floor(cur / 60);
          const sec = cur % 60;
          setCurrent(`${min}:${sec < 10 ? '0' + sec : sec}`);
          setProgress(status.positionMillis / status.durationMillis);
          if (status.didJustFinish) setIsPlaying(false);
        }
      });
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = async (e: any) => {
    if (!sound || !durationMillis || barWidth === 0) return;
    const { locationX } = e.nativeEvent;
    const percent = Math.min(Math.max(locationX / barWidth, 0), 1);
    const newPosition = durationMillis * percent;
    await sound.setPositionAsync(newPosition);
    setProgress(percent);
  };

  const handleBack = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    navigate.push('/meditation');
  };

  return (
    <SafeAreaView edges={['top']} className='flex-1 bg-white'>
      {!isLoader ? (
        <View className='flex-1'>
          <LinearGradient
            colors={["#1D4ED8", "#137DD3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 py-8 flex-col gap-4"
          >
            <View className='flex-row justify-between items-center'>
              <TouchableOpacity onPress={handleBack}>
                <Image source={back} className='w-[24px] h-[24px]'/>
              </TouchableOpacity>
              <Text className='text-white font-poppins_semibold text-[16px]'>Meditasi</Text>
              <View className='mr-6'></View>
            </View>

            <View className='flex-col items-center justify-center mt-8 pb-4'>
              <Animated.View style={{ transform: [{ rotate: rotation }] }} className='relative w-[160px] h-[160px]'>
                <View className='w-6 h-6 rounded-full bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10'></View>
                <Animated.Image source={{ uri: `${StorageAPI}/${music?.image}` }} className='w-[160px] h-[160px] border-2 border-white rounded-full'/>
              </Animated.View>
              <View className='mt-8'>
                <Text className='text-white text-center font-poppins_semibold text-[24px]'>{music?.title}</Text>
                <Text className='text-white text-center font-poppins_regular text-[14px] mt-2'>{music?.author}</Text>
              </View>

              <View className='flex-col w-full mt-4'>
                <View className='flex-row items-center justify-between'>
                  <Text className='text-white text-center font-poppins_regular text-[12px] mt-2'>{current}</Text>
                  <Text className='text-white text-center font-poppins_regular text-[12px] mt-2'>{duration}</Text>
                </View>
                <Pressable
                  onPress={handleSeek}
                  onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
                  className='w-full h-[6px] mt-2 rounded-full bg-white overflow-hidden'
                >
                  <View style={{ width: `${progress * 100}%` }} className='h-[6px] bg-primary'></View>
                </Pressable>
              </View>

              <TouchableOpacity onPress={togglePlay}>
                <Image source={isPlaying ? pauseWhite : playWhite} className='w-[40px] h-[40px] mt-8'/>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={{ height: screenHeight * 0.6 }} className='rounded-t-2xl -mt-6 bg-white flex-1 flex-col items-center p-6'>
            <View className='w-[60px] rounded-lg bg-primary h-[2px]'></View>
            <Text className='font-poppins_semibold text-primary text-[20px] mt-4'>Daftar Musik</Text>
            <ScrollView
              className='pt-4 w-full'
              contentContainerStyle={{ paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
            >
              <MusicProp onNavigate={async () => {
                  if (sound) {
                    await sound.stopAsync();
                    await sound.unloadAsync();
                    setSound(null);
                    setIsPlaying(false);
                  }
                }} />
            </ScrollView>
          </View>
        </View>
      ) : (
        <View className='flex-col h-full w-full justify-center items-center'>
          <Loader/>
        </View>
      )}
    </SafeAreaView>
  );
}
