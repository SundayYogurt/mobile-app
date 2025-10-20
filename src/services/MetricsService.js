import api from "./api";

const BASE = import.meta.env.VITE_METRICS_API_BASE || "/api/v1/metrics";

const getMetrics = async () => {
// Expecting: { visitorCount: number, onlineCount: number }
  return api.get(`${BASE}`, { withCredentials: false });
};

const heartbeat = async (payload = {}) => {
// Backend expects: { userId, sectionId }
  // Backend may require some fields; callers should pass userId/sessionId/page
  return api.post(`${BASE}/heartbeat`, payload, { withCredentials: false });
};

const MetricsService = { getMetrics, heartbeat };
export default MetricsService;
