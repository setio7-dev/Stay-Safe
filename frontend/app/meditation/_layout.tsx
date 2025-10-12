import { Stack } from "expo-router";
import "../global.css";

export default function MeditationLayout() {
  return <Stack screenOptions={{
    headerShown: false,
    animation: "fade"
  }}/>;
}