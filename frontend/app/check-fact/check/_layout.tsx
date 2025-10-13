import { Tabs } from "expo-router";
import "../../global.css";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function HomeLayout() {
  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: "fade",
          tabBarActiveTintColor: "#1D4ED8",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 0.5,
            borderTopColor: "#E5E7EB",
            paddingTop: 10,
            height: 90
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
            fontFamily: "poppins_medium"
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Cek Fakta",
            tabBarIcon: ({ color }) => (
              <Ionicons name="search-circle" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="pusatFact"
          options={{
            title: "Pusat Fakta",
            tabBarIcon: ({ color }) => (
              <Ionicons name="library" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="result/index"
          options={{
            href: null, 
            tabBarStyle: { display: "none" },
          }}
        />

        <Tabs.Screen
          name="result/detail"
          options={{
            href: null, 
            tabBarStyle: { display: "none" },
          }}
        />
      </Tabs>
    </View>
  );
}
