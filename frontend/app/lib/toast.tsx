import Toast from "react-native-toast-message"

export const showSuccess = (message = '', time = 3000) => {
  Toast.show({
    type: 'success',
    text1: "Berhasil!",
    text2: message,
    position: 'bottom',
    visibilityTime: time,
  })
}

export const showError = (message = 'Terjadi kesalahan.', time = 3000) => {
  Toast.show({
    type: 'error',
    text1: "Gagal!",
    text2: message,
    position: 'bottom',
    visibilityTime: time,
  })
}

export const showInfo = (title = 'Info', message = '', time = 3000) => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: time,
  })
}