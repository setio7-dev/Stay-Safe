import { Tabs } from "expo-router";
import "../global.css";
import { Ionicons } from "@expo/vector-icons";

export default function HomeLayout() {
  return (
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
          height: 110
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
          title: "Beranda",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="news"
        options={{
          title: "Berita",
          tabBarIcon: ({ color }) => (
            <Ionicons name="newspaper" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: "Komunitas",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
