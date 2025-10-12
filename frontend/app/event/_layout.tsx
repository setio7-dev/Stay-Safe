import { Stack } from "expo-router";
import "../global.css";

export default function EventLayout() {
  return <Stack screenOptions={{
    headerShown: false,
    animation: "fade"
  }}/>;
}