import React from 'react'
import { ScrollView, View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import logo from "@/assets/images/logo/logo-text.png"
import notif from "@/assets/images/home/notif.png";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <SafeAreaView>
        <ScrollView>
          <LinearGradient
            colors={["#1D4ED8", "#137DD3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-10 py-3 h-[46vh]"
            style={{ borderBottomLeftRadius: 8, borderBottomRightRadius: 8, }}
          >
            <Text className='font-poppins_medium text-white text-[16px]'>Masuk</Text>
          </LinearGradient>
        </ScrollView>
    </SafeAreaView>
  )
}
