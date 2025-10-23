import React, { useEffect, useMemo, useState } from "react";
import PinkGraph from "../components/PinkGraph";
import { countPerDayAlert } from "../utils/countAlert";
import { info, success } from "../utils/alert";
import BabyTable from "../components/BabyTable";
import { useAuthContext } from "../context/AuthContext";
import SelectedBabyService from "../services/SelectedBabyService";
import BabyService from "../services/BabyService";
import Swal from "sweetalert2";

const Urine = () => {
  const { user } = useAuthContext();
  const [rows, setRows] = useState([]);
  const uid = useMemo(() => user?.userId ?? user?.id ?? user?.sub, [user]);
  const selected = useMemo(() => (uid ? SelectedBabyService.get(uid) : null), [uid]);

  // ✅ โหลดข้อมูลจาก backend
  const loadLogs = async () => {
    if (!uid || !selected?.id) return;
    try {
      const res = await BabyService.showBabyPeeLogs(selected.id);
      const raw =
        Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
      const mapped = raw.map((it, idx) => ({
        id: it?.id ?? idx,
        daysAt: Number(it?.daysAt ?? idx + 1),
        times: Number(it?.totalPee ?? it?.peeCount ?? it?.value ?? 0) || 0,
        checkPee: it?.checkPee || "",
      }));
      setRows(mapped);
    } catch {
      info("โหลดข้อมูลไม่สำเร็จ");
    }
  };

  useEffect(() => {
    loadLogs();
  }, [uid, selected?.id]);

  // ✅ สร้างตาราง 14 แถวเสมอ
  const tableData = useMemo(() => {
    const dataByDay = rows.reduce((acc, row) => {
      acc[row.daysAt] = row;
      return acc;
    }, {});

    return Array.from({ length: 14 }, (_, i) => {
      const day = i + 1;
      const rowData = dataByDay[day];

      if (rowData) {
        return {
          daysAt: `วันที่ ${day}`,
          "จำนวนครั้ง": rowData.times,
          Actions: (
            <button
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#F5D8EB] to-[#F8CFE5] hover:from-[#f782c0] hover:to-[#ff6bbf] text-[#6C3B73] font-semibold text-xs px-3 py-[6px] rounded-full shadow-md transition-all whitespace-nowrap hover:scale-105 active:scale-95"
              onClick={async () => {
                const { value: count } = await Swal.fire({
                  title: `แก้ไขจำนวนวันที่ ${day}`,
                  input: "number",
                  inputValue: rowData.times,
                  showCancelButton: true,
                  confirmButtonText: "บันทึก",
                  cancelButtonText: "ยกเลิก",
                  confirmButtonColor: "#C266A4", // Darker pink
                  cancelButtonColor: "#aaa", // Default grey
                });
                if (!count) return;
                try {
                  await BabyService.updateBabyPeeLog(selected.id, rowData.id, {
                    totalPee: Number(count),
                    userId: uid,
                    daysAt: day,
                  });
                  await loadLogs();
                  success("อัปเดตสำเร็จ");
                } catch {
                  info("อัปเดตไม่สำเร็จ");
                }
              }}
            >
              ✏️ แก้ไข
            </button>
          ),
        };
      }

      return {
        daysAt: `วันที่ ${day}`,
        "จำนวนครั้ง": "-",
        Actions: (
          <button
            className="inline-flex items-center justify-center bg-gradient-to-r from-[#F5D8EB] to-[#F8CFE5] hover:from-[#FF9ED1] hover:to-[#FF80C8] text-[#6C3B73] font-semibold text-xs px-3 py-[6px] rounded-full shadow-md transition-all whitespace-nowrap hover:scale-105 active:scale-95"
            onClick={async () => {
              const result = await countPerDayAlert({
                title: `เพิ่มปัสสาวะวันที่ ${day}`,
                label: "จำนวนครั้งต่อวัน",
              });
              if (result) {
                try {
                  await BabyService.recordBabyPeeing(selected.id, {
                    totalPee: result.count,
                    userId: uid,
                    daysAt: day,
                  });
                  await loadLogs();
                  success("เพิ่มข้อมูลสำเร็จ");
                } catch {
                  info("เพิ่มไม่สำเร็จ");
                }
              }
            }}
          >
            💧 เพิ่มข้อมูล
          </button>
        ),
      };
    });
  }, [rows]);

  const latestCheck = rows.at(-1)?.checkPee || "";

  return (
    <div className="w-full flex flex-col items-center justify-center mt-8 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
      {/* 💖 หัวข้อ */}
      <div className="flex flex-col items-center text-center mb-4">
        <img src="/src/assets/love.png" alt="icon" className="w-16 h-16 animate-pulse mb-2" />
        <h1 className="text-3xl font-bold text-[#FF66C4] drop-shadow-sm">บันทึกปัสสาวะ 💧</h1>
        <p className="text-gray-500 text-sm mt-1">
          บันทึกจำนวนครั้งที่ลูกน้อยปัสสาวะในแต่ละวันเพื่อดูแลสุขภาพของเขา 🌸
        </p>
      </div>

      {/* 📋 ตาราง */}
      <BabyTable
        columns={[{ key: "daysAt", label: "อายุของทารก (วัน)" }, "จำนวนครั้ง", "Actions"]}
        data={tableData}
      />

      {/* 📈 กราฟ */}
      <PinkGraph
        data={rows.map((r) => ({
          name: `วัน ${r.daysAt}`,
          times: r.times,
        }))}
        lines={[{ dataKey: "times", color: "#FF66C4", label: "ครั้ง/วัน" }]}
      />

      {/* 💡 คำแนะนำ */}
      {latestCheck && (
        <div
          className={`w-full text-sm text-center mt-4 px-4 py-3 rounded-xl shadow-sm border ${
            latestCheck.includes("น้อยกว่าปกติ")
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-green-50 border-green-200 text-green-700"
          }`}
        >
          <strong>ผลวิเคราะห์ล่าสุด:</strong> {latestCheck}
        </div>
      )}

      {/* 🌸 รูปภาพ */}
      <img src="/src/assets/PP/pp.jpg" alt="baby" className="rounded-xl shadow-md" />
    </div>
  );
};

export default Urine;
