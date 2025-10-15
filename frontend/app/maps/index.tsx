import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import * as Location from 'expo-location'
import MapView, { Marker, Circle } from 'react-native-maps'
import { useRouter } from 'expo-router'
import user from "@/assets/images/maps/user.png"
import warning from "@/assets/images/maps/warning.png"
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler'
import API from '../lib/server'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function Index() {
  const navigate = useRouter()
  const [location, setLocation] = useState<any>(null)
  const [address, setAddress] = useState('')
  const [dangerZones, setDangerZones] = useState<any>([])
  const [inDangerZone, setInDangerZone] = useState(false)
  const translateY = new Animated.Value(0)
  const height = new Animated.Value(200)

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return
      const loc = await Location.getCurrentPositionAsync({})
      setLocation(loc.coords)
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      })
      if (geocode.length > 0) {
        const item = geocode[0]
        setAddress(`${item.street || ''} ${item.name || ''}, RT.${item.subregion || ''}/RW.${item.region || ''}, ${item.district || ''}, ${item.city || ''}, ${item.region || ''} ${item.postalCode || ''}`)
      }
    })()

    const fetchDangerZone = async () => {
      try {
        const token = await AsyncStorage.getItem("token")
        const response = await API.get("/guest/zone", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setDangerZones(response.data.data)
      } catch (error) {}
    }

    fetchDangerZone()
    const interval = setInterval(() => {
      fetchDangerZone()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (location && dangerZones.length > 0) {
      const isInside = dangerZones.some((zone: any) => {
        const R = 6371e3
        const phi1 = location.latitude * Math.PI / 180
        const phi2 = parseFloat(zone.latitude) * Math.PI / 180
        const deltaPhi = (parseFloat(zone.latitude) - location.latitude) * Math.PI / 180
        const deltaLambda = (parseFloat(zone.longitude) - location.longitude) * Math.PI / 180
        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                  Math.cos(phi1) * Math.cos(phi2) *
                  Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const d = R * c
        return d <= parseFloat(zone.radius)
      })
      setInDangerZone(isInside)
    }
  }, [location, dangerZones])

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: false }
  )

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const newHeight = event.nativeEvent.translationY < -50 ? 400 : 200
      Animated.spring(height, {
        toValue: newHeight,
        useNativeDriver: false,
      }).start()
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: false,
      }).start()
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} className='flex-1 bg-white'>
        <View className='flex-1'>
          <LinearGradient
            colors={["#1D4ED8", "#137DD3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 py-8 relative h-auto flex-col gap-4"
            style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
          >
            <View className='flex-row justify-between items-center'>
              <TouchableOpacity onPress={() => navigate.push('/home')}>
                <Image source={back} className='w-[24px] h-[24px]'/>
              </TouchableOpacity>
              <Text className='text-white font-poppins_semibold text-[16px]'>Pantau Sekitar</Text>
              <View className='mr-6'></View>
            </View>
          </LinearGradient>
          <View className='flex-1'>
            {location && (
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="Lokasi Kamu"
                  image={user}
                />
                {dangerZones.map((zone: any, index: any) => (
                  <React.Fragment key={index}>
                    <Marker
                      coordinate={{
                        latitude: parseFloat(zone.latitude),
                        longitude: parseFloat(zone.longitude),
                      }}
                      title={zone.name}
                      image={warning}
                    />
                    <Circle
                      center={{
                        latitude: parseFloat(zone.latitude),
                        longitude: parseFloat(zone.longitude),
                      }}
                      radius={parseFloat(zone.radius)}
                      strokeWidth={2}
                      strokeColor="rgba(255,0,0,0.8)"
                      fillColor="rgba(255,0,0,0.2)"
                    />
                  </React.Fragment>
                ))}
              </MapView>
            )}
          </View>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={{
                transform: [{ translateY }],
                height: height,
              }}
              className='bg-white rounded-t-[10px] flex-col justify-start items-center p-6 absolute bottom-0 left-0 right-0'
            >
              <View className='bg-secondary w-[60px] h-[4px] rounded-full'></View>
              <Text className='text-secondary text-[18px] mt-6 font-poppins_semibold'>Lokasi Kamu</Text>
              <View className='mt-8 flex-row items-center justify-center px-6 gap-4'>
                <Image source={user} className='w-[32px] h-[32px]'/>
                <Text className='text-justify text-[10px] text-black font-poppins_medium w-[96%]'>
                  {address || 'Mendeteksi lokasi...'}
                </Text>
              </View>
              {inDangerZone && (
                <View className='flex-row border-[2px] border-red bg-[#EBADB5] w-full p-4 rounded-lg mt-6 gap-2 items-center justify-center'>
                  <Image source={warning} className='w-[80px] h-[80px]'/>
                  <View className='flex-col justify-center items-start'>
                    <Text className='text-red font-poppins_semibold text-[16px] text-justify'>Peringatan</Text>
                    <Text className='text-red font-poppins_medium text-[10px] w-[210px] text-justify'>Anda berada di area berisiko, segera tingkatkan kewaspadaan.</Text>
                    <Text className='text-white bg-red rounded-lg py-2 px-4 mt-2 font-poppins_semibold text-[10px] text-justify'>Cari Jalur Evakuasi</Text>
                  </View>
                </View>
              )}
            </Animated.View>
          </PanGestureHandler>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}
