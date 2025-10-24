export const SelectedBabyService = {
  get(userId) {
    try {
      const raw = localStorage.getItem(`selected_baby_${userId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(userId, baby) {
    try {
      localStorage.setItem(`selected_baby_${userId}`, JSON.stringify(baby));
    } catch {}
  },
  remove(userId) {
    try {
      localStorage.removeItem(`selected_baby_${userId}`);
    } catch {}
  },
};

export default SelectedBabyService;
