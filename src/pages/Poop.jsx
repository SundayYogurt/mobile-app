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
  const [logs, setLogs] = useState([]);
  const [poopWarning, setPoopWarning] = useState(false);

  const uid = useMemo(() => user?.userId ?? user?.id ?? user?.sub, [user]);
  const selected = useMemo(() => (uid ? SelectedBabyService.get(uid) : null), [uid]);

  // ✅ ใช้เวลาไทย (UTC+7)
  const getBangkokDateKey = (date = new Date()) => {
    const bangkok = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const y = bangkok.getFullYear();
    const m = String(bangkok.getMonth() + 1).padStart(2, "0");
    const d = String(bangkok.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // ✅ ตรวจว่ามีข้อมูลของ "วันนี้" แล้วหรือยัง
  const hasToday = useMemo(() => {
    const todayKey = getBangkokDateKey();
    if (!Array.isArray(logs) || logs.length === 0) return false;

    return logs.some((l) => {
      const src =
        l?.logDate ||
        l?.date ||
        l?.createdAt ||
        l?.created_at ||
        l?.recordDate ||
        l?.poopDate ||
        l?.timestamp;
      if (!src) return false;
      return getBangkokDateKey(new Date(src)) === todayKey;
    });
  }, [logs]);

  // ✅ โหลดข้อมูลทั้งหมด
  async function loadLogs() {
    if (!uid || !selected?.id) return;
    try {
      const res = await BabyService.showBabyPoopLogs(selected.id);
      const data =
        Array.isArray(res?.data?.data) ||
        Array.isArray(res?.data?.logs) ||
        Array.isArray(res?.data)
          ? res.data.data || res.data.logs || res.data
          : [];

      setLogs(data);

      const mapped = data.map((it, idx) => ({
        id: it.id ?? idx,
        date: it.date || it.logDate || new Date().toISOString().slice(0, 10),
        count: Number(it.totalPoop ?? it.count ?? 0),
        checkPoop: it.checkPoop || "",
      }));
      setRows(mapped);
    } catch {
      info("ไม่สามารถโหลดข้อมูลได้");
    }
  }

  useEffect(() => {
    loadLogs();
  }, [uid, selected?.id]);

  // ✅ ฟังก์ชันแก้ไขข้อมูล
  async function handleEdit(index) {
    const log = logs[index];
    if (!log) return;
    const id = log?.id ?? log?.logId ?? log?._id ?? index;
    const current =
      Number(
        log?.totalPoop ??
          log?.count ??
          log?.times ??
          log?.value ??
          log?.poopCount ??
          log?.poops
      ) || 1;

    const res = await countPerDayAlert({
      title: "แก้ไขจำนวนอุจจาระ",
      label: "จำนวนครั้งใหม่",
      placeholder: String(current),
      confirmText: "อัปเดต",
    });
    if (!res) return;

    const bangkokNow = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);

    try {
      await BabyService.updateBabyPoopLog(selected.id, id, {
        totalPoop: res.count,
        userId: uid,
        logDate: bangkokNow.toISOString(),
      });
      await loadLogs();
      success("อัปเดตสำเร็จ");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "";
      info(msg || "อัปเดตไม่สำเร็จ");
    }
  }

  // ✅ คำเตือน 24 ชม.แรก
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
      const hasPoop = logs.length > 0;
      setPoopWarning(!hasPoop && ageHours >= 24);
    };
    checkWarnings();
  }, [uid, selected?.id, logs]);

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
        disabled={hasToday}
        onClick={async () => {
          if (!uid || !selected?.id) {
            info("กรุณาเลือกเด็กก่อนทำรายการ");
            return;
          }

          // ✅ ตรวจซ้ำอีกชั้นก่อนบันทึก
          const todayKey = getBangkokDateKey();
          const alreadyRecorded = logs.some((l) => {
            const src =
              l?.logDate ||
              l?.date ||
              l?.createdAt ||
              l?.created_at ||
              l?.recordDate ||
              l?.poopDate ||
              l?.timestamp;
            if (!src) return true;
            return getBangkokDateKey(new Date(src)) === todayKey;
          });

          if (alreadyRecorded) {
            info("วันนี้บันทึกแล้ว โปรดแก้ไขรายการเดิมหากต้องการเปลี่ยน");
            return;
          }

          const res = await countPerDayAlert({
            title: "บันทึกอุจจาระ",
            label: "จำนวนครั้งต่อวัน",
            placeholder: "เช่น 3",
          });
          if (res) {
            const bangkokNow = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
            try {
              await BabyService.recordBabyPoop(selected.id, {
                count: res.count,
                userId: uid,
                logDate: bangkokNow.toISOString(),
              });
              await loadLogs();
              success(`บันทึกสำเร็จ: ${res.count} ครั้ง/วัน`);
            } catch {
              info("บันทึกไม่สำเร็จ");
            }
          }
        }}
        className={`btn rounded-xl text-lg font-medium w-full shadow-sm ${
          hasToday ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#F5D8EB] text-[#6C3B73]"
        }`}
      >
        {hasToday ? "วันนี้บันทึกแล้ว" : "บันทึกจำนวนอุจจาระ"}
      </button>

      {/* 📋 ตาราง */}
      <BabyTable
        columns={["วัน", "ครั้ง/วัน", "Actions"]}
        data={rows.map((r, i) => ({
          วัน: `วัน ${i + 1}`,
          "ครั้ง/วัน": r.count,
          Actions: (
            <button
              className="btn btn-xs bg-[#E2A9F1] text-white"
              onClick={() => handleEdit(i)}
            >
              แก้ไข
            </button>
          ),
        }))}
      />

      {/* 📈 กราฟ */}
      <PinkGraph
        data={rows.map((r, i) => ({
          name: `วัน ${i + 1}`,
          times: r.count,
        }))}
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

export default Poop;
