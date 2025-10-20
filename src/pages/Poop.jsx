import React, { useEffect, useMemo, useState } from "react";
import PinkGraph from "../components/PinkGraph";
import BabyTable from "../components/BabyTable";
import { countPerDayAlert } from "../utils/countAlert";
import { info, success } from "../utils/alert";
import { useAuthContext } from "../context/AuthContext";
import SelectedBabyService from "../services/SelectedBabyService";
import BabyService from "../services/BabyService";

export const Poop = () => {
  const { user } = useAuthContext();
  const [rows, setRows] = useState([]); // [{ id, date, count }]
  const [weightWarning, setWeightWarning] = useState({ show: false, level: "", percent: 0 });
  const [poopWarning, setPoopWarning] = useState(false);

  const uid = useMemo(() => user?.userId ?? user?.id ?? user?.sub, [user]);
  const selected = useMemo(() => (uid ? SelectedBabyService.get(uid) : null), [uid]);

  const tableData = useMemo(() => {
    const sorted = rows.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.map((r, i) => ({
      "วัน": `วัน ${i + 1}`,
      "ครั้ง/วัน": r.count,
      "Actions": (
        <button
          className="btn btn-xs bg-[#E2A9F1] text-white"
          onClick={async () => {
            const resp = await countPerDayAlert({
              title: "แก้ไขจำนวนอุจจาระ",
              label: "จำนวนครั้งใหม่",
              placeholder: String(r.count),
              confirmText: "อัปเดต",
            });
            if (!resp) return;
            try {
              await BabyService.updateBabyPoopLog(selected.id, r.id, {
                totalPoop: resp.count,
                userId: uid,
              });
              await loadLogs();
            } catch (err) {
              const msg = err?.response?.data?.message || err?.message || "";
              info(msg || "อัปเดตไม่สำเร็จ");
            }
          }}
        >
          Edit
        </button>
      ),
    }));
  }, [rows]);

  const graphData = useMemo(() => {
    const sorted = rows.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.map((r, i) => ({ name: `วัน ${i + 1}`, times: r.count }));
  }, [rows]);

  const dateKey = (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  };

  const hasToday = useMemo(
    () => rows.some((r) => dateKey(r.date) === dateKey(new Date())),
    [rows]
  );

  const loadLogs = async () => {
    if (!uid || !selected?.id) return;
    try {
      const res = await BabyService.showBabyPoopLogs(selected.id);
      const raw = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data?.response)
        ? res.data.response
        : [];
      const mapped = raw
        .map((it, idx) => ({
          id: it?.id ?? it?.logId ?? it?._id ?? idx,
          date:
            it?.date ||
            it?.createdAt ||
            it?.created_at ||
            it?.logDate ||
            new Date().toISOString().slice(0, 10),
          count: Number(it?.totalPoop ?? it?.count ?? it?.times ?? it?.value) || 0,
        }))
        .filter((r) => r.count >= 0);
      setRows(mapped);
    } catch (e) {
      console.error("load poop logs failed:", e);
    }
  };

  // ✅ โหลดข้อมูลครั้งแรก
  useEffect(() => {
    loadLogs();
  }, [uid, selected?.id]);

  // ✅ ตรวจสอบการถ่ายอุจจาระ & น้ำหนักทารก
  useEffect(() => {
    const checkWarnings = async () => {
      if (!uid || !selected?.id) return;

      // 🍼 ตรวจว่าทารกถ่ายหรือยังใน 24 ชม. แรก
      const babyRes = await BabyService.getAllByUserId(uid);
      const babies = Array.isArray(babyRes?.data)
        ? babyRes.data
        : Array.isArray(babyRes?.data?.data)
        ? babyRes.data.data
        : Array.isArray(babyRes?.data?.response)
        ? babyRes.data.response
        : [];

      const baby = babies.find((b) => (b?.id ?? b?.babyId) === selected.id);
      if (!baby) return;

      const birthDate = new Date(baby?.birthday || baby?.dob || baby?.birthDate);
      const ageHours = (Date.now() - birthDate.getTime()) / 3600000;

      // ไม่มี poop logs และอายุเกิน 24 ชม.
      const hasPoop = rows.length > 0;
      if (!hasPoop && ageHours >= 24) setPoopWarning(true);
      else setPoopWarning(false);

      // ⚖️ ตรวจน้ำหนักล่าสุด
      try {
        const weightRes = await BabyService.showBabyWeightLogs(selected.id);
        const wraw = Array.isArray(weightRes?.data)
          ? weightRes.data
          : Array.isArray(weightRes?.data?.data)
          ? weightRes.data.data
          : Array.isArray(weightRes?.data?.response)
          ? weightRes.data.response
          : [];
        if (wraw.length > 0 && baby.birthWeight) {
          const last = wraw[wraw.length - 1];
          const current = Number(last?.currentWeight ?? last?.weight ?? 0);
          const pct = ((baby.birthWeight - current) / baby.birthWeight) * 100;
          if (pct >= 7)
            setWeightWarning({ show: true, level: "sev", percent: pct.toFixed(1) });
          else if (pct >= 5)
            setWeightWarning({ show: true, level: "mod", percent: pct.toFixed(1) });
          else setWeightWarning({ show: false, level: "", percent: 0 });
        }
      } catch (err) {
        console.warn("weight check failed:", err);
      }
    };

    checkWarnings();
  }, [uid, selected?.id, rows]);

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">

      {/* ✅ กล่องแจ้งเตือนสุขภาพ */}
      {(poopWarning || weightWarning.show) && (
        <div className="w-full max-w-[640px] mx-auto px-4">
          <div className="text-[#6C3B73] text-sm font-semibold mb-2">แจ้งเตือน</div>

          {poopWarning && (
            <div className="rounded-lg border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-[#6C3B73] shadow-sm mb-2">
              <strong className="font-semibold">คำแนะนำสุขภาพทารก: </strong>
              ครบ 24 ชั่วโมงหลังคลอดแล้วยังไม่ถ่ายอุจจาระ
              กรุณาติดต่อเจ้าหน้าที่สาธารณสุขหรือสถานพยาบาลใกล้บ้านเพื่อรับคำแนะนำเพิ่มเติม
            </div>
          )}

          {weightWarning.show && (
            <div
              className={`rounded-lg px-4 py-3 text-sm shadow-sm mb-2 ${
                weightWarning.level === "sev"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <strong className="font-semibold">น้ำหนักทารก: </strong>
              {weightWarning.level === "sev"
                ? "น้ำหนักลด ≥ 7% แนะนำพบทันทีที่สถานพยาบาล/พบแพทย์"
                : "น้ำหนักลด ≥ 5% แนะนำกระตุ้นการดูดนมทุก 2 ชั่วโมง และติดตามใกล้ชิด"}
              {typeof weightWarning.percent === "number" && (
                <span> (ลด {weightWarning.percent}%)</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ✅ ปุ่มและตาราง */}
      <button
        onClick={async () => {
          if (!uid || !selected?.id) {
            info("กรุณาเลือกเด็กก่อนทำรายการ");
            return;
          }
          if (hasToday) {
            info("วันนี้บันทึกแล้ว โปรดแก้ไขรายการเดิมหากต้องการเปลี่ยน");
            return;
          }
          const res = await countPerDayAlert({
            title: "บันทึกอุจจาระ",
            label: "จำนวนครั้งต่อวัน",
            placeholder: "เช่น 3",
          });
          if (res) {
            try {
              await BabyService.recordBabyPoop(selected.id, {
                count: res.count,
                userId: uid,
              });
              await loadLogs();
              success(`บันทึกสำเร็จ\nอุจจาระ: ${res.count} ครั้ง/วัน`);
            } catch (e) {
              console.error(e);
              info("บันทึกไม่สำเร็จ");
            }
          }
        }}
        className="btn rounded-xl bg-[#F5D8EB] text-xl font-light w-full"
      >
        บันทึกจำนวนอุจจาระ
      </button>

      <BabyTable
        columns={["วัน", "ครั้ง/วัน", "Actions"]}
        data={tableData}
      />

      <PinkGraph
        data={graphData}
        lines={[{ dataKey: "times", color: "#FF66C4", label: "ครั้ง/วัน" }]}
      />
    </div>
  );
};
