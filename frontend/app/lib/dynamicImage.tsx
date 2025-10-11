import React, { useEffect, useState } from 'react';
import { View, Image } from 'react-native';

export default function DynamicImage({ uri }: { uri: string }) {
  const [ratio, setRatio] = useState(1);

  useEffect(() => {
    if (uri) {
      Image.getSize(
        uri,
        (width, height) => {
          setRatio(width / height);
        },
        (error) => console.log('Gagal ambil ukuran gambar:', error)
      );
    }
  }, [uri]);

  return (
    <View style={{ width: '100%', aspectRatio: ratio }}>
      <Image
        source={{ uri }}
        style={{
          width: '100%',
          height: '100%',
          resizeMode: 'cover',
          borderRadius: 10,
        }}
      />
    </View>
  );
}
