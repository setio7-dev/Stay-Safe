import { Stack } from "expo-router";
import "../global.css";

export default function ReportLayout() {
  return <Stack screenOptions={{
    headerShown: false,
    animation: "fade"
  }}/>;
}