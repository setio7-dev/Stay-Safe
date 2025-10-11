import { Stack } from "expo-router";
import "../global.css";

export default function CommunityLayout() {
  return <Stack screenOptions={{
    headerShown: false,
    animation: "fade"
  }}/>;
}