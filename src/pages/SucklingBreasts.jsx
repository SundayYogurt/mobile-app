import React, { useCallback, useEffect, useMemo, useState } from "react";
import PinkGraph from "../components/PinkGraph";
import BabyTable from "../components/BabyTable";
import { Link } from "react-router";
import { useAuthContext } from "../context/AuthContext";
import SelectedBabyService from "../services/SelectedBabyService";
import BabyService from "../services/BabyService";
import { info, success } from "../utils/alert";
import { countPerDayAlert } from "../utils/countAlert";

const formatDateDisplay = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const SucklingBreasts = () => {
  const { user } = useAuthContext();
  const [dailyRows, setDailyRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState({ userId: null, babyId: null });

  const loadLogs = useCallback(async () => {
    const uid = user?.userId ?? user?.id ?? user?.sub;
    if (!uid) {
      setDailyRows([]);
      setSelection({ userId: null, babyId: null });
      return;
    }

    const sel = SelectedBabyService.get(uid);
    if (!sel?.id) {
      setDailyRows([]);
      setSelection({ userId: uid, babyId: null });
      return;
    }

    setSelection({ userId: uid, babyId: sel.id });
    setLoading(true);

    try {
      const res = await BabyService.showBabyFeedingLogs(sel.id);
      const raw = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data?.response)
        ? res.data.response
        : [];

      const byDay = new Map();

      // รวมรายวัน (รองรับทั้งแบบรวมมาให้ และแบบรายครั้ง)
      raw.forEach((item) => {
        const dateKeyRaw = item?.date ?? item?.logDate ?? item?.createdAt ?? new Date();
        const d = new Date(dateKeyRaw);
        const key = formatDateKey(d);
        const minutes =
          Number(
            item?.totalMinutes ??
              item?.durationMinutes ??
              item?.minutes ??
              item?.duration ??
              item?.value
          ) || 0;
        // ถ้า backend รวมรายวันมาให้แล้ว logCount จะเป็นจำนวนครั้งต่อวัน
        const count = Number(item?.logCount ?? item?.count ?? 1);

        const current = byDay.get(key) || { totalMinutes: 0, count: 0 };
        current.totalMinutes += minutes;
        current.count += count;
        byDay.set(key, current);
      });

      // เตรียมช่วงย้อนหลัง 14 วัน (index 0 = วันนี้)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filled14 = Array.from({ length: 14 }, (_, idx) => {
        const day = new Date(today);
        day.setDate(today.getDate() - idx);
        const key = formatDateKey(day);
        const data = byDay.get(key);
        return {
          dayLabel: `วันที่ ${idx + 1}`,
          displayDate: formatDateDisplay(day),
          dateKey: key,
          totalMinutes: Math.round(data?.totalMinutes ?? 0),
          count: data?.count ?? 0,
        };
      });

      // ✅ ตรงตามโจทย์:
      // - ถ้ายังวันแรก/ยังไม่มีข้อมูลเลย → แสดง "เฉพาะวันนี้" แถวเดียว
      // - ถ้ามีข้อมูลแล้ว → แสดงตั้งแต่วันนี้ไปจนถึง "วันย้อนหลังที่เก่าสุดที่มีข้อมูล" (สูงสุด 14 วัน)
      const lastIndexWithData = filled14.findIndex((r) => r.count > 0); // ใกล้วันนี้ที่สุดที่มีข้อมูล
      let rowsToShow;
      if (lastIndexWithData === -1) {
        // ไม่มีข้อมูลเลย → โชว์วันนี้แถวเดียว
        rowsToShow = [filled14[0]];
      } else {
        // มีข้อมูล → โชว์ช่วงวันนี้ถึงวันเก่าสุดที่มีข้อมูล (รวมวันว่างตรงกลางเพื่อให้เพิ่มย้อนหลังได้)
        // หา index ที่ไกลที่สุดย้อนหลังที่มีข้อมูล
        let farthest = 0;
        for (let i = 0; i < filled14.length; i++) {
          if (filled14[i].count > 0) farthest = Math.max(farthest, i);
        }
        rowsToShow = filled14.slice(0, farthest + 1);
      }

      setDailyRows(rowsToShow);
    } catch (error) {
      setDailyRows([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // เพิ่มย้อนหลังเท่านั้น
  const handleAddPastDay = useCallback(
    async (day) => {
      if (!selection.babyId) {
        info("กรุณาเลือกข้อมูลทารกก่อนเพิ่ม");
        return;
      }

      if (day.count > 0) {
        info("วันดังกล่าวมีข้อมูลแล้ว ไม่สามารถเพิ่มได้");
        return;
      }

      const result = await countPerDayAlert({
        title: `เพิ่มข้อมูลย้อนหลังวันที่ ${day.displayDate}`,
        label: "กรอกเวลาปั๊มนม (นาที)",
        placeholder: "เช่น 30",
        confirmText: "เพิ่มข้อมูล",
        cancelText: "ยกเลิก",
        invalidMessage: "กรุณากรอกเวลามากกว่า 0 นาที",
      });

      if (!result) return;
      const minutes = Number(result.count);
      if (!Number.isFinite(minutes) || minutes <= 0) {
        info("กรุณากรอกเวลามากกว่า 0 นาที");
        return;
      }

      // ใช้เที่ยงวันเพื่อกัน timezone เพี้ยน
      const createdAt = new Date(`${day.dateKey}T12:00:00`);

      try {
        await BabyService.createBabyFeedingLog(selection.babyId, {
          durationMinutes: minutes,
          userId: selection.userId,
          createdAt,
        });
        success(`เพิ่มข้อมูลวันที่ ${day.displayDate} เรียบร้อย`);

        // อัปเดตตารางทันที และขยายช่วงถ้าจำเป็น
        setDailyRows((prev) => {
          // อัปเดตแถวเดิม (วันนี้/วันนั้น)
          const updated = prev.map((r) =>
            r.dateKey === day.dateKey ? { ...r, totalMinutes: minutes, count: 1 } : r
          );

          // ถ้าตอนแรกมีแค่วันนี้แถวเดียว และผู้ใช้ไปเพิ่มวันก่อนหน้า (กรณีคุณปรับให้เห็นวันก่อนหน้า)
          // สามารถขยายช่วงด้วยการ reload อีกที
          return updated;
        });

        // sync กับ backend เพื่อดึงช่วงย้อนหลังที่ควรแสดงตอนนี้
        loadLogs();
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "ไม่สามารถเพิ่มข้อมูลได้";
        info(msg);
      }
    },
    [loadLogs, selection.babyId, selection.userId]
  );

  // แสดงตารางเสมอ (เพื่อให้วันแรกเห็นแถวเดียวได้)
  const tableData = useMemo(
    () =>
      dailyRows.map((day, idx) => ({
        วัน: day.dayLabel,
        "รวมเวลานาทีต่อวัน": day.totalMinutes,
        "ครั้งต่อวัน": day.count,
        Action:
          day.count === 0 ? (
            <button
              className="btn btn-xs bg-[#E2A9F1] text-white"
              onClick={() => handleAddPastDay(day)}
            >
              {idx === 0 ? "บันทึกวันนี้" : "เพิ่มย้อนหลัง"}
            </button>
          ) : (
            <span className="text-gray-400">—</span>
          ),
      })),
    [dailyRows, handleAddPastDay]
  );

  const hasData = dailyRows.some((d) => d.count > 0);

  const graphData = useMemo(
    () =>
      hasData
        ? [...dailyRows].reverse().map((d) => ({
            name: d.displayDate,
            minutes: d.totalMinutes,
            times: d.count,
          }))
        : [],
    [dailyRows, hasData]
  );

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 gap-6 px-6 max-w-[440px] mx-auto">
      {/* ข้อความแนะนำ */}
      <div className="w-full max-w-[440px]">
        <div className="alert alert-info bg-[#EAF4FF] text-[#0D47A1] rounded-xl shadow-sm">
          <span>เริ่มบันทึกวันนี้ได้เลย และสามารถเพิ่มย้อนหลังเฉพาะวันว่างได้</span>
        </div>
      </div>

      {/* ปุ่มไปหน้าบันทึก */}
      <Link to={"/save"}>
        <button className="btn rounded-xl bg-[#F5D8EB] text-xl font-light w-full">
          บันทึกการปั๊มนมเพิ่มเติม
        </button>
      </Link>

      {/* ตาราง (วันแรกจะแสดงแค่วันนี้แถวเดียว, ต่อๆ ไปจะขยายเท่าที่มีข้อมูลย้อนหลัง) */}
      <BabyTable
        columns={["วัน", "รวมเวลานาทีต่อวัน", "ครั้งต่อวัน", "Action"]}
        data={tableData}
      />

      {loading && <div className="text-xs text-gray-400">กำลังโหลดข้อมูล...</div>}

      {/* กราฟ แสดงเฉพาะเมื่อมีข้อมูลจริง */}
      {hasData && (
        <PinkGraph
          data={graphData}
          lines={[
            { dataKey: "times", color: "#FF66C4", label: "ครั้งต่อวัน" },
            { dataKey: "minutes", color: "#CB6CE6", label: "รวมนาทีต่อวัน" },
          ]}
        />
      )}

      {/* ภาพประกอบ */}
      <h1>ให้นมแม่สม่ำเสมอช่วยให้ทารกแข็งแรง</h1>
      <img src="/src/assets/weight/milk.jpg" alt="breastfeeding info" />
    </div>
  );
};

export default SucklingBreasts;
