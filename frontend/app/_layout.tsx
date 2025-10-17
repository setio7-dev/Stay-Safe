import { Stack } from "expo-router";
import "./global.css";
import { useFontLoader } from "./context/fontLoaded";
import Toast from "react-native-toast-message"
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const fontLoaded = useFontLoader();
  if (!fontLoaded) return null
  
  return (
    <>
      <StatusBar style="light" backgroundColor="#1D4ED8" />
      <Stack screenOptions={{
        headerShown: false,
        animation: "fade"
      }}/>
      <Toast position="bottom" bottomOffset={60} /> 
    </>
  );
}
