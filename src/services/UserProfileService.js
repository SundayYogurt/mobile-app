import api from "./api";
const API_URL = import.meta.env.VITE_PROFILE_API;
import TokenService from "./TokenService";

const getUserId = () => {
  const u = TokenService.getUser?.() || {};
  return u.userId ?? u.id ?? u.sub;
};

const showUserProfile = async (userId) => {
  const id = userId ?? getUserId();
  if (!id) throw new Error("ไม่พบ userId ");
  return api.get(`${API_URL}/showUserProfileOverview/${id}`, { withCredentials: false });
};

const editUserProfile = async (userId, profile) => {
  const id = userId ?? getUserId();
  if (!id) throw new Error("ไม่พบ userId ");
  return api.put(`${API_URL}/updateUserProfileOverview/${id}`, profile , { withCredentials: false });
};

const UserProfileService = {
    showUserProfile,
    editUserProfile
}

export default UserProfileService