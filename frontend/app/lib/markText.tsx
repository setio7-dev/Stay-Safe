import React from 'react';
import { Text } from 'react-native';

export default function MarkedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <Text className="text-black font-poppins_medium text-[12px] text-justify">
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return (
            <Text key={index} className="font-poppins_semibold text-black">
              {boldText}
            </Text>
          );
        } else {
          return <Text key={index}>{part}</Text>;
        }
      })}
    </Text>
  );
}
