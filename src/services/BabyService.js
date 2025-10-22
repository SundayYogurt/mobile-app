import api from "./api";
import TokenService from "./TokenService";

const API_URL = import.meta.env.VITE_BABY_API;

// ---- helpers ----
const getUserId = () => {
  const u = TokenService.getUser?.() || {};
  return u.userId ?? u.id ?? u.sub;
};

// ---- babies ----
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

// ---- feeding ----
// ใช้เส้นเดียวกัน: POST /{babyId}/recordBabyFeeding
const createBabyFeedingLog = async (babyId, payload = {}) => {
  if (!babyId) throw new Error("missing babyId");
  const userId = payload.userId ?? getUserId();

  const dmRaw =
    payload.durationMinutes ??
    payload.minutes ??
    payload.duration ??
    payload.value ??
    0;
  const durationMinutes = Number(dmRaw);
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    throw new Error("invalid durationMinutes");
  }

  // ✅ รวมค่าทั้งหมดไว้ใน body
  const body = {
    durationMinutes,
    userId,
    logDate: payload.logDate ?? new Date().toISOString(), // ✅ ใส่ logDate เสมอ
  };

  // ถ้ามี createdAt ก็ยังเก็บไว้ได้
  if (payload.createdAt) body.createdAt = payload.createdAt;

  console.log("🍼 ส่งไป backend:", body); // ✅ debug ดูได้ใน console

  return api.post(`${API_URL}/${babyId}/recordBabyFeeding`, body, { withCredentials: false });
};


// alias เพื่อให้หน้า Save ที่เรียก recordBabyFeeding ทำงานได้เลย
const recordBabyFeeding = async (babyId, payload = {}) => {
  return createBabyFeedingLog(babyId, payload);
};

const updateBabyFeedingLog = async (babyId, logId, payload = {}) => {
  if (!babyId || !logId) throw new Error("missing babyId or logId");
  const userId = payload.userId ?? getUserId();

  const dmRaw =
    payload.durationMinutes ??
    payload.minutes ??
    payload.duration ??
    payload.value ??
    0;
  const durationMinutes = Number(dmRaw);
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    throw new Error("invalid durationMinutes");
  }

  const body = { durationMinutes, userId };
  return api.put(`${API_URL}/${babyId}/feeding/${logId}`, body, { withCredentials: false });
};

const deleteBabyFeedingLog = async (babyId, logId, payload = {}) => {
  if (!babyId || !logId) throw new Error("missing babyId or logId");
  const userId = payload.userId ?? getUserId();
  const cfg = { withCredentials: false };
  if (userId) cfg.data = { userId };
  return api.delete(`${API_URL}/${babyId}/feeding/${logId}`, cfg);
};

// GET /showBabyFeedingLogs/{id}
const showBabyFeedingLogs = async (babyId) => {
  if (!babyId) throw new Error("missing babyId");
  return api.get(`${API_URL}/showBabyFeedingLogs/${babyId}`, { withCredentials: false });
};
// alias (บางหน้ามีการเรียกแบบไม่มี s)
const showBabyFeedingLog = showBabyFeedingLogs;

// ---- weight ----
const showBabyWeightLogs = async (babyId) => {
  if (!babyId) throw new Error("missing babyId");
  return api.get(`${API_URL}/showBabyWeightLogs/${babyId}`, { withCredentials: false });
};

const recordBabyWeight = async (babyId, payload = {}) => {
  if (!babyId) throw new Error("missing babyId");
  const userId = payload.userId ?? getUserId();

  const w =
    Number(payload.currentWeight ?? payload.weight ?? payload.value ?? payload.grams) || 0;
  if (!w) throw new Error("invalid currentWeight");

  const body = { currentWeight: w, userId, babyId };
  return api.post(`${API_URL}/${babyId}/recordBabyWeight`, body, { withCredentials: false });
};

const updateBabyWeightLog = async (babyId, logId, payload = {}) => {
  if (!babyId || !logId) throw new Error("missing babyId or logId");
  const userId = payload.userId ?? getUserId();

  const w =
    Number(payload.currentWeight ?? payload.weight ?? payload.value ?? payload.grams) || 0;
  if (!w) throw new Error("invalid currentWeight");

  const body = { currentWeight: w, userId, babyId };
  return api.put(`${API_URL}/${babyId}/weight/${logId}`, body, { withCredentials: false });
};

// ---- poop ----
const recordBabyPoop = async (babyId, payload = {}) => {
  if (!babyId) throw new Error("missing babyId");
  const userId = payload.userId ?? getUserId();

  const c =
    Number(
      payload.totalPoop ??
        payload.count ??
        payload.times ??
        payload.value ??
        payload.poopCount ??
        payload.poops
    ) || 0;
  if (!c) throw new Error("invalid poop count");

  const body = { totalPoop: c, userId };
  return api.post(`${API_URL}/${babyId}/recordBabyPoop`, body, { withCredentials: false });
};

const updateBabyPoopLog = async (babyId, logId, payload = {}) => {
  if (!babyId || !logId) throw new Error("missing babyId or logId");
  const userId = payload.userId ?? getUserId();

  const c =
    Number(
      payload.totalPoop ??
        payload.count ??
        payload.times ??
        payload.value ??
        payload.poopCount ??
        payload.poops
    ) || 0;
  if (!c) throw new Error("invalid poop count");

  const body = { totalPoop: c, userId };
  return api.put(`${API_URL}/${babyId}/poop/${logId}`, body, { withCredentials: false });
};

const showBabyPoopLogs = async (babyId) => {
  if (!babyId) throw new Error("missing babyId");
  return api.get(`${API_URL}/showBabyPoopLogs/${babyId}`, { withCredentials: false });
};

// ---- pee ----
const showBabyPeeLogs = async (babyId) => {
  if (!babyId) throw new Error("missing babyId");
  return api.get(`${API_URL}/showBabyPeeingLogs/${babyId}`, { withCredentials: false });
};

const recordBabyPeeing = async (babyId, payload = {}) => {
  if (!babyId) throw new Error("missing babyId");
  const userId = payload.userId ?? getUserId();

  const c =
    Number(
      payload.totalPee ??
        payload.count ??
        payload.times ??
        payload.value ??
        payload.peeCount ??
        payload.pees
    ) || 0;
  if (!c) throw new Error("invalid pee count");

  const body = { 
    totalPee: c, 
    userId, 
    logDate: payload.logDate ?? new Date().toISOString(), // ✅ ใส่เวลาที่ส่งมาจาก frontend
  };

  console.log("💧 ส่งข้อมูลปัสสาวะ:", body);
  return api.post(`${API_URL}/${babyId}/recordBabyPeeing`, body, { withCredentials: false });
};


const updateBabyPeeLog = async (babyId, logId, payload = {}) => {
  if (!babyId || !logId) throw new Error("missing babyId or logId");
  const userId = payload.userId ?? getUserId();

  const c =
    Number(
      payload.totalPee ??
        payload.count ??
        payload.times ??
        payload.value ??
        payload.peeCount ??
        payload.pees
    ) || 0;
  if (!c) throw new Error("invalid pee count");

  const body = { totalPee: c, userId };
  return api.put(`${API_URL}/${babyId}/pee/${logId}`, body, { withCredentials: false });
};

// ---- export ----
const BabyService = {
  addBaby,
  getAllByUserId,

  // feeding
  createBabyFeedingLog,
  recordBabyFeeding,      // alias → ใช้ API เส้นเดียวกัน
  updateBabyFeedingLog,
  deleteBabyFeedingLog,
  showBabyFeedingLogs,
  showBabyFeedingLog,     // alias

  // weight
  showBabyWeightLogs,
  recordBabyWeight,
  updateBabyWeightLog,

  // poop
  recordBabyPoop,
  updateBabyPoopLog,
  showBabyPoopLogs,

  // pee
  recordBabyPeeing,
  updateBabyPeeLog,
  showBabyPeeLogs,
};

export default BabyService;
