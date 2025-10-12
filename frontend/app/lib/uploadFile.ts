import * as ImagePicker from 'expo-image-picker'
import { showError } from './toast'

export interface PickedImage {
  uri: string
  type?: string
  fileName?: string
}

export const handleUploadImage = async (): Promise<PickedImage | null> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      showError("Izin akses foto ditolak")
      return null
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    })

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0]
      return {
        uri: asset.uri,
        type: asset.type ?? 'image',
        fileName: asset.fileName ?? 'photo.jpg'
      }
    }

    return null
  } catch (error: any) {
    showError("Gagal memilih gambar", error)
    console.error(error)
    return null
  }
}
