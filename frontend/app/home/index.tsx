import React, { useEffect, useState } from 'react'
import { ScrollView, View, Text, Image } from 'react-native'
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
import * as Progress from "react-native-progress"

export default function Index() {
  interface userProp {
    name: string;
  }

  const [user, setUser] = useState<userProp | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const navigate = useRouter();
  
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
        accuracy: Location.Accuracy.High,
      });

      const [placemark] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      
      setLocation(currentLocation.coords);
      setAddress(placemark);
      setLoading(false);
    }

    fetchUser();
    fetchMaps();
  }, []);
  return (
    <SafeAreaView>
        <ScrollView>
          <LinearGradient
            colors={["#1D4ED8", "#137DD3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 py-8 h-[52vh] flex-col gap-4"
            style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12, }}
          >
            <View className='flex-row gap-4 w-full justify-between items-center'>
              <Image source={logo} className='w-[160px] h-[70px]'/>
              <Image source={notif} className='w-[32px] h-[32px]'/>              
            </View>
            <View className='flex-col'>
              <Text className='font-poppins_semibold text-white text-[20px]'>HI, {user?.name.toUpperCase()}</Text>
              <Text className='font-poppins_medium text-white text-[14px]'>Bagaimana Kabarmu?</Text>
            </View>
            <View className='flex-row items-center gap-4 bg-white h-[150px] rounded-lg p-2 mt-2'>
              {loading || !location ? (
                <View className='w-[120px] h-full flex justify-center items-center'>
                  <Progress.Circle 
                      size={40}
                      indeterminate={true}  
                      color="#1D4ED8"
                      thickness={4}
                      borderWidth={4}
                      showsText={false} 
                  />
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
                <Text className='text-gray font-poppins_medium text-[10px]'>Lokasi Kamu</Text>
                <Text className='text-primary font-poppins_semibold text-[18px]'>{address?.district ?? "Loading..."}</Text>
                <Text className='text-gray font-poppins_medium text-[10px]'>Status</Text>
                <View className='flex-row items-center gap-2'>
                  <View className='bg-red w-2 h-2 rounded-full'></View>
                  <Text className='text-red font-poppins_medium mt-[2px] text-[10px]'>Bahaya</Text>
                </View>
                <View className='flex-row gap-8 items-center'>
                  <LinearGradient
                    colors={["#1D4ED8", "#137DD3"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="px-2 py-2 w-[100px]"
                    style={{ borderRadius: 100 }}
                  >
                    <Text className='text-white w-fit text-center font-poppins_medium text-[8px]'>Segarkan Lokasimu</Text>
                  </LinearGradient>
                  <View className='flex-col justify-center items-center'>
                    <Image source={cloud} className='w-10 h-10'/>
                    <Text className='text-primary font-poppins_medium text-[12px]'>35°C</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
           {/* {loading || !location ? (
              <View className="flex-1 items-center justify-center h-[300px]">
                <Text className="text-gray-500 text-[16px]">Mengambil lokasi...</Text>
              </View>
            ) : (
              <View className="w-full h-[400px] mt-4 px-4">
                <MapView
                  style={{ width: "100%", height: "100%", borderRadius: 12 }}
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
            )} */}
        </ScrollView>
    </SafeAreaView>
  )
}
