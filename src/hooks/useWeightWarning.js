import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import SelectedBabyService from "../services/SelectedBabyService";
import BabyService from "../services/BabyService";
import { info } from "../utils/alert";

export default function useWeightWarning() {
  const { user } = useAuthContext();
  const uid = useMemo(() => user?.userId ?? user?.id ?? user?.sub, [user]);
  const selected = useMemo(() => (uid ? SelectedBabyService.get(uid) : null), [uid]);
  const [state, setState] = useState({ show: false, level: null, percent: 0 });

  useEffect(() => {
    const run = async () => {
      try {
        if (!uid || !selected?.id) return;

        // 1) get birth weight from cache or list API
        let birthWeight;
        try {
          const cached = JSON.parse(localStorage.getItem(`ms_babies_${uid}`) || "null");
          const found = Array.isArray(cached)
            ? cached.find((b) => (b?.id ?? b?.babyId) === selected.id)
            : null;
          birthWeight = found?.birthWeight ?? found?.weightAtBirth ?? found?.birth_weight;
        } catch {}
        if (!birthWeight) {
          try {
            const res = await BabyService.getAllByUserId(uid);
            const raw = Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res?.data?.data)
              ? res.data.data
              : Array.isArray(res?.data?.response)
              ? res.data.response
              : [];
            const found = raw.find((b) => (b?.id ?? b?.babyId) === selected.id);
            birthWeight = found?.birthWeight ?? found?.weightAtBirth ?? found?.birth_weight;
          } catch {}
        }
        if (!birthWeight || birthWeight <= 0) return;

        // 2) get latest weight log
        let latestWeight;
        try {
          const res = await BabyService.showBabyWeightLogs(selected.id);
          const raw = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.data?.response)
            ? res.data.response
            : [];
          const mapped = (raw || [])
            .map((it) => ({
              date: it?.date || it?.createdAt || it?.created_at || it?.logDate,
              weight: Number(it?.weight ?? it?.currentWeight ?? it?.value ?? it?.grams) || 0,
            }))
            .filter((r) => r.weight > 0)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          if (mapped.length) latestWeight = mapped[mapped.length - 1].weight;
        } catch {}
        if (!latestWeight) return;

        // 3) compute percent and alert
        const pct = ((birthWeight - latestWeight) / birthWeight) * 100;
        const level = pct >= 7 ? "sev" : pct >= 5 ? "mod" : null;
        if (!level) {
          setState({ show: false, level: null, percent: 0 });
          return;
        }

        setState({ show: true, level, percent: Number(pct.toFixed(1)) });

        const key = `weight_alert_${selected.id}_${new Date().toISOString().slice(0, 10)}_${level}`;
        if (!localStorage.getItem(key)) {
          if (level === "sev") {
            info(
              "น้ำหนักทารกลด ≥ 7%\\nแนะนำพบทันทีที่สถานพยาบาล/พบแพทย์เพื่อประเมินและรับคำแนะนำเพิ่มเติม"
            );
          } else {
            info(
              "น้ำหนักทารกลด ≥ 5%\\nแนะนำกระตุ้นการดูดนมทุก 2 ชั่วโมง และติดตามน้ำหนักอย่างใกล้ชิด"
            );
          }
          try { localStorage.setItem(key, "1"); } catch {}
        }
      } catch {}
    };
    run();
  }, [uid, selected?.id]);

  return state; // { show, level: 'mod' | 'sev' | null, percent }
}

