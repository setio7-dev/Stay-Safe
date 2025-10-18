import axios from "axios"

const API = axios.create({
    // baseURL: "http://10.0.2.2:8000/api",
    baseURL: "https://staysafe-backend.setionugraha.my.id/api",
    // baseURL: "http://192.168.100.27:8000/api",
});

export default API;

// export const StorageAPI = "http://10.0.2.2:8000/storage";
export const StorageAPI = "https://staysafe-backend.setionugraha.my.id/storage";
// export const StorageAPI = "http://192.168.100.27:8000/storage";

// export const moodDetectionAPI = "http://10.203.15.38:6100/predict";
// export const moodDetectionAPI = "http://10.0.2.2:6100/predict";
// export const moodDetectionAPI = "http://192.168.100.27:6100/predict";
export const moodDetectionAPI = "https://rayzen7-mood-detection.hf.space/predict";

// export const factDetectionAPI = "http://10.0.2.2:6200/api/predict";
// export const factDetectionAPI = "http://192.168.100.27:6200/api/predict";
export const factDetectionAPI = "https://rayzen7-fact-detection.hf.space/api/predict";