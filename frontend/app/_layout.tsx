import { Stack, Redirect } from "expo-router";
import "./global.css";
import { useFontLoader } from "./context/fontLoaded";
import Toast from "react-native-toast-message"

export default function RootLayout() {
  const fontLoaded = useFontLoader();
  if (!fontLoaded) return null
  
  return (
    <>
      {/* <Redirect href="/home"/> */}
      <Stack screenOptions={{
        headerShown: false,
        animation: "fade"
      }}/>
      <Toast position="bottom" bottomOffset={60} /> 
    </>
  );
}
