import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { View, ScrollView, Image, TouchableOpacity, Text, Linking, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import back from "@/assets/images/icon/back.png"
import { useRouter } from 'expo-router'
import icon from "@/assets/images/warning/iconWhite.png";
import police from "@/assets/images/warning/police.png";
import hospital from "@/assets/images/warning/hospital.png";
import DynamicImage from '../lib/dynamicImage'

const callData = [
    {
        id: 1,
        name: "Kantor Polisi Terdekat",
        category: "Polisi",
        image: police,
        desc: "Hubungi polisi terdekat untuk mendapatkan bantuan segera saat kamu merasa terancam atau mengalami situasi berbahaya.",
        phone: '110'
    },
    {
        id: 2,
        name: "Rumah Sakit Terdekat",
        category: "Rumah Sakit",
        image: hospital,
        desc: "Hubungi rumah sakit terdekat untuk mendapatkan pertolongan medis darurat dengan cepat dan aman.",
        phone: '119'
    },
];

export default function Index() {
    const navigate = useRouter();

    const handleCall = (phone: string) => {
        if (!phone) {
            Alert.alert('Error', 'Nomor telepon tidak tersedia.');
            return;
        }
        Linking.openURL(`tel:${phone}`).catch(() => {
            Alert.alert('Error', 'Tidak bisa membuka dialer.');
        });
    };

    return (
        <SafeAreaView edges={['top']} className='flex-1 bg-white'>
            <LinearGradient
                colors={["#1D4ED8", "#137DD3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-6 py-8 flex-col gap-4"
                style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
            >
                <View className='flex-row justify-between items-center'>
                    <TouchableOpacity onPress={() => navigate.push("/home")}>
                        <Image source={back} className='w-[24px] h-[24px]'/>
                    </TouchableOpacity>
                    <Text className='text-white font-poppins_semibold text-[16px]'>Darurat</Text>
                    <View className='mr-6'></View>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className='flex-1 pt-6 h-full'>
                <View className='w-full px-6'>
                    <LinearGradient
                        colors={["#1D4ED8", "#137DD3"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="px-4 py-4 h-auto w-full flex-row items-center gap-4"
                        style={{ borderRadius: 8 }}
                    >
                        <Image source={icon} className='w-[66px] h-[66px]'/>
                        <View className='flex-col'>
                            <Text className='text-white font-poppins_semibold text-[16px]'>Hubungi jadi lebih cepat</Text>
                            <Text className='text-white font-poppins_medium text-[10px] w-[51%] text-justify'>
                                Aktifkan widget darurat untuk langsung menghubungi Polisi atau Rumah Sakit
                            </Text>
                            <TouchableOpacity onPress={() => navigate.push("/warning/widget")}>
                                <Text className='bg-white rounded-lg text-primary px-4 py-1 font-poppins_semibold text-[12px] w-[70px] mt-4 text-center'>Lapor</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    <View className='flex-col items-center mt-8 gap-6'>
                        {callData.map((item, index) => (
                            <View
                                key={index}
                                className='w-full h-auto relative bg-white pb-6'
                                style={{
                                    borderRadius: 8,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.40,
                                    shadowRadius: 4.84,
                                    elevation: 5,
                                }}
                            >
                                <LinearGradient
                                    colors={["#1D4ED8", "#137DD3"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="px-4 py-3 h-auto w-fit flex-row items-center gap-4 absolute z-10"
                                    style={{ borderTopLeftRadius: 8, borderBottomRightRadius: 8 }}
                                >
                                    <Text className='text-white font-poppins_medium text-[12px]'>{item.category}</Text>
                                </LinearGradient>

                                <DynamicImage source={item.image}/>

                                <View className='mt-4 px-4 pb-6'>
                                    <Text className='text-black font-poppins_semibold text-[16px]'>{item.name}</Text>
                                    <Text className='text-black font-poppins_medium text-[10px] text-justify'>{item.desc}</Text>
                                </View>

                                <View className='px-4'>
                                    <TouchableOpacity onPress={() => handleCall(item.phone)}>
                                        <LinearGradient
                                            colors={["#1D4ED8", "#137DD3"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            className="px-4 py-3 h-auto w-[120px] flex-row items-center justify-center"
                                            style={{ borderRadius: 8 }}
                                        >
                                            <Text className='text-white text-center font-poppins_medium text-[12px]'>Panggil Cepat</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
