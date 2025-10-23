import api from "./api";
import TokenService from "./TokenService";

const API_URL = import.meta.env.VITE_BABY_API;

/** ดึง userId จาก TokenService */
const getUserId = () => {
  const u = TokenService.getUser?.() || {};
  return u.userId ?? u.id ?? u.sub;
};

/* ---------------------------------------------------
 🍼 Baby Management
--------------------------------------------------- */
const addBaby = async (baby) => {
  const userId = baby.userId ?? getUserId();
  const payload = {
    name: baby.name,
    birthday: baby.birthday || baby.dob,
    birthWeight: baby.birthWeight ?? baby.weight,
    userId,
  };
  return api.post(`${API_URL}/registerBaby`, payload, { withCredentials: false });
};

const getAllByUserId = async (userId) => {
  const id = userId ?? getUserId();
  if (!id) throw new Error("ไม่พบ userId สำหรับดึงรายชื่อลูกน้อย");
  return api.get(`${API_URL}/showAllBabyByUserId/${id}`, { withCredentials: false });
};

/* ---------------------------------------------------
 🍽️ Feeding
--------------------------------------------------- */
const createBabyFeedingLog = async (babyId, payload = {}) => {
  if (!babyId) throw new Error("missing babyId");
  const userId = payload.userId ?? getUserId();

  const durationMinutes =
    Number(payload.durationMinutes ?? payload.minutes ?? payload.duration ?? payload.value ?? 0) || 0;
  if (durationMinutes <= 0) throw new Error("invalid durationMinutes");

  const body = {
    durationMinutes,
    userId,
    logDate: payload.logDate ?? new Date().toISOString(),
  };

  console.log("🍼 ส่งไป backend:", body);
  return api.post(`${API_URL}/${babyId}/recordBabyFeeding`, body, { withCredentials: false });
};

const recordBabyFeeding = createBabyFeedingLog;

const updateBabyFeedingLog = async (babyId, logId, payload = {}) => {
  if (!babyId || !logId) throw new Error("missing babyId or logId");
  const userId = payload.userId ?? getUserId();
  const durationMinutes =
    Number(payload.durationMinutes ?? payload.minutes ?? payload.duration ?? payload.value ?? 0) || 0;
  if (durationMinutes <= 0) throw new Error("invalid durationMinutes");

  const body = { durationMinutes, userId };
  return api.put(`${API_URL}/${babyId}/feeding/${logId}`, body, { withCredentials: false });
};

const deleteBabyFeedingLog = async (babyId, logId) => {
  if (!babyId || !logId) throw new Error("missing babyId or logId");
  const userId = getUserId();
  const cfg = { withCredentials: false };
  if (userId) cfg.data = { userId };
  return api.delete(`${API_URL}/${babyId}/feeding/${logId}`, cfg);
};

const showBabyFeedingLogs = async (babyId) => {
  if (!babyId) throw new Error("missing babyId");
  return api.get(`${API_URL}/showBabyFeedingLogs/${babyId}`, { withCredentials: false });
};

/* ---------------------------------------------------
 ⚖️ Weight
--------------------------------------------------- */
const showBabyWeightLogs = async (babyId) => {
  if (!babyId) throw new Error("missing babyId");
  return api.get(`${API_URL}/showBabyWeightLogs/${babyId}`, { withCredentials: false });
};

const recordBabyWeight = async (babyId, payload = {}) => {
  if (!babyId) throw new Error("missing babyId");
  const userId = payload.userId ?? getUserId();

  const w = Number(payload.currentWeight ?? payload.weight ?? payload.value ?? payload.grams) || 0;
  if (w <= 0) throw new Error("invalid currentWeight");

  const body = {
    currentWeight: w,
    userId,
    babyId,
    daysAt: payload.daysAt ?? 1,
    logDate: payload.logDate ?? new Date().toISOString(),
  };

  console.log("⚖️ ส่งข้อมูลน้ำหนัก:", body);
  return api.post(`${API_URL}/${babyId}/recordBabyWeight`, body, { withCredentials: false });
};

const updateBabyWeightLog = async (babyId, logId, payload = {}) => {
  if (!babyId || !logId) throw new Error("missing babyId or logId");
  const userId = payload.userId ?? getUserId();

  const w = Number(payload.currentWeight ?? payload.weight ?? payload.value ?? payload.grams) || 0;
  if (w <= 0) throw new Error("invalid currentWeight");

  const body = {
    currentWeight: w,
    userId,
    babyId,
    daysAt: payload.daysAt ?? 1,
    logDate: payload.logDate ?? new Date().toISOString(),
  };

  console.log("✏️ อัปเดตน้ำหนัก:", body);
  return api.put(`${API_URL}/${babyId}/weight/${logId}`, body, { withCredentials: false });
};

/* ---------------------------------------------------
 💩 Poop
--------------------------------------------------- */
const showBabyPoopLogs = async (babyId) => {
  if (!babyId) throw new Error("missing babyId");
  return api.get(`${API_URL}/showBabyPoopLogs/${babyId}`, { withCredentials: false });
};

const recordBabyPoop = async (babyId, payload = {}) => {
  if (!babyId) throw new Error("missing babyId");
  const userId = payload.userId ?? getUserId();

  const c =
    Number(payload.totalPoop ?? payload.count ?? payload.times ?? payload.value ?? payload.poopCount ?? payload.poops) ||
    0;
  if (c <= 0) throw new Error("invalid poop count");

  const body = {
    totalPoop: c,
    userId,
    daysAt: payload.daysAt ?? 1,
    logDate: payload.logDate ?? new Date().toISOString(),
  };

  console.log("💩 ส่งข้อมูลอุจจาระ:", body);
  return api.post(`${API_URL}/${babyId}/recordBabyPoop`, body, { withCredentials: false });
};

const updateBabyPoopLog = async (babyId, logId, payload = {}) => {
  if (!babyId || !logId) throw new Error("missing babyId or logId");
  const userId = payload.userId ?? getUserId();

  const c =
    Number(payload.totalPoop ?? payload.count ?? payload.times ?? payload.value ?? payload.poopCount ?? payload.poops) ||
    0;
  if (c <= 0) throw new Error("invalid poop count");

  const body = {
    totalPoop: c,
    userId,
    daysAt: payload.daysAt ?? 1,
    logDate: payload.logDate ?? new Date().toISOString(),
  };

  console.log("✏️ อัปเดตอุจจาระ:", body);
  return api.put(`${API_URL}/${babyId}/poop/${logId}`, body, { withCredentials: false });
};

/* ---------------------------------------------------
 💧 Pee
--------------------------------------------------- */
const showBabyPeeLogs = async (babyId) => {
  if (!babyId) throw new Error("missing babyId");
  return api.get(`${API_URL}/showBabyPeeingLogs/${babyId}`, { withCredentials: false });
};

const recordBabyPeeing = async (babyId, payload = {}) => {
  if (!babyId) throw new Error("missing babyId");
  const userId = payload.userId ?? getUserId();

  const c =
    Number(payload.totalPee ?? payload.count ?? payload.times ?? payload.value ?? payload.peeCount ?? payload.pees) ||
    0;
  if (c <= 0) throw new Error("invalid pee count");

  const body = {
    totalPee: c,
    userId,
    daysAt: payload.daysAt ?? 1,
    logDate: payload.logDate ?? new Date().toISOString(),
  };

  console.log("💧 ส่งข้อมูลปัสสาวะ:", body);
  return api.post(`${API_URL}/${babyId}/recordBabyPeeing`, body, { withCredentials: false });
};

const updateBabyPeeLog = async (babyId, logId, payload = {}) => {
  if (!babyId || !logId) throw new Error("missing babyId or logId");
  const userId = payload.userId ?? getUserId();

  const c =
    Number(payload.totalPee ?? payload.count ?? payload.times ?? payload.value ?? payload.peeCount ?? payload.pees) ||
    0;
  if (c <= 0) throw new Error("invalid pee count");

  const body = {
    totalPee: c,
    userId,
    daysAt: payload.daysAt ?? 1,
    logDate: payload.logDate ?? new Date().toISOString(),
  };

  console.log("✏️ อัปเดตปัสสาวะ:", body);
  return api.put(`${API_URL}/${babyId}/pee/${logId}`, body, { withCredentials: false });
};

/* ---------------------------------------------------
 🧩 Export
--------------------------------------------------- */
const BabyService = {
  // baby
  addBaby,
  getAllByUserId,

  // feeding
  createBabyFeedingLog,
  recordBabyFeeding,
  updateBabyFeedingLog,
  deleteBabyFeedingLog,
  showBabyFeedingLogs,

  // weight
  showBabyWeightLogs,
  recordBabyWeight,
  updateBabyWeightLog,

  // poop
  showBabyPoopLogs,
  recordBabyPoop,
  updateBabyPoopLog,

  // pee
  showBabyPeeLogs,
  recordBabyPeeing,
  updateBabyPeeLog,
};

export default BabyService;
