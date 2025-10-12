import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react'
import { View } from 'react-native'
import API from '../lib/server';
import { useRouter } from 'expo-router';

export default function Authenticated({ children }: any) {
  const navigate = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          navigate.replace('/auth/login');
          return;
        }

        const response = await API.get("/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response?.data?.data) {
          await AsyncStorage.removeItem("token");
          navigate.replace('/auth/login');
        }
      } catch (error: any) {
        await AsyncStorage.removeItem("token");
        navigate.replace('/auth/login');
        console.error(error);
      }
    };

    fetchToken();
  }, []);

  return (
    <View>
      {children}
    </View>
  );
}
