import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export function getUser() {
  const token = Cookies.get("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return { ...decoded, token };
  } catch {
    Cookies.remove("token");
    return null;
  }
}
