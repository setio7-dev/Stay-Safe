import { Stack } from "expo-router";
import "../global.css";

export default function ChatbotLayout() {
  return <Stack screenOptions={{
    headerShown: false,
    animation: "fade"
  }}/>;
}