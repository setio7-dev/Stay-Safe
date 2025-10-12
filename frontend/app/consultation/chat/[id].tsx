import React from 'react'
import { View, Text, Image, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ConsultationChat() {
  interface userProp {
    id: number;
    name: string;
    email: string;
    image: string;
  }
  
  interface doctorProp {
    id: number;
    category: string;
    hospital: string;
    user_id: number;
    user: userProp
  }

  
  return (
    <SafeAreaView>
      
    </SafeAreaView>
  )
}
