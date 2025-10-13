import { Stack } from "expo-router";
import "../global.css";

export default function WarningLayout() {
  return <Stack screenOptions={{
    headerShown: false,
    animation: "fade"
  }}/>;
}