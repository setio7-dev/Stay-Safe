import { Stack } from "expo-router";
import "../../global.css";

export default function FactCheckLayout() {
  return <Stack screenOptions={{
    headerShown: false,
    animation: "fade"
  }}/>;
}