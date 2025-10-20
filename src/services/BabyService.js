import api from "./api"; // <— axios instance มี interceptor token, header ฯลฯ
import TokenService from "./TokenService";

const API_URL = import.meta.env.VITE_BABY_API; // e.g. /api/v1/baby

// NOTE: VITE_ADDBABY_API ควรเป็น full path ของ endpoint เช่น
// /api/v1/baby/registerBaby ดังนั้นไม่ต้องเติม path ซ้ำ
// รองรับ input จาก UI ที่อาจใช้ key แตกต่างกัน และเติม userId อัตโนมัติจาก TokenService
const addBaby = async (baby) => {
  const user = TokenService.getUser?.() || {};
  const inferredUserId = user.userId ?? user.id ?? user.sub ?? undefined;

  const payload = {
    name: baby.name,
    birthday: baby.birthday || baby.dob,
    birthWeight: baby.birthWeight ?? baby.weight,
    userId: baby.userId ?? inferredUserId,
  };

  return api.post(`${API_URL}/registerBaby`, payload, { withCredentials: false });
};

const recordBabyFeeding = async (babyId, payload) => {
  // payload: { durationMinutes, userId }
  if (!babyId) throw new Error("ต้องระบุ babyId");
  return api.post(`${API_URL}/${babyId}/recordBabyFeeding`, payload, { withCredentials: false });
};

// บันทึกน้ำหนักทารก
const recordBabyWeight = async (babyId, payload) => {
  // payload expects: { currentWeight, userId }
  if (!babyId) throw new Error("ต้องระบุ babyId");
  const body = {
    currentWeight:
      payload?.currentWeight ?? payload?.weight ?? payload?.value ?? payload?.grams,
    userId: payload?.userId,
    babyId,
  };
  return api.post(`${API_URL}/${babyId}/recordBabyWeight`, body, { withCredentials: false });
};

// บันทึกอุจจาระทารก
const recordBabyPoop = async (babyId, payload) => {
  // payload: ตามที่ backend กำหนด เช่น { count, userId } หรือรายละเอียดอื่น
  if (!babyId) throw new Error("ต้องระบุ babyId");
  return api.post(`${API_URL}/${babyId}/recordBabyPoop`, payload, { withCredentials: false });
};

// ดึง log น้ำหนักทั้งหมดของทารก
const showBabyWeightLogs = async (babyId) => {
  if (!babyId) throw new Error("ต้องระบุ babyId");
  const candidates = [
    `${API_URL}/${babyId}/showBabyWeightLogs`,
    `${API_URL}/${babyId}/showBabyWeightLog`,
    `${API_URL}/showBabyWeightLogs/${babyId}`,
    `${API_URL}/showBabyWeightLog/${babyId}`,
    `${API_URL}/${babyId}/weightLogs`,
    `${API_URL}/weightLogs/${babyId}`,
  ];
  let lastErr;
  for (const url of candidates) {
    try {
      const res = await api.get(url, { withCredentials: false });
      return res;
    } catch (e) {
      lastErr = e;
      const status = e?.response?.status;
      if (status && status !== 404) throw e;
      // try next on 404
    }
  }
  throw lastErr || new Error("ไม่พบ endpoint สำหรับ showBabyWeightLogs");
};

// ดึง log การให้นมทั้งหมดของทารก
const showBabyFeedingLog = async (babyId) => {
  if (!babyId) throw new Error("ต้องระบุ babyId");
  return api.get(`${API_URL}/${babyId}/showBabyFeedingLog`, { withCredentials: false });
};

// ดึง log อุจจาระทั้งหมดของทารก
const showBabyPoopLogs = async (babyId) => {
  if (!babyId) throw new Error("ต้องระบุ babyId");
  const candidates = [
    `${API_URL}/showBabyPoopLogs/${babyId}`,
    `${API_URL}/${babyId}/poopLogs`,
    `${API_URL}/${babyId}/showBabyPoopLogs`,
    `${API_URL}/poopLogs/${babyId}`,
    `${API_URL}/${babyId}/showBabyPoopLog`,
    `${API_URL}/showBabyPoopLog/${babyId}`,
  ];
  let lastErr;
  for (const url of candidates) {
    try {
      const res = await api.get(url, { withCredentials: false });
      return res;
    } catch (e) {
      lastErr = e;
      const status = e?.response?.status;
      if (status && status !== 404) throw e;
    }
  }
  throw lastErr || new Error("ไม่พบ endpoint สำหรับ showBabyPoopLogs");
};

// Show all baby peeing logs using confirmed endpoint: /baby/showBabyPeeingLogs/{id}
const showBabyPeeLogs = async (babyId) => {
  if (!babyId) throw new Error("missing babyId");
  return api.get(`${API_URL}/showBabyPeeingLogs/${babyId}`, { withCredentials: false });
};

const getAllByUserId = async (userId) => {
  const id = userId ?? TokenService.getUser?.()?.userId ?? TokenService.getUser?.()?.id ?? TokenService.getUser?.()?.sub;
  if (!id) throw new Error("ไม่พบ userId สำหรับดึงรายชื่อลูกน้อย");
  return api.get(`${API_URL}/showAllBabyByUserId/${id}`, { withCredentials: false });
};

const BabyService = {
    addBaby,
    getAllByUserId,
    recordBabyFeeding: recordBabyFeedingNormalized,
    updateBabyFeedingLog,
    deleteBabyFeedingLog,
    recordBabyWeight,
    updateBabyWeightLog,
    recordBabyPoop: recordBabyPoopNormalized,
    updateBabyPoopLog,
    recordBabyPeeing: recordBabyPeeingNormalized,
    updateBabyPeeLog,
    getBabyPeeLog,
    deleteBabyPeeLog,
    showBabyWeightLogs: showBabyWeightLogsSingle,
    showBabyFeedingLog: showBabyFeedingLogsSingle,
    showBabyFeedingLogs: showBabyFeedingLogsSingle,
    showBabyPoopLogs: showBabyPoopLogsSingle,
    showBabyPeeLogs,
}



export default BabyService

// Single endpoint implementations to avoid unused routes
async function showBabyWeightLogsSingle(babyId) {
  if (!babyId) throw new Error('missing babyId');
  return api.get(`${API_URL}/showBabyWeightLogs/${babyId}`, { withCredentials: false });
}

async function showBabyPoopLogsSingle(babyId) {
  if (!babyId) throw new Error('missing babyId');
  return api.get(`${API_URL}/showBabyPoopLogs/${babyId}`, { withCredentials: false });
}

async function showBabyFeedingLogsSingle(babyId) {
  if (!babyId) throw new Error('missing babyId');
  return api.get(`${API_URL}/showBabyFeedingLogs/${babyId}`, { withCredentials: false });
}
// Update baby feeding log: PUT /baby/{id}/feeding/{logId} with { durationMinutes, userId }
async function updateBabyFeedingLog(babyId, logId, payload = {}) {
  if (!babyId || !logId) throw new Error('missing babyId or logId');
  const userFromToken = TokenService.getUser?.() || {};
  const userId = payload.userId ?? userFromToken.userId ?? userFromToken.id ?? userFromToken.sub;
  const dmRaw = payload.durationMinutes ?? payload.minutes ?? payload.duration ?? payload.value;
  const durationMinutes = Number(dmRaw);
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) throw new Error('invalid durationMinutes');
  const body = { durationMinutes, userId };
  return api.put(`${API_URL}/${babyId}/feeding/${logId}`, body, { withCredentials: false });
}

// Delete baby feeding log: DELETE /baby/{id}/feeding/{logId} with optional { userId }
async function deleteBabyFeedingLog(babyId, logId, payload = {}) {
  if (!babyId || !logId) throw new Error('missing babyId or logId');
  const userFromToken = TokenService.getUser?.() || {};
  const userId = payload.userId ?? userFromToken.userId ?? userFromToken.id ?? userFromToken.sub;
  const cfg = { withCredentials: false };
  if (userId) cfg.data = { userId };
  return api.delete(`${API_URL}/${babyId}/feeding/${logId}`, cfg);
}

// Update baby weight log: PUT /baby/{id}/weight/{logId} with { currentWeight, userId }
async function updateBabyWeightLog(babyId, logId, payload = {}) {
  if (!babyId || !logId) throw new Error('missing babyId or logId');
  const userFromToken = TokenService.getUser?.() || {};
  const userId = payload.userId ?? userFromToken.userId ?? userFromToken.id ?? userFromToken.sub;
  const wRaw = payload.currentWeight ?? payload.weight ?? payload.value ?? payload.grams;
  const currentWeight = Number(wRaw);
  if (!Number.isFinite(currentWeight) || currentWeight <= 0) throw new Error('invalid currentWeight');
  const body = { currentWeight, userId, babyId };
  return api.put(`${API_URL}/${babyId}/weight/${logId}`, body, { withCredentials: false });
}

// Update baby poop log: PUT /baby/{id}/poop/{logId} with { totalPoop, userId }
async function updateBabyPoopLog(babyId, logId, payload = {}) {
  if (!babyId || !logId) throw new Error('missing babyId or logId');
  const userFromToken = TokenService.getUser?.() || {};
  const userId = payload.userId ?? userFromToken.userId ?? userFromToken.id ?? userFromToken.sub;
  const cRaw = payload.totalPoop ?? payload.count ?? payload.times ?? payload.value ?? payload.poopCount ?? payload.poops;
  const totalPoop = Number(cRaw);
  if (!Number.isFinite(totalPoop) || totalPoop <= 0) throw new Error('invalid poop count');
  const body = { totalPoop, userId };
  return api.put(`${API_URL}/${babyId}/poop/${logId}`, body, { withCredentials: false });
}
// Normalized Poop logger to match backend: { totalPoop, userId }
async function recordBabyPoopNormalized(babyId, payload = {}) {
  if (!babyId) throw new Error('missing babyId');
  const userFromToken = TokenService.getUser?.() || {};
  const userId = payload.userId ?? userFromToken.userId ?? userFromToken.id ?? userFromToken.sub;
  const countRaw = payload.totalPoop ?? payload.count ?? payload.times ?? payload.value ?? payload.poopCount ?? payload.poops;
  const totalPoop = Number(countRaw);
  if (!Number.isFinite(totalPoop) || totalPoop <= 0) throw new Error('invalid poop count');
  // Backend expects only { totalPoop, userId }
  const body = { totalPoop, userId };
  return api.post(`${API_URL}/${babyId}/recordBabyPoop`, body, { withCredentials: false });
}

// Normalized Pee logger to match backend: { totalPee, userId }
async function recordBabyPeeingNormalized(babyId, payload = {}) {
  if (!babyId) throw new Error('missing babyId');
  const userFromToken = TokenService.getUser?.() || {};
  const userId = payload.userId ?? userFromToken.userId ?? userFromToken.id ?? userFromToken.sub;
  const peeRaw = payload.totalPee ?? payload.count ?? payload.times ?? payload.value ?? payload.peeCount ?? payload.pees;
  const totalPee = Number(peeRaw);
  if (!Number.isFinite(totalPee) || totalPee <= 0) throw new Error('invalid pee count');
  const body = { totalPee, userId };
  return api.post(`${API_URL}/${babyId}/recordBabyPeeing`, body, { withCredentials: false });
}

// Update baby peeing log: PUT /baby/{id}/pee/{logId} with { totalPee, userId }
async function updateBabyPeeLog(babyId, logId, payload = {}) {
  if (!babyId || !logId) throw new Error('missing babyId or logId');
  const userFromToken = TokenService.getUser?.() || {};
  const userId = payload.userId ?? userFromToken.userId ?? userFromToken.id ?? userFromToken.sub;
  const peeRaw = payload.totalPee ?? payload.count ?? payload.times ?? payload.value ?? payload.peeCount ?? payload.pees;
  const totalPee = Number(peeRaw);
  if (!Number.isFinite(totalPee) || totalPee <= 0) throw new Error('invalid pee count');
  const body = { totalPee, userId };
  return api.put(`${API_URL}/${babyId}/pee/${logId}`, body, { withCredentials: false });
}

// Get single peeing log: GET /baby/{id}/pee/{logId}
async function getBabyPeeLog(babyId, logId) {
  if (!babyId || !logId) throw new Error('missing babyId or logId');
  return api.get(`${API_URL}/${babyId}/pee/${logId}`, { withCredentials: false });
}

// Delete pee log: DELETE /baby/{id}/pee/{logId} with optional { userId }
async function deleteBabyPeeLog(babyId, logId, payload = {}) {
  if (!babyId || !logId) throw new Error('missing babyId or logId');
  const userFromToken = TokenService.getUser?.() || {};
  const userId = payload.userId ?? userFromToken.userId ?? userFromToken.id ?? userFromToken.sub;
  // Some backends require userId in body for auditing; send if available.
  const cfg = { withCredentials: false };
  if (userId) cfg.data = { userId };
  return api.delete(`${API_URL}/${babyId}/pee/${logId}`, cfg);
}
// Normalized Feeding logger: { durationMinutes, userId }
async function recordBabyFeedingNormalized(babyId, payload = {}) {
  if (!babyId) throw new Error('missing babyId');
  const userFromToken = TokenService.getUser?.() || {};
  const userId = payload.userId ?? userFromToken.userId ?? userFromToken.id ?? userFromToken.sub;
  const dmRaw = payload.durationMinutes ?? payload.minutes ?? payload.duration ?? (Number.isFinite(payload.ms) ? Math.round(payload.ms / 60000) : undefined);
  const durationMinutes = Number(dmRaw);
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) throw new Error('invalid durationMinutes');
  const body = { durationMinutes, userId };
  return api.post(`${API_URL}/${babyId}/recordBabyFeeding`, body, { withCredentials: false });
}
