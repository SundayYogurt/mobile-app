import { useState, useContext, createContext, useEffect } from "react";
import AuthService from "../services/AuthService";
import TokenService from "../services/TokenService";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser);

  // ✅ ฟังก์ชัน login ใช้เวลามาจาก popup หรือหน้า Login
  const login = async (username, password) => {
    try {
      const response = await AuthService.login(username, password);

      // ถ้า backend ส่ง token กลับมา (รองรับหลายคีย์)
      const token = response.data?.accessToken || response.data?.Token || response.data?.token;
      if (!token) throw new Error("No token returned from server");

      // เก็บ token ลง cookie (ปิด secure ใน dev บน http)
      const isProd = typeof window !== "undefined" && window.location.protocol === "https:";
      Cookies.set("token", token, { expires: 7, secure: isProd, sameSite: "strict" });

      // decode token เพื่อดึง userId/username
      const decoded = jwtDecode(token);
      console.log("🔑 Decoded token:", decoded);

      // รวมข้อมูลโปรไฟล์จาก response (เผื่อ JWT ไม่มี username/name)
      const respUser = response.data?.user || response.data || {};
      const mergedUser = {
        ...decoded,
        token,
        username: decoded?.username || respUser?.username || respUser?.name || undefined,
        name: decoded?.name || respUser?.name || undefined,
        email: decoded?.email || decoded?.sub || respUser?.email || undefined,
        userId: decoded?.userId || decoded?.id || respUser?.userId || respUser?.id,
        lat: decoded?.lat || decoded?.latitude || respUser?.lat || respUser?.latitude,
        lng: decoded?.lng || decoded?.longitude || respUser?.lng || respUser?.longitude,
      };

      setUser(mergedUser);
      TokenService.setUser(mergedUser);

      return mergedUser;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // ✅ ออกจากระบบ
  const logout = () => {
    AuthService.logout();
    Cookies.remove("token");
    setUser(null);
  };

  // ✅ โหลด user ตอนเปิดหน้าเว็บ (กรณีเคย login แล้ว)
  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) setUser(currentUser);
  }, []);

  // ✅ sync user ไป TokenService
  useEffect(() => {
    TokenService.setUser(user);
  }, [user]);

  // ✅ ฟังก์ชันดึง user จาก cookie แล้ว decode
  function getUser() {
    const token = Cookies.get("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return { ...decoded, token };
    } catch (error) {
      console.error("Invalid token:", error);
      Cookies.remove("token");
      return null;
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
