import axios from "axios"

const API = axios.create({
    // baseURL: "http://10.0.2.2:8000/api",
    baseURL: "http://10.203.1.103:8000/api",
    headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default API;