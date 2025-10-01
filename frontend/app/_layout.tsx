import { Stack } from "expo-router";
import "./global.css";
import { useFontLoader } from "./context/fontLoaded";

export default function RootLayout() {
  const fontLoaded = useFontLoader();
  if (!fontLoaded) return null;

  return <Stack screenOptions={{
    headerShown: false,
    animation: "fade"
  }}/>;
}
