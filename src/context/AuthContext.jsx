import { useState, useContext, useEffect } from "react";
import AuthService from "../services/AuthService";
import TokenService from "../services/TokenService";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { getUser } from "../utils/authUtils";
import { AuthContext } from "./AuthContextDefinition";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const resetJustLoggedIn = () => setJustLoggedIn(false);

  // ✅ ฟังก์ชัน login ใช้เวลามาจาก popup หรือหน้า Login
  const login = async (username, password) => {
    const response = await AuthService.login(username, password);

    // ถ้า backend ส่ง token กลับมา (รองรับหลายคีย์)
    const token = response.data?.accessToken || response.data?.Token || response.data?.token;
    if (!token) throw new Error("No token returned from server");

    // เก็บ token ลง cookie (ปิด secure ใน dev บน http)
    const isProd = typeof window !== "undefined" && window.location.protocol === "https:";
    Cookies.set("token", token, { expires: 7, secure: isProd, sameSite: "strict" });

    // decode token เพื่อดึง userId/username
    const decoded = jwtDecode(token);

    // รวมข้อมูลโปรไฟล์จาก response (เผื่อ JWT ไม่มี username/name)
    const respUser = response.data?.user || response.data || {};
    const mergedUser = {
      ...decoded,
      token,
      username: decoded?.username || respUser?.username || respUser?.name || undefined,
      name: decoded?.name || respUser?.name || undefined,
      email: decoded?.email || decoded?.sub || respUser?.email || undefined,
      userId: decoded?.userId || decoded?.id || respUser?.userId || respUser?.id,
      lat: decoded?.lat || decoded?.latitude || respUser?.lat || respUser?.longitude,
      lng: decoded?.lng || decoded?.longitude || respUser?.lng || respUser?.longitude,
    };

    setUser(mergedUser);
    TokenService.setUser(mergedUser);
    setJustLoggedIn(true); // Set to true after successful login

    return mergedUser;
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

  return (
    <AuthContext.Provider value={{ user, login, logout, justLoggedIn, resetJustLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
