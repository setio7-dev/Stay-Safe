import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { View, Text, Image, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function NewsDetail() {
  return (
    <SafeAreaView>
      <ScrollView>
        <LinearGradient
            colors={["#1D4ED8", "#137DD3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 py-8 relative h-[26vh] flex-col gap-4"
            style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12, }}
        >

        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  )
}
