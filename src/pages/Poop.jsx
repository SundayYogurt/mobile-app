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
  const [rows, setRows] = useState([]); // [{ id, date, count, checkPoop }]
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
          แก้ไข
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
        : [];
      const mapped = raw.map((it, idx) => ({
        id: it.id ?? idx,
        date: it.date || new Date().toISOString().slice(0, 10),
        count: Number(it.totalPoop ?? 0),
        checkPoop: it.checkPoop || "",
      }));
      setRows(mapped);
    } catch {
      info("ไม่สามารถโหลดข้อมูลได้");
    }
  };

  useEffect(() => {
    loadLogs();
  }, [uid, selected?.id]);

  useEffect(() => {
    const checkWarnings = async () => {
      if (!uid || !selected?.id) return;

      const babyRes = await BabyService.getAllByUserId(uid);
      const babies = Array.isArray(babyRes?.data)
        ? babyRes.data
        : Array.isArray(babyRes?.data?.data)
        ? babyRes.data.data
        : [];

      const baby = babies.find((b) => (b?.id ?? b?.babyId) === selected.id);
      if (!baby) return;

      const birthDate = new Date(baby?.birthday || baby?.dob || baby?.birthDate);
      const ageHours = (Date.now() - birthDate.getTime()) / 3600000;
      const hasPoop = rows.length > 0;
      setPoopWarning(!hasPoop && ageHours >= 24);
    };
    checkWarnings();
  }, [uid, selected?.id, rows]);

  // 🩷 ข้อความเตือนจาก checkPoop (ล่าสุด)
  const latestCheckPoop = rows.length > 0 ? rows[rows.length - 1]?.checkPoop : "";

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 gap-6 px-6 max-w-[640px] mx-auto">
      {/* 🔔 คำเตือนเมื่อไม่มีอุจจาระภายใน 24 ชม. */}
      {poopWarning && (
        <div className="w-full rounded-lg border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-[#6C3B73] shadow-sm">
          <strong className="font-semibold">อุจจาระทารก:</strong>{" "}
          หากภายใน 24 ชั่วโมงแรกหลังคลอดยังไม่มีการถ่าย ควรรีบปรึกษาแพทย์ทันที
        </div>
      )}

      {/* 🩷 ปุ่มบันทึก */}
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
              success(`บันทึกสำเร็จ: ${res.count} ครั้ง/วัน`);
            } catch {
              info("บันทึกไม่สำเร็จ");
            }
          }
        }}
        className="btn rounded-xl bg-[#F5D8EB] text-lg font-medium text-[#6C3B73] w-full shadow-sm"
      >
        บันทึกจำนวนอุจจาระ
      </button>

      {/* 📋 ตาราง */}
      <BabyTable columns={["วัน", "ครั้ง/วัน", "Actions"]} data={tableData} />

      {/* 📈 กราฟ */}
      <PinkGraph
        data={graphData}
        lines={[{ dataKey: "times", color: "#FF66C4", label: "ครั้ง/วัน" }]}
      />

      {/* 💡 แสดงคำเตือนล่าสุดก่อนรูป */}
      {latestCheckPoop && (
        <div
          className={`w-full text-sm text-center mt-4 px-4 py-3 rounded-xl shadow-sm border ${
            latestCheckPoop.includes("ผิดปกติ")
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-green-50 border-green-200 text-green-700"
          }`}
        >
          <strong>ผลวิเคราะห์ล่าสุด:</strong> {latestCheckPoop}
        </div>
      )}

      {/* 🌸 รูปภาพ */}
      <img
        src="/src/assets/PP/pp.jpg"
        alt="baby"
        className="rounded-xl shadow-md"
      />
    </div>
  );
};
