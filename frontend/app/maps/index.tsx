import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState, useRef } from 'react'
import { View, Text, Image, TouchableOpacity, Animated, ScrollView, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import * as Location from 'expo-location'
import MapView, { Marker, Circle, Polyline } from 'react-native-maps'
import { useRouter } from 'expo-router'
import user from "@/assets/images/maps/user.png"
import warning from "@/assets/images/maps/warning.png"
import API from '../lib/server'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import WarningProp from '../components/warningProp'
import { Loader } from '../lib/loader'
import toPlace from "@/assets/images/icon/toPlace.png"

const GEOAPIFY_KEY = "24f813a682d2497e89d434b817408858"

export default function Index() {
  const navigate = useRouter()
  const [location, setLocation] = useState<any>(null)
  const [address, setAddress] = useState<any>('')
  const [dangerZones, setDangerZones] = useState<any>([])
  const [inDangerZone, setInDangerZone] = useState<any>(false)
  const [loader, setLoader] = useState(true)
  const [places, setPlaces] = useState<any>([])
  const [routeCoords, setRouteCoords] = useState<any>([])
  const [destination, setDestination] = useState<any>(null)
  const height = useRef(new Animated.Value(200)).current
  const expanded = useRef(false)
  const mapRef = useRef<MapView>(null)
  const [evacuation, setEvacuation] = useState(false)

  const [selectedZone, setSelectedZone] = useState<any>(null)
  const [modalVisible, setModalVisible] = useState(false)

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
        setLoader(false)
      }
    })()
    const fetchDangerZone = async () => {
      try {
        const token = await AsyncStorage.getItem("token")
        const response = await API.get("/guest/zone", {
          headers: { Authorization: `Bearer ${token}` }
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
    if (location) {
      const fetchPlaces = async () => {
        try {
          const radius = 2000
          const categories = "catering.restaurant,catering.cafe,commercial.supermarket,commercial.shopping_mall"
          const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${location.longitude},${location.latitude},${radius}&limit=50&apiKey=${GEOAPIFY_KEY}`
          const response = await axios.get(url)
          setPlaces(response.data.features)
        } catch (error) {}
      }
      fetchPlaces()
    }
  }, [location])

  useEffect(() => {
    if (location && dangerZones.length > 0) {
      const isInside = dangerZones.some((zone: { latitude: string; longitude: string; radius: string }) => {
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
      if (!isInside) {
        setEvacuation(false)
        setRouteCoords([])
        setDestination(null)
      }
    }
  }, [location, dangerZones])

  const togglePanel = () => {
    Animated.spring(height, { toValue: expanded.current ? 200 : 590, useNativeDriver: false }).start()
    expanded.current = !expanded.current
  }

  const handleEvacuation = async () => {
    if (!location || places.length === 0 || dangerZones.length === 0) return

    const isOutsideAllZones = (lat: number, lng: number) => {
      const R = 6371e3
      for (const zone of dangerZones) {
        const zoneLat = parseFloat(zone.latitude)
        const zoneLng = parseFloat(zone.longitude)
        const zoneRadius = parseFloat(zone.radius)
        const phi1 = lat * Math.PI / 180
        const phi2 = zoneLat * Math.PI / 180
        const deltaPhi = (zoneLat - lat) * Math.PI / 180
        const deltaLambda = (zoneLng - lng) * Math.PI / 180
        const a = Math.sin(deltaPhi / 2) ** 2 +
                  Math.cos(phi1) * Math.cos(phi2) *
                  Math.sin(deltaLambda / 2) ** 2
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const d = R * c
        if (d <= zoneRadius) return false
      }
      return true
    }

    const safePlaces = places.filter((p: any) =>
      isOutsideAllZones(p.geometry.coordinates[1], p.geometry.coordinates[0])
    )

    if (safePlaces.length === 0) return

    safePlaces.sort((a: any, b: any) => {
      const d1 = Math.sqrt(
        (a.geometry.coordinates[1] - location.latitude) ** 2 +
        (a.geometry.coordinates[0] - location.longitude) ** 2
      )
      const d2 = Math.sqrt(
        (b.geometry.coordinates[1] - location.latitude) ** 2 +
        (b.geometry.coordinates[0] - location.longitude) ** 2
      )
      return d1 - d2
    })

    const nearest = safePlaces[0]
    const url = `https://api.geoapify.com/v1/routing?waypoints=${location.latitude},${location.longitude}|${nearest.geometry.coordinates[1]},${nearest.geometry.coordinates[0]}&mode=walk&apiKey=${GEOAPIFY_KEY}`
    const res = await axios.get(url)
    const steps = res.data.features[0].geometry.coordinates[0]
    const route = steps.map((c: any) => ({ latitude: c[1], longitude: c[0] }))

    setRouteCoords(route)
    setDestination({ lat: nearest.geometry.coordinates[1], lng: nearest.geometry.coordinates[0] })
    mapRef.current?.fitToCoordinates(route, {
      edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
      animated: true
    })

    setEvacuation(true)
  }

  return (
    <SafeAreaView edges={['top']} className='flex-1 bg-white'>
      {!loader ? (
        <View className='flex-1'>
          {inDangerZone && <WarningProp onEvacuate={handleEvacuation} />}
          {evacuation && (
            <View className='absolute top-32 z-20 left-1/2 -translate-x-1/2'>
              <LinearGradient
                colors={["#1D4ED8", "#137DD3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-6 py-2 h-auto flex-col justify-between items-center"
                style={{ borderRadius: 6 }}
              >
                <Text className='text-white font-poppins_medium text-[14px]'>Ikuti Jalur Ini</Text>
              </LinearGradient>
              <TouchableOpacity onPress={() => setEvacuation(false)} className='mt-4'>
                <Text className='text-white text-center font-poppins_semibold text-[14px] bg-red px-3 py-2 rounded-lg'>Selesai</Text>
              </TouchableOpacity>
            </View>
          )}
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
                <Text className='text-white font-poppins_semibold text-[16px]'>{evacuation ? 'Evakuasi' : 'Pantau Sekitar'}</Text>
                <View className='mr-6'></View>
              </View>
            </LinearGradient>
            <View className='flex-1'>
              {location && (
                <MapView
                  ref={mapRef}
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} image={user}/>
                  {dangerZones.map((zone: any, index: any) => (
                    <React.Fragment key={index}>
                      <Marker
                        coordinate={{
                          latitude: parseFloat(zone.latitude),
                          longitude: parseFloat(zone.longitude),
                        }}
                        image={warning}
                        onPress={() => {
                          setSelectedZone(zone)
                          setModalVisible(true)
                        }}
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
                  {!evacuation && places.map((place: any, idx: any) => (
                    <Marker
                      key={idx}
                      coordinate={{
                        latitude: place.geometry.coordinates[1],
                        longitude: place.geometry.coordinates[0],
                      }}
                      title={place.properties.name || 'Tempat'}
                      description={place.properties.categories?.[0]}
                    />
                  ))}
                  {evacuation && routeCoords.length > 0 && (
                    <Polyline
                      coordinates={routeCoords}
                      strokeWidth={5}
                      strokeColor="#1D4ED8"
                    />
                  )}
                  {destination && (
                    <Marker
                      coordinate={{
                        latitude: destination.lat,
                        longitude: destination.lng
                      }}
                      image={toPlace}
                    />
                  )}
                </MapView>
              )}
            </View>
            {!evacuation && (
              <Animated.View
                style={{ height: height }}
                className='bg-white rounded-t-[10px] justify-start items-center p-6 absolute bottom-0 left-0 right-0'
              >
                <TouchableOpacity onPress={togglePanel} className='w-full items-center'>
                  <View className='bg-secondary w-[60px] h-[4px] rounded-full mb-4'/>
                </TouchableOpacity>
                <Text className='text-secondary text-[18px] font-poppins_semibold'>Lokasi Kamu</Text>
                <View className='mt-6 flex-row items-center justify-center px-6 gap-4'>
                  <Image source={user} className='w-[32px] h-[32px]'/>
                  <Text className='text-justify text-[10px] text-black font-poppins_medium w-[96%]'>{address || 'Mendeteksi lokasi...'}</Text>
                </View>
                {inDangerZone && (
                  <View className='flex-row border-[2px] border-red bg-[#EBADB5] w-full p-4 rounded-lg mt-6 gap-2 items-center justify-center'>
                    <Image source={warning} className='w-[80px] h-[80px]'/>
                    <View className='flex-col justify-center items-start'>
                      <Text className='text-red font-poppins_semibold text-[16px] text-justify'>Peringatan</Text>
                      <Text className='text-red font-poppins_medium text-[10px] w-[210px] text-justify'>Anda berada di area berisiko, segera tingkatkan kewaspadaan.</Text>
                      <TouchableOpacity onPress={handleEvacuation}>
                        <Text className='text-white bg-red rounded-lg py-2 px-4 mt-2 font-poppins_semibold text-[10px] text-justify'>Cari Jalur Evakuasi</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {places.length > 0 && (
                  <View className='mt-8 w-full'>
                    <Text className='font-poppins_semibold text-secondary text-[18px] mb-2'>Tempat di sekitar:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className='flex-row items-start gap-6 mt-2'>
                        {places.map((p: any, i: any) => (
                          <TouchableOpacity
                            key={i}
                            onPress={() => {
                              mapRef.current?.animateToRegion({
                                latitude: p.geometry.coordinates[1],
                                longitude: p.geometry.coordinates[0],
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                              }, 1000)
                            }}
                            className='bg-white p-4 rounded-lg border-[2px] border-secondary w-[280px]'
                          >
                            <Text className='text-[14px] font-poppins_medium mb-1'>{p.properties.name || 'Tanpa Nama'} ({p.properties.categories?.[0]})</Text>
                            <Text className='font-poppins_regular text-[12px] text-black'>{p.properties.formatted}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
              </Animated.View>
            )}
          </View>

          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View className='flex-1 bg-black/50 justify-center items-center px-6'>
              <View className='bg-white p-6 rounded-lg w-full'>
                <Text className='text-[18px] font-poppins_semibold mb-2'>{selectedZone?.name || 'Zona Tanpa Nama'}</Text>
                <Text className='text-[14px] font-poppins_regular text-black mb-4'>{selectedZone?.desc || 'Tidak ada deskripsi.'}</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className='bg-secondary py-2 rounded-lg'
                >
                  <Text className='text-white text-center font-poppins_semibold text-[14px]'>Tutup</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      ) : (
        <View className='flex w-full flex-1 justify-center items-center'>
          <Loader/>
        </View>
      )}
    </SafeAreaView>
  )
}
