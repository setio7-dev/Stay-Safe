import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Image, Text } from 'react-native';
import API, { StorageAPI } from '../lib/server';
import { songDuration } from '../lib/audioTime';
import play from "@/assets/images/meditation/play.png"

export default function MusicProp() {
  interface musicProp {
    id: number;
    title: string;
    author: string;
    image: string;
    song: string;
  }

  const navigate = useRouter();
  const [music, setMusic] = useState<musicProp[]>([]);
  const [durations, setDurations] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await API.get('/guest/music', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const musicRes = response.data.data;
        setMusic(musicRes);

        musicRes.forEach(async (item: musicProp) => {
          try {
            const uri = `${StorageAPI}/${item.song}`;
            const duration = await songDuration(uri);
            setDurations((prev: any) => ({ ...prev, [item.id]: duration }));
          } catch (error) {
            console.log('Gagal ambil durasi lagu', error);
          }
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchMusic();
  }, []);

  return (
    <View className='flex-col items-center justify-center gap-6'>
      {music.map((item, index) => (
        <View
          key={index}
          className='w-full p-2 bg-white flex-row justify-between items-center gap-4'
          style={{
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 4.84,
            elevation: 5,
          }}>
          <View className='flex-row items-center justify-start gap-4'>
            <Image
              source={{ uri: `${StorageAPI}/${item.image}` }}
              className='w-[70px] h-[70px] rounded-lg'
            />
            <View className='flex-col'>
              <Text className='text-[14px] font-poppins_semibold text-black'>{item.title}</Text>
              <Text className='text-[12px] font-poppins_regular text-gray'>{item.author}</Text>
              <Text className='text-[12px] font-poppins_regular text-gray'>
                {durations[item.id] ?? '00:00'}
              </Text>
            </View>
          </View>
          <Image source={play} className='w-[24px] h-[24px] mr-6'/>
        </View>
      ))}
    </View>
  );
}
