import axios from "axios";
import TokenService from "./TokenService";
import Cookies from "js-cookie"; // ✅ ต้อง import

const baseURL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ✅ Request Interceptor (แนบ token เฉพาะ API ที่จำเป็น)
api.interceptors.request.use(
  (config) => {
    // ❌ ห้ามแนบ token กับ login หรือ register
    const excluded = ["/auth/login", "/auth/register"];
    const isExcluded = excluded.some((url) => config.url?.includes(url));

    if (!isExcluded) {
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("✅ Attached token:", token);
      }
    } else {
      console.log("🚫 Skip token for:", config.url);
      delete config.headers.Authorization; // ✅ ตัด header ทิ้งกันพลาด
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;