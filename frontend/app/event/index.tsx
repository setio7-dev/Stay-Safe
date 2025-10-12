import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png";
import ticket from "@/assets/images/event/ticket.png";
import { useRouter } from 'expo-router';

export default function Index() {
  const navigate = useRouter();
  return (
    <SafeAreaView edges={["top"]} className='bg-white w-full h-full'>
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={["#1D4ED8", "#137DD3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="px-6 py-8 relative h-auto flex-col gap-4"
          style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12, }}
        >
          <View className='flex-row justify-between items-center'>
            <TouchableOpacity onPress={() => navigate.back()}>
              <Image source={back} className='w-[24px] h-[24px]'/>
            </TouchableOpacity>
            <Text className='text-white font-poppins_semibold text-[16px]'>Webinar</Text>
            <TouchableOpacity>
              <Image source={ticket} className='w-[24px] h-[20px]'/>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <ScrollView>
            
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
