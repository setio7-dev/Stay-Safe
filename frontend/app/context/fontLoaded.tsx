
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export function useFontLoader() {
  const [loaded] = useFonts({
    poppins_regular: require("../../assets/font/Poppins-Regular.ttf"),
    poppins_medium: require("../../assets/font/Poppins-Medium.ttf"),
    poppins_semibold: require("../../assets/font/Poppins-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return loaded;
}
