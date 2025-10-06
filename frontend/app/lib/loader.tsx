import { View, Text } from "react-native"
import * as Progress from "react-native-progress"

export function Loader() {
    return (
        <View className="bg-white absolute z-20 w-full h-full flex justify-center items-center gap-10">
            <Progress.Circle 
                size={80}             
                indeterminate={true}  
                color="#1D4ED8"
                thickness={6}         
                borderWidth={4}
                showsText={false} 
            />
            <Text className="font-poppins_medium text-primary text-[16px]">Tunggu Sebentar</Text>
        </View>
    )
}