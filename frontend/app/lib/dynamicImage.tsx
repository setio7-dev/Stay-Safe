import React, { useEffect, useState } from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';

type DynamicImageProps = {
  source: string | ImageSourcePropType;
};

export default function DynamicImage({ source }: DynamicImageProps) {
  const [ratio, setRatio] = useState(1);
  const [uri, setUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof source === 'string') {
      setUri(source);
      Image.getSize(
        source,
        (width, height) => setRatio(width / height),
        (error) => console.log('Gagal ambil ukuran gambar:', error)
      );
    } else {
      const { width, height } = Image.resolveAssetSource(source);
      setRatio(width / height);
      setUri(undefined);
    }
  }, [source]);

  return (
    <View style={{ width: '100%', aspectRatio: ratio }}>
      <Image
        source={typeof source === 'string' ? { uri: source } : source}
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
