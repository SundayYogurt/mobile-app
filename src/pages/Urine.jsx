import React, { useMemo, useState, useEffect } from "react";
import PinkGraph from "../components/PinkGraph";
import BabyTable from "../components/BabyTable";
import { countPerDayAlert } from "../utils/countAlert";
import { info, success } from "../utils/alert";
import { useAuthContext } from "../context/AuthContext";
import SelectedBabyService from "../services/SelectedBabyService";
import BabyService from "../services/BabyService";

const Urine = () => {
  const { user } = useAuthContext();
  const [rows, setRows] = useState([]);
  const [logs, setLogs] = useState([]);

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
    console.log('🔍 Today key:', todayKey);
    console.log('📋 All logs:', logs);
    
    // ถ้ายังไม่มี logs เลย ให้ return false
    if (!Array.isArray(logs) || logs.length === 0) {
      console.log('❌ No logs found');
      return false;
    }

    // ดู object แรกเพื่อหา field วันที่
    console.log('🔬 First log full object:', logs[0]);
    console.log('🔬 All keys:', Object.keys(logs[0]));
    
    const result = logs.some((l) => {
      // ลองหา field ทุกแบบที่เป็นไปได้
      const src = l?.logDate || l?.date || l?.createdAt || l?.created_at || 
                  l?.recordDate || l?.peeDate || l?.timestamp || l?.updatedAt || l?.updated_at;
      
      console.log('📅 Log date source:', src);
      
      if (!src) {
        // ถ้าไม่มี field วันที่เลย ให้ถือว่าเป็นวันนี้ (เพิ่งสร้างมา)
        console.log('⚠️ No date field found - treating as today');
        return true;
      }
      
      const recordKey = getBangkokDateKey(new Date(src));
      console.log('🗓️ Record key:', recordKey, '| Match:', recordKey === todayKey);
      return recordKey === todayKey;
    });
    
    console.log('✅ Has today:', result);
    return result;
  }, [logs]);

  // ✅ โหลดข้อมูลทั้งหมด
  useEffect(() => {
    loadLogs();
  }, [uid, selected?.id]);

  async function loadLogs() {
    if (!uid || !selected?.id) return;
    try {
      const res = await BabyService.showBabyPeeLogs(selected.id);
      console.log('🌐 API Response:', res);
      
      const data =
        Array.isArray(res?.data?.data) ||
        Array.isArray(res?.data?.logs) ||
        Array.isArray(res?.data)
          ? res.data.data || res.data.logs || res.data
          : [];

      setLogs(data);

      const mapped = data.map((l, idx) => ({
        name: `วัน ${idx + 1}`,
        times:
          Number(
            l?.totalPee ??
              l?.count ??
              l?.times ??
              l?.peeCount ??
              l?.pees ??
              l?.value ??
              0
          ) || 0,
        checkPee: l?.checkPee || "",
      }));
      setRows(mapped);
    } catch (e) {
      info("ไม่สามารถโหลดข้อมูลได้");
    }
  }

  // ✅ ฟังก์ชันแก้ไขข้อมูล
  async function handleEdit(index) {
    const log = logs[index];
    if (!log) return;
    const id = log?.id ?? log?.logId ?? log?._id ?? index;
    const current =
      Number(
        log?.totalPee ??
          log?.count ??
          log?.times ??
          log?.peeCount ??
          log?.pees ??
          log?.value ??
          0
      ) || 1;

    const res = await countPerDayAlert({
      title: "แก้ไขจำนวนปัสสาวะ",
      label: "จำนวนครั้งใหม่",
      placeholder: String(current),
      confirmText: "อัปเดต",
    });
    if (!res) return;

    // ✅ ใช้เวลาไทยตอนแก้ไข
    const bangkokNow = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);

    try {
      await BabyService.updateBabyPeeLog(selected.id, id, {
        totalPee: res.count,
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

  // 💧 คำเตือนจาก checkPee ล่าสุด
  const latestCheckPee = rows.length > 0 ? rows[rows.length - 1]?.checkPee : "";

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
      {/* ปุ่มบันทึก */}
      <button
        disabled={hasToday}
        onClick={async () => {
          if (!uid || !selected?.id) {
            info("กรุณาเลือกเด็กก่อนทำรายการ");
            return;
          }

          // ✅ เช็คซ้ำอีกรอบก่อนบันทึก
          const todayKey = getBangkokDateKey();
          const alreadyRecorded = logs.some(l => {
            const src = l?.logDate || l?.date || l?.createdAt || l?.created_at ||
                        l?.recordDate || l?.peeDate || l?.timestamp;
            if (!src) return true; // ถ้าไม่มี date field ถือว่ามีแล้ว
            return getBangkokDateKey(new Date(src)) === todayKey;
          });

          if (alreadyRecorded) {
            info("วันนี้บันทึกแล้ว โปรดแก้ไขรายการเดิมหากต้องการเปลี่ยน");
            return;
          }

          const res = await countPerDayAlert({
            title: "บันทึกจำนวนปัสสาวะ",
            label: "ระบุจำนวนครั้งต่อวัน",
            placeholder: "เช่น 6",
          });

          if (res) {
            const bangkokNow = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);

            try {
              await BabyService.recordBabyPeeing(selected.id, {
                totalPee: res.count,
                userId: uid,
                logDate: bangkokNow.toISOString(),
              });
              success(`บันทึกสำเร็จ\nจำนวนปัสสาวะ: ${res.count} ครั้ง/วัน`);
              await loadLogs();
            } catch (e) {
              const msg = e?.response?.data?.message || e?.message || "";
              info(msg || "ไม่สามารถบันทึกจำนวนปัสสาวะได้");
            }
          }
        }}
        className="btn rounded-xl bg-[#F5D8EB] text-xl font-light w-full"
      >
        {hasToday ? "วันนี้บันทึกแล้ว" : "บันทึกจำนวนปัสสาวะ"}
      </button>

      {/* ตารางข้อมูล */}
      <BabyTable
        columns={[
          { key: "name", label: "วัน" },
          { key: "times", label: "ครั้ง/วัน" },
          { key: "actions", label: "Actions" },
        ]}
        data={rows.map((row, idx) => ({
          ...row,
          actions: (
            <div className="flex gap-2 justify-center">
              <button
                className="btn btn-xs bg-[#E2A9F1] text-white"
                onClick={() => handleEdit(idx)}
              >
                แก้ไข
              </button>
            </div>
          ),
        }))}
      />

      {/* กราฟ */}
      <PinkGraph
        data={rows}
        lines={[{ dataKey: "times", color: "#FF66C4", label: "ครั้ง/วัน" }]}
      />

      {/* 💡 แสดงคำเตือนล่าสุดจาก checkPee */}
      {latestCheckPee && (
        <div
          className={`w-full text-sm text-center mt-4 px-4 py-3 rounded-xl shadow-sm border ${
            latestCheckPee.includes("น้อยกว่าปกติ")
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-green-50 border-green-200 text-green-700"
          }`}
        >
          <strong>ผลวิเคราะห์ล่าสุด:</strong> {latestCheckPee}
        </div>
      )}

      {/* รูปภาพตกแต่ง */}
      <img
        src="/src/assets/PP/pp.jpg"
        alt="baby"
        className="rounded-xl shadow-md"
      />
    </div>
  );
};

export default Urine;