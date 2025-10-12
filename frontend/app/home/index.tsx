/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'
import { ScrollView, View, Text, Image, TouchableOpacity, Dimensions, Animated, StatusBar, RefreshControl } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import logo from "@/assets/images/home/logo.png"
import notif from "@/assets/images/home/notif.png";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from 'expo-router';
import { showError } from '../lib/toast';
import API from '../lib/server';
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import cloud from "@/assets/images/home/cloud.png";
import fitur1 from "@/assets/images/home/fitur1.png";
import fitur2 from "@/assets/images/home/fitur2.png";
import fitur3 from "@/assets/images/home/fitur3.png";
import fitur4 from "@/assets/images/home/fitur4.png";
import fitur5 from "@/assets/images/home/fitur5.png";
import fitur6 from "@/assets/images/home/fitur6.png";
import fitur7 from "@/assets/images/home/fitur7.png";
import fitur8 from "@/assets/images/home/fitur8.png";
import laporCepat from "@/assets/images/home/lapor-cepat.png";
import post1 from "@/assets/images/home/post1.png";
import CommunityProp from '../components/communityProp';
import NewsProp from '../components/newsProp';
import Authenticated from '../context/Authenticated';
import LoaderCircle from '../lib/loaderCircle';
import useRefresh from '../lib/refresh';

const width = Dimensions.get("window").width;
const fiturArray = [
  {
    id: 1,
    image: fitur1,
    name: "Pantau Sekitar",
    navigate: "/pantau"
  },
  {
    id: 2,
    image: fitur2,
    name: "Cek Fakta",
    navigate: "/fakta"
  },
  {
    id: 3,
    image: fitur3,
    name: "Asisten Pintar",
    navigate: "/asisten"
  },
  {
    id: 4,
    image: fitur4,
    name: "Meditasi",
    navigate: "/meditation/meditationBoarding"
  },
  {
    id: 5,
    image: fitur5,
    name: "Darurat",
    navigate: "/darurat"
  },
  {
    id: 6,
    image: fitur6,
    name: "Cek Mental",
    navigate: "/mental"
  },
  {
    id: 7,
    image: fitur7,
    name: "Konsultasi",
    navigate: "/consultation/consultationBoarding"
  },
  {
    id: 8,
    image: fitur8,
    name: "Webinar",
    navigate: "/event/eventBoarding"
  },
];

const postData = [
  {
    id: 1,
    image: post1,
    translate: width,
  },
  {
    id: 2,
    image: post1,
    translate: 0,
  },
  {
    id: 3,
    image: post1,
    translate: -width
  },
];

export default function Index() {
  interface userProp {
    name: string;
  }

  const [user, setUser] = useState<userProp | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const navigate = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;
  const [postBar, setPostBar] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);
  
  const fetchData = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
  };
  const { refreshing, onRefresh } = useRefresh(fetchData);

  
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
      } catch (error: any) {
        showError(error.response.data.message);
      }
    }

    const fetchMaps = async() => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Izin lokasi dibutuhkan untuk menampilkan peta.");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [placemark] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      
      setLocation(currentLocation.coords);
      setAddress(placemark);
      setLoading(false);
    }

    const scrollPost = () => {
      if (sliderWidth > 0) {
        Animated.timing(translateX, {
          toValue: -postBar * sliderWidth,
          duration: 700,
          useNativeDriver: true,
        }).start();
      }
    }

    fetchUser();
    fetchMaps();
    scrollPost();
  }, []);

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      setPostBar((prev) => (prev < 2 ? prev + 1 : 0));
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, []);  
  
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className='bg-white'>
      <StatusBar backgroundColor="#1D4ED8" />
        <Authenticated>
          <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <LinearGradient
              colors={["#1D4ED8", "#137DD3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-6 py-8 h-auto flex-col gap-4"
              style={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24, }}
            >
              <View className='flex-row gap-4 w-full justify-between items-center'>
                <Image source={logo} className='w-[160px] h-[70px]'/>
                <Image source={notif} className='w-[32px] h-[32px]'/>              
              </View>
              <View className='flex-col'>
                <Text className='font-poppins_semibold text-white text-[20px]'>HI, {user?.name.toUpperCase()}</Text>
                <Text className='font-poppins_medium text-white text-[14px]'>Bagaimana Kabarmu?</Text>
              </View>
              <View className='flex-row items-center justify-between gap-4 bg-white h-[140px] rounded-lg p-2 mr-2 mt-2'>
                {loading || !location ? (
                  <View className='w-[120px] h-full flex justify-center items-center'>
                    <LoaderCircle/>
                  </View>
                ) : (
                  <View className="w-[120px] h-full border-primary border-2 rounded-lg">
                    <MapView
                      style={{ width: "100%", height: "100%", borderRadius: 20 }}
                      initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      showsUserLocation={true}
                    >
                      <Marker
                        coordinate={{
                          latitude: location.latitude,
                          longitude: location.longitude,
                        }}
                        title="Lokasi Saya"
                        description="Posisi saat ini"
                      />
                    </MapView>
                  </View>
                )}
                <View className='flex-col'>
                  <Text className='text-gray font-poppins_medium text-[8px]'>Lokasi Kamu</Text>
                  <Text className='text-primary font-poppins_semibold text-[16px]'>{address?.district ?? "Memuat..."}</Text>
                  <Text className='text-gray font-poppins_medium text-[8px]'>Status</Text>
                  <View className='flex-row items-center gap-2'>
                    <View className='bg-red w-2 h-2 rounded-full'></View>
                    <Text className='text-red font-poppins_medium mt-[2px] text-[10px]'>Bahaya</Text>
                  </View>
                  <View className='flex-row gap-8 items-center'>
                    <TouchableOpacity onPress={() => onRefresh()}>
                      <LinearGradient
                        colors={["#1D4ED8", "#137DD3"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="px-2 py-2 w-[100px] mt-2"
                        style={{ borderRadius: 100 }}
                      >
                        <Text className='text-white w-fit text-center font-poppins_medium text-[8px]'>Segarkan Lokasimu</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <View className='flex-col justify-center items-center -mt-2'>
                      <Image source={cloud} className='w-10 h-10'/>
                      <Text className='text-primary font-poppins_medium text-[10px]'>35°C</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
            <View className="flex-row flex-wrap justify-between px-4 mt-8">
              {fiturArray.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigate.push(item.navigate as any)}
                  className="w-1/4 mb-6 flex items-center"
                >
                  <Image source={item.image} className="w-[50px] h-[50px]" />
                  <Text className="font-poppins_medium text-black text-[10px] text-center mt-2">
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className='w-full px-6 mt-6'>
              <LinearGradient
                colors={["#1D4ED8", "#137DD3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-4 py-4 h-auto w-full flex-row items-center gap-2"
                style={{ borderRadius: 8 }}
              >
                <Image source={laporCepat} className='w-[70px] h-[80px]'/>
                <View className='flex-col'>
                  <Text className='text-white font-poppins_semibold text-[16px]'>Lapor Cepat Sekitarmu</Text>
                  <Text className='text-white font-poppins_medium text-[10px] w-[56%] text-justify'>Lapor kejadian darurat dengan cepat, cukup dengan sekali klik foto.</Text>
                  <TouchableOpacity onPress={() => navigate.push("/report/reportBoarding")}>
                    <Text className='bg-white rounded-lg text-primary px-4 py-1 font-poppins_semibold text-[12px] w-[70px] mt-4 text-center'>Lapor</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
            <View
              onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
              className="mt-10"
            >
              <Animated.View
                className="flex-row items-center justify-start"
                style={{ transform: [{ translateX }] }}
              >
                {postData.map((item) => (
                  <View key={item.id} className='px-6' style={{ width: sliderWidth }}>
                    <Image
                      source={item.image}
                      style={{ width: '100%', height: 200, borderRadius: 12 }}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </Animated.View>
            </View>
            <View className='pl-6 mt-6'>
              <Text className='font-poppins_semibold text-[20px] text-black mt-4'>Komunitas Anda</Text>
              <CommunityProp/>
            </View>
            <View className='pl-6 mt-6 pb-12'>
              <Text className='font-poppins_semibold text-[20px] text-black mt-4'>Berita Terkini</Text>
              <NewsProp/>
            </View>
          </ScrollView>
        </Authenticated>
    </SafeAreaView>
  )
}
