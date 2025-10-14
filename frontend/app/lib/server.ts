import axios from "axios"

const API = axios.create({
    // baseURL: "http://10.0.2.2:8000/api",
    baseURL: "http://10.203.15.189:8000/api",
    // baseURL: "http://192.168.100.27:8000/api",
});

export default API;

// export const StorageAPI = "http://10.0.2.2:8000/storage";
export const StorageAPI = "http://10.203.15.189:8000/storage";
// export const StorageAPI = "http://192.168.100.27:8000/storage";

// export const moodDetectionAPI = "http://10.203.15.38:6100/predict";
// export const moodDetectionAPI = "http://10.0.2.2:6100/predict";
// export const moodDetectionAPI = "http://192.168.100.27:6100/predict";
export const moodDetectionAPI = "http://10.203.15.189:6100/predict";

// export const factDetectionAPI = "http://10.0.2.2:6200/api/predict";
// export const factDetectionAPI = "http://192.168.100.27:6200/api/predict";
export const factDetectionAPI = "http://10.203.15.189:6200/api/predict";