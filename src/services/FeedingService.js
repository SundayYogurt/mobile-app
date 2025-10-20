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

const mergeToday = (userId, babyId, { date, addCount, addMinutes }) => {
  const list = getHistory(userId, babyId);
  const idx = list.findIndex((r) => r.date === date);
  if (idx >= 0) {
    const next = [...list];
    next[idx] = {
      date,
      count: Number(next[idx].count || 0) + Number(addCount || 0),
      minutes: Number(next[idx].minutes || 0) + Number(addMinutes || 0),
    };
    setHistory(userId, babyId, next);
    return next;
  }
  const next = [{ date, count: Number(addCount || 0), minutes: Number(addMinutes || 0) }, ...list];
  setHistory(userId, babyId, next);
  return next;
};

const FeedingService = { getHistory, setHistory, mergeToday };
export default FeedingService;

