import { Stack } from "expo-router";
import "../global.css";

export default function MapsLayout() {
  return <Stack screenOptions={{
    headerShown: false,
    animation: "fade"
  }}/>;
}