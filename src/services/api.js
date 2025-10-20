import axios from "axios";
import TokenService from "./TokenService";
import Cookies from "js-cookie"; // ✅ ต้อง import

const baseURL = import.meta.env.VITE_BASE_URL || "";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 15000,
});

// ✅ Request Interceptor (แนบ token เฉพาะ API ที่จำเป็น)
api.interceptors.request.use(
  (config) => {
    // ❌ ห้ามแนบ token กับบาง endpoint ที่ไม่รับ Authorization หรือมี CORS เข้มงวด
    const babyBase = import.meta.env.VITE_BABY_API || "/api/v1/baby";
    const metricsBase = import.meta.env.VITE_METRICS_API_BASE || "/api/v1/metrics";
    const excluded = [
      "/auth/login",
      "/auth/register",
      `${babyBase}/registerBaby`,
      `${babyBase}/showAllBabyByUserId`,
      "/baby/registerBaby",
      "/baby/showAllBabyByUserId",
      
      "/recordBabyWeight",
      "/recordBabyPoop",
      "/recordBabyPeeing",
      "/showBabyWeightLogs",
      "/showBabyWeightLog",
      "/weightLogs",
      "/showBabyPoopLogs",
      "/showBabyPoopLog",
      "/poopLogs",
      "/showBabyFeedingLog",
      metricsBase,
      `${metricsBase}/heartbeat`,
    ];
    const isExcluded = excluded.some((url) => config.url?.includes(url));

    if (!isExcluded) {
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("✅ Attached token:", token);
      }
    } else {
  
      delete config.headers.Authorization; // ✅ ตัด header ทิ้งกันพลาด
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
 
// Response interceptor with transient error retry and better logging
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const cfg = error?.config || {};
    const status = error?.response?.status;
    const url = cfg?.url || "<unknown>";
    const method = (cfg?.method || "GET").toUpperCase();
    const code = error?.code; // e.g. ECONNABORTED for timeout

    // Console logging to aid debugging in browser devtools
    console.error("API error:", {
      method,
      url,
      status,
      code,
      message: error?.message,
    });

    // Retry only for network/transient cases: no response, 502/503/504, timeouts
    const transient = !error.response || [502, 503, 504].includes(status) || code === "ECONNABORTED";
    const maxRetries = 2;
    cfg.__retryCount = cfg.__retryCount || 0;

    if (transient && cfg.__retryCount < maxRetries) {
      cfg.__retryCount += 1;
      const backoffMs = Math.min(2000, 300 * cfg.__retryCount);
      await new Promise((r) => setTimeout(r, backoffMs));
      return api(cfg);
    }

    return Promise.reject(error);
  }
);
