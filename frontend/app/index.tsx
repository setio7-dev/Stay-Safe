import "./global.css"
import { View, Image } from "react-native";
import logo from "@/assets/images/logo/logo.png";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "./lib/server";

export default function Index() {
  const navigate = useRouter();

  useEffect(() => {
    const showOnBoarding = async() => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const token = await AsyncStorage.getItem("token");
      const response = await API.get("/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.data.id) {
        navigate.push('/home');
      } else {
        navigate.push("/auth/login");
      }
    }

    showOnBoarding();
  });

  return (
    <View className="bg-primary w-full h-full flex justify-center items-center">
      <Image source={logo} className="w-[200px] h-[200px]"/>
    </View>
  );
}
