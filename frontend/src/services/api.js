import axios from "axios";

let baseUrl = process.env.REACT_APP_API_URL;
if (baseUrl && !baseUrl.endsWith("/api")) {
  baseUrl = baseUrl.endsWith("/") ? baseUrl + "api" : baseUrl + "/api";
}

const API = axios.create({
  baseURL: baseUrl,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

console.log("API URL:", process.env.REACT_APP_API_URL);

export default API;