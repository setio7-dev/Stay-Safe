import { Stack } from "expo-router";
import "../global.css";

export default function OnBoardingLayout() {
  return <Stack screenOptions={{
    headerShown: false,
    animation: "fade"
  }}/>;
}