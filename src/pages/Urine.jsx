import React, { useCallback, useEffect, useMemo, useState } from "react";
import PinkGraph from "../components/PinkGraph";
import BabyTable from "../components/BabyTable";
import { Link } from "react-router";
import { useAuthContext } from "../context/AuthContext";
import SelectedBabyService from "../services/SelectedBabyService";
import BabyService from "../services/BabyService";
import { info, success } from "../utils/alert";
import { countPerDayAlert } from "../utils/countAlert";
import Swal from "sweetalert2";

const SucklingBreasts = () => {
  const { user } = useAuthContext();
  const [rows, setRows] = useState([]);
  const [feedingAlert, setFeedingAlert] = useState(null);

  const uid = useMemo(() => user?.userId ?? user?.id ?? user?.sub, [user]);
  const selected = useMemo(() => (uid ? SelectedBabyService.get(uid) : null), [uid]);

  // ✅ ฟังก์ชันคำนวณอายุวัน (สำรองในกรณีที่ backend ไม่ส่ง ageInDays)
  const calcDaysAt = (birthDate, logDate) => {
    if (!birthDate || !logDate) return 1;
    const birth = new Date(birthDate);
    const log = new Date(logDate);
    const diff = Math.floor((log - birth) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  // ✅ โหลดข้อมูลจาก backend
  const loadLogs = useCallback(async () => {
    if (!uid || !selected?.id) {
      setRows([]);
      return;
    }

    try {
      const res = await BabyService.showBabyFeedingLogs(selected.id);

      const raw =
        Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];

      console.log("🍼 FEEDING LOGS:", raw);

      const mapped = raw
        .map((it, idx) => ({
          id: it?.id ?? it?._id ?? idx,
          daysAt:
            it?.ageInDays ??
            calcDaysAt(selected?.birthday ?? selected?.birthDate ?? selected?.dob, it?.date),
          totalMinutes: Number(it?.totalMinutes ?? 0),
          count: Number(it?.logCount ?? 0),
          checkFeeding: it?.checkFeeding ?? "",
          date: it?.date,
        }))
        .sort((a, b) => a.daysAt - b.daysAt);

      setRows(mapped);

      // ✅ สร้างคำเตือนล่าสุด
      if (mapped.length > 0) {
        const latest = mapped[0];
        if (latest.count < 8)
          setFeedingAlert(
            `ลูกดูดนมน้อยกว่า 8 ครั้งใน 24 ชั่วโมง (${latest.count} ครั้ง) อาจได้รับนมไม่เพียงพอ 💧`
          );
        else if (latest.count > 12)
          setFeedingAlert(
            `ลูกดูดนมบ่อยกว่า 12 ครั้งใน 24 ชั่วโมง (${latest.count} ครั้ง) แนะนำให้สังเกตการเข้าเต้าและการกลืนของลูก 👶`
          );
        else setFeedingAlert(null);
      }
    } catch (error) {
      console.error("❌ loadLogs error:", error);
      setRows([]);
    }
  }, [uid, selected?.id]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // ✅ เตรียมข้อมูลตาราง 14 วัน
  const tableData = useMemo(() => {
    const dataByDay = rows.reduce((acc, row) => {
      acc[row.daysAt] = row;
      return acc;
    }, {});

    return Array.from({ length: 14 }, (_, i) => {
      const ageDay = i + 1;
      const rowData = dataByDay[ageDay];

      if (rowData)
        return {
          daysAt: ageDay,
          "รวมเวลานาทีต่อวัน": rowData.totalMinutes,
          "จำนวนครั้งต่อวัน": rowData.count,
          Actions: (
            <button
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#F5D8EB] to-[#F8CFE5] hover:from-[#f782c0] hover:to-[#ff6bbf] text-[#6C3B73] font-semibold text-xs px-3 py-[6px] rounded-full shadow-md transition-all duration-200 whitespace-nowrap hover:scale-105 active:scale-95 w-full"
              onClick={async () => {
                const { value: minutes } = await Swal.fire({
                  title: `แก้ไขข้อมูลวันที่ ${ageDay}`,
                  input: "number",
                  inputValue: rowData.totalMinutes,
                  showCancelButton: true,
                  confirmButtonText: "บันทึก",
                  cancelButtonText: "ยกเลิก",
                  confirmButtonColor: "#C266A4",
                  cancelButtonColor: "#aaa",
                });

                if (!minutes) return;
                try {
                  await BabyService.updateBabyFeedingLog(selected.id, rowData.id, {
                    durationMinutes: Number(minutes),
                    userId: uid,
                    daysAt: ageDay,
                  });
                  await loadLogs();
                  success("อัปเดตข้อมูลเรียบร้อยแล้ว");
                } catch {
                  info("อัปเดตไม่สำเร็จ");
                }
              }}
            >
              แก้ไข
            </button>
          ),
        };

      return {
        daysAt: ageDay,
        "รวมเวลานาทีต่อวัน": "-",
        "จำนวนครั้งต่อวัน": "-",
        Actions: (
          <button
            className="inline-flex items-center justify-center bg-gradient-to-r from-[#F5D8EB] to-[#F8CFE5] hover:from-[#FF9ED1] hover:to-[#FF80C8] text-[#6C3B73] font-semibold text-xs px-3 py-[6px] rounded-full shadow-md transition-all duration-200 whitespace-nowrap hover:scale-105 active:scale-95"
            onClick={async () => {
              const result = await countPerDayAlert({
                title: `เพิ่มข้อมูลวันที่ ${ageDay}`,
                label: "กรอกเวลาปั๊มนม (นาที)",
                placeholder: "เช่น 30",
                confirmText: "เพิ่มข้อมูล",
                cancelText: "ยกเลิก",
                invalidMessage: "กรุณากรอกเวลามากกว่า 0 นาที",
              });

              if (result) {
                try {
                  await BabyService.createBabyFeedingLog(selected.id, {
                    durationMinutes: result.count,
                    userId: uid,
                    daysAt: ageDay,
                  });
                  await loadLogs();
                  success("เพิ่มข้อมูลสำเร็จ");
                } catch {
                  info("เพิ่มไม่สำเร็จ");
                }
              }
            }}
          >
            💕 เพิ่มข้อมูล
          </button>
        ),
      };
    });
  }, [rows, uid, selected?.id, loadLogs]);

  // ✅ กราฟ
  const graphData = useMemo(
    () =>
      rows.map((d) => ({
        name: `วันที่ ${d.daysAt}`,
        minutes: d.totalMinutes,
        times: d.count,
      })),
    [rows]
  );

  return (
    <div className="w-full flex flex-col items-center justify-center mt-8 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
      {/* หัวข้อ */}
      <div className="flex flex-col items-center text-center mb-4">
        <img src="/src/assets/love.png" alt="icon" className="w-16 h-16 animate-pulse mb-2" />
        <h1 className="text-3xl font-bold text-[#FF66C4] drop-shadow-sm">
          บันทึกการดูดนมแม่ 💕
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          จดบันทึกเวลาการให้นมลูกน้อย เพื่อดูพัฒนาการและสุขภาพของลูก 🌸
        </p>
      </div>

      {/* ปุ่มบันทึกเพิ่มเติม */}
      <Link to="/save" className="w-full">
        <button className="btn w-full rounded-xl bg-gradient-to-r from-[#F5D8EB] to-[#F8CFE5] hover:from-[#f782c0] hover:to-[#ff6bbf] text-[#6C3B73] font-semibold shadow-md transition-all hover:scale-105">
          🍼 บันทึกการดูดนมเพิ่มเติม
        </button>
      </Link>

      {/* คำเตือน */}
      {feedingAlert && (
        <div className="w-full px-4">
          <div
            className={`rounded-lg px-4 py-3 text-sm shadow-sm mb-2 ${
              feedingAlert.includes("น้อยกว่า")
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <strong>คำแนะนำ:</strong> {feedingAlert}
          </div>
        </div>
      )}

      {/* ตาราง */}
      <BabyTable
        columns={["อายุของทารก (วัน)", "รวมเวลานาทีต่อวัน", "จำนวนครั้งต่อวัน", "Actions"]}
        data={tableData}
      />

      {/* กราฟ */}
      {rows.length > 0 && (
        <PinkGraph
          data={graphData}
          lines={[
            { dataKey: "times", color: "#FF66C4", label: "จำนวนครั้งต่อวัน" },
            { dataKey: "minutes", color: "#CB6CE6", label: "รวมนาทีต่อวัน" },
          ]}
        />
      )}

      {/* ข้อความปิดท้าย */}
      <h1 className="text-lg text-[#E2A9F1] font-medium mt-4">
        ให้นมแม่สม่ำเสมอช่วยให้ลูกน้อยแข็งแรง 💕
      </h1>
      <img src="/src/assets/weight/milk.jpg" alt="breastfeeding info" className="rounded-lg shadow-md" />
    </div>
  );
};

export default SucklingBreasts;
