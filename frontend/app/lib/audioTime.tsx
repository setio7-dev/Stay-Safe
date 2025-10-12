import { Audio } from 'expo-av';

export const songDuration = async (fileUri: string) => {
  const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
  const status = await sound.getStatusAsync();

  if (status.isLoaded && status.durationMillis !== undefined) {
    const durationSec = status.durationMillis / 1000;
    const minutes = Math.floor(durationSec / 60);
    const seconds = Math.floor(durationSec % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  } else {
    throw new Error('Gagal memuat audio atau durasi tidak tersedia');
  }
};
