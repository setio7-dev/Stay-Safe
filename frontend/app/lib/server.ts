import axios from "axios"

const API = axios.create({
    baseURL: "http://10.0.2.2:8000/api",
    // baseURL: "http://10.203.1.103:8000/api",
    // baseURL: "http://10.119.120.41:8000/api",
    // baseURL: "http://192.168.100.27:8000/api",
    headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default API;

export const StorageAPI = "http://10.0.2.2:8000/storage";
// export const StorageAPI = "http://10.119.120.41:8000/storage";
// export const StorageAPI = "http://192.168.100.27:8000/storage";