import api from "./api";
import TokenService from "./TokenService";

const API_URL = import.meta.env.VITE_AUTH_API;

const register = async (usernameOrPayload, name, password, confirmPassword) => {
  const payload =
    typeof usernameOrPayload === "object" && usernameOrPayload !== null
      ? usernameOrPayload
      : { username: usernameOrPayload, name, password, confirmPassword };

  if (password !== confirmPassword) {
    throw new Error("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
  }

  const response = await api.post(`${API_URL}/register`, payload, { withCredentials: false });
  return response.data;
};


const login = async (username, password) => {
  const response = await api.post(
    `${API_URL}/login`,
    { username, password },
    { withCredentials: false }
  );

  // ✅ รองรับหลายรูปแบบคีย์ token จาก backend
  const data = response.data || {};
  const token = data.Token || data.token || data.Token;
  const tokenType = data.tokenType || data.type || "Bearer";
  const userId = data.userId || data.id || data.user?.id;

  if (!token) {
    throw new Error("ไม่พบ Token จาก backend");
  }

  // ✅ แนบคีย์ Token แบบ normalize ให้ชั้นบนใช้ได้เสมอ
  response.data.Token = token;
  response.data.tokenType = tokenType;
  if (userId !== undefined) response.data.userId = userId;

  // ✅ เก็บ token ลง TokenService (cookie 'user') เพื่อใช้งานอื่น ๆ ได้ด้วย
  TokenService.setUser({ Token: token, tokenType, userId });

  return response;
};

const logout = () => {
  TokenService.removeUser();
};

const AuthService = { register, login, logout };
export default AuthService;
