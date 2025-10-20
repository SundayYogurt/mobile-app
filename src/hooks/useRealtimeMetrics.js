import { useEffect, useMemo, useRef, useState } from "react";
import MetricsService from "../services/MetricsService";
import TokenService from "../services/TokenService";

export default function useRealtimeMetrics({
  pollMs = 10000,
  heartbeatMs = 15000,
} = {}) {
  const [visitorCount, setVisitorCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const wsRef = useRef(null);
  const wsUrl = useMemo(() => import.meta.env.VITE_WS_URL || "", []);

  // Polling fallback
  useEffect(() => {
    let t;
    const fetchNow = async () => {
      try {
        const res = await MetricsService.getMetrics();
        const data = res?.data || {};
        if (typeof data.visitorCount === "number") setVisitorCount(data.visitorCount);
        if (typeof data.onlineCount === "number") setOnlineCount(data.onlineCount);
      } catch (e) {
        // silent
      }
    };
    fetchNow();
    t = setInterval(fetchNow, pollMs);
    return () => t && clearInterval(t);
  }, [pollMs]);

  // Heartbeat to keep presence alive
  useEffect(() => {
    let t;
    let stopped = false;
    const getSectionId = () => {
      try {
        const key = "ms_section_id";
        let sec = localStorage.getItem(key);
        if (!sec) {
          sec = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
          localStorage.setItem(key, sec);
        }
        return sec;
      } catch {
        return undefined;
      }
    };

    const beat = async () => {
      if (stopped) return;
      try {
        const u = TokenService.getUser?.() || {};
        const userId = (u.userId ?? u.id ?? u.sub ?? 0) || 0; // ส่ง 0 หากยังไม่ล็อกอิน
        const sid = getSectionId();
        // ส่งให้ครอบคลุม: บาง backend ต้องการ sessionId แทน sectionId
        const payload = { userId, sectionId: sid, sessionId: sid };
        await MetricsService.heartbeat(payload);
      } catch (e) {
        // Stop heartbeats on hard client error to avoid spam (e.g. backend requires payload)
        const status = e?.response?.status;
        if (status && status >= 400 && status < 500) {
          stopped = true;
          if (t) clearInterval(t);
        }
      }
    };
    beat();
    t = setInterval(beat, heartbeatMs);
    return () => {
      stopped = true;
      if (t) clearInterval(t);
    };
  }, [heartbeatMs]);

  // Optional WebSocket live updates
  useEffect(() => {
    if (!wsUrl) return;
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data || "{}");
          if (typeof payload.visitorCount === "number") setVisitorCount(payload.visitorCount);
          if (typeof payload.onlineCount === "number") setOnlineCount(payload.onlineCount);
        } catch {}
      };
      ws.onerror = () => {};
      return () => {
        try { ws.close(); } catch {}
      };
    } catch {
      // ignore if WS setup fails; polling still works
    }
  }, [wsUrl]);

  return { visitorCount, onlineCount };
}
