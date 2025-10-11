import { Stack } from "expo-router";
import "../global.css";

export default function NewsLayout() {
  return <Stack screenOptions={{
    headerShown: false,
    animation: "fade"
  }}/>;
}