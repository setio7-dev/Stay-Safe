import "./global.css"
import { Text, View } from "react-native";
import { useState, useEffect } from "react";
import axios from 'axios';

export default function Index() {
  const [data, setData] = useState<dataProp[]>([]);

  interface dataProp {
    id: number;
    desc: string;
    name: string;
    created_at: string;
    updated_at: string;
  }

  useEffect(() => {
    const getData = async() => {
    try {
        const response = await axios.get('https://imam-admin.setionugraha.my.id/api/photos');
        setData(response.data.data);
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    }

    getData();
  }, []);
  return (
    <View className="flex justify-center h-screen flex-col items-center">
      <Text className="">Edit app/index.tsx to edit this screen.</Text>
      {data.map((item) => (
        <View className="" key={item.id}>
          <Text>{item.name}</Text>
          <Text>{item.desc}</Text>
          <Text>{item.created_at}</Text>
          <Text>{item.updated_at}</Text>
        </View>
      ))}
    </View>
  );
}
