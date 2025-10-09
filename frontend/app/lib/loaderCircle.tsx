import React from 'react';
import * as Progress from 'react-native-progress';

interface LoaderCircleProps {
  keyValue?: string | number | null;
  size?: number;
  color?: string;
  thickness?: number;
}

export default function LoaderCircle({
  keyValue = null,
  size = 40,
  color = '#1D4ED8',
  thickness = 4,
}: LoaderCircleProps) {
  return (
    <Progress.Circle
      key={keyValue ?? undefined}
      size={size}
      indeterminate={true}
      color={color}
      thickness={thickness}
      borderWidth={thickness}
      showsText={false}
    />
  );
}
