// Local persistence for feeding history per user+baby
// Structure: [{ date: 'YYYY-MM-DD', count: number, minutes: number }]

const keyFor = (userId, babyId) => `feeding_${userId}_${babyId}`;

const getHistory = (userId, babyId) => {
  try {
    const raw = localStorage.getItem(keyFor(userId, babyId));
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const setHistory = (userId, babyId, history) => {
  try {
    localStorage.setItem(keyFor(userId, babyId), JSON.stringify(history || []));
  } catch {}
};

// ✅ แก้ logic ให้ตรวจวันล่าสุดก่อน merge
const mergeToday = (userId, babyId, { date, addCount, addMinutes }) => {
  const list = getHistory(userId, babyId);

  // ตรวจ record ล่าสุดใน list (อันที่เพิ่งบันทึกล่าสุด)
  const last = list[list.length - 1];

  // ถ้า record ล่าสุดไม่ตรงวัน → สร้างวันใหม่เสมอ
  if (!last || last.date !== date) {
    const next = [
      ...list,
      {
        date,
        count: Number(addCount || 0),
        minutes: Number(addMinutes || 0),
      },
    ];
    setHistory(userId, babyId, next);
    return next;
  }

  // ถ้าวันตรงกัน → รวมเพิ่ม
  const next = [...list];
  next[list.length - 1] = {
    date,
    count: Number(last.count || 0) + Number(addCount || 0),
    minutes: Number(last.minutes || 0) + Number(addMinutes || 0),
  };

  setHistory(userId, babyId, next);
  return next;
};

const FeedingService = { getHistory, setHistory, mergeToday };
export default FeedingService;
