import React, { useEffect, useState } from "react";
import PinkGraph from "../components/PinkGraph";
import BabyTable from "../components/BabyTable";
import { Link } from "react-router";
import { useAuthContext } from "../context/AuthContext";
import SelectedBabyService from "../services/SelectedBabyService";
import BabyService from "../services/BabyService";

const SucklingBreasts = () => {
  const { user } = useAuthContext();
  const [rows, setRows] = useState([]); // [{ date, count, totalMinutes }]

  useEffect(() => {
    const run = async () => {
      const uid = user?.userId ?? user?.id ?? user?.sub;
      if (!uid) return;
      const sel = SelectedBabyService.get(uid);
      if (!sel?.id) return;
      try {
        const res = await BabyService.showBabyFeedingLog(sel.id);
        const raw = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.response)
          ? res.data.response
          : [];

        let list = [];

        // ✅ กรณี response ใหม่ (มี totalMinutes และ logCount)
        if (
          raw.length &&
          (Object.prototype.hasOwnProperty.call(raw[0], "totalMinutes") ||
            Object.prototype.hasOwnProperty.call(raw[0], "logCount"))
        ) {
          list = raw.map((it) => ({
            date: it?.date || it?.day || it?.logDate,
            totalMinutes: Math.round(Number(it?.totalMinutes) || 0),
            count: Number(it?.logCount) || 0,
          }));
        } else {
          // ✅ กรณีเก่า: รวมเวลาทั้งหมดต่อวันเอง
          const byDay = new Map();
          for (const it of raw) {
            const dt =
              it?.date ||
              it?.createdAt ||
              it?.created_at ||
              it?.logDate ||
              new Date().toISOString();
            const d = new Date(dt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(d.getDate()).padStart(2, "0")}`;

            const minutes =
              Number(it?.durationMinutes ?? it?.minutes ?? it?.duration ?? it?.value) || 0;

            const prev = byDay.get(key) || { date: key, totalMinutes: 0, count: 0 };
            prev.totalMinutes += minutes;
            prev.count += 1;
            byDay.set(key, prev);
          }
          list = Array.from(byDay.values());
        }

        list.sort((a, b) => new Date(a.date) - new Date(b.date));
        setRows(list);
      } catch (e) {
        console.error("load feeding log failed:", e);
      }
    };
    run();
  }, [user]);

  // ✅ เตรียมข้อมูลสำหรับ table และ graph
  const labeled = rows.map((r, i) => ({
    ...r,
    label: `วัน ${i + 1}`,
  }));

  const tableData = labeled.map((r) => ({
    วัน: r.label,
    "รวมเวลา (นาที/วัน)": r.totalMinutes,
    "ครั้ง/วัน": r.count,
  }));

  const graphData = labeled.map((r) => ({
    name: r.label,
    minutes: r.totalMinutes,
    times: r.count,
  }));

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
      {/* ข้อความแนะนำ */}
      <div className="w-full max-w-[440px]">
        <div className="alert alert-info bg-[#EAF4FF] text-[#0D47A1] rounded-xl shadow-sm">
          <span>การให้ทารกดูดนมแต่ละครั้ง ควรให้เต้าละ 10 – 15 นาที</span>
        </div>
      </div>

      {/* ปุ่มไปหน้าบันทึก */}
      <Link to={"/save"}>
        <button className="btn rounded-xl bg-[#F5D8EB] text-xl font-light w-full">
          ไปหน้าบันทึกการให้นม
        </button>
      </Link>

      {/* ตาราง */}
      <BabyTable columns={["วัน", "รวมเวลา (นาที/วัน)", "ครั้ง/วัน"]} data={tableData} />

      {/* กราฟ */}
      <PinkGraph
        data={graphData}
        lines={[
          { dataKey: "times", color: "#FF66C4", label: "ครั้ง/วัน" },
          { dataKey: "minutes", color: "#CB6CE6", label: "รวมเวลา (นาที/วัน)" },
        ]}
      />

      {/* ภาพแนะนำ */}
      <h1>การให้นมและท่าทางที่ถูกต้อง</h1>
      <div>
        <img src="/src/assets/weight/milk.jpg" alt="breastfeeding info" />
      </div>
    </div>
  );
};

export default SucklingBreasts;
