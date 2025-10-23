import React, { useEffect, useMemo, useState } from "react";
import PinkGraph from "../components/PinkGraph";
import { weightAlert } from "../utils/weightAlert";
import { info, success } from "../utils/alert";
import BabyTable from "../components/BabyTable";
import { useAuthContext } from "../context/AuthContext";
import SelectedBabyService from "../services/SelectedBabyService";
import BabyService from "../services/BabyService";
import Swal from "sweetalert2";

const Weight = () => {
  const { user } = useAuthContext();
  const [rows, setRows] = useState([]);
  const [weight, setWeight] = useState([]);
  const [weightWarning, setWeightWarning] = useState({
    show: false,
    level: "",
    percent: 0,
  });
  const uid = useMemo(() => user?.userId ?? user?.id ?? user?.sub, [user]);
  const selected = useMemo(
    () => (uid ? SelectedBabyService.get(uid) : null),
    [uid]
  );
  const [birthWeight, setBirthWeight] = useState();
  const [birthDate, setBirthDate] = useState(null);

  // โหลดข้อมูลน้ำหนักทั้งหมด
  const loadLogs = async () => {
    if (!uid || !selected?.id) return;
    try {
      const res = await BabyService.showBabyWeightLogs(selected.id);
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
          daysAt: Number(it?.daysAt ?? idx + 1),
          weight:
            Number(it?.weight ?? it?.currentWeight ?? it?.value ?? it?.grams) ||
            0,
          status: it?.gainStatus?.status ?? it?.status ?? "",
        }))
        .filter((r) => r.weight > 0);

      setRows(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [uid, selected?.id]);

  const labeledData = useMemo(() => {
    const sorted = rows.slice().sort((a, b) => a.daysAt - b.daysAt);
    return sorted.map((r) => ({
      name: `วันที่ ${r.daysAt}`,
      weight: r.weight,
    }));
  }, [rows]);

  const tableData = useMemo(() => {
    const dataByDay = rows.reduce((acc, row) => {
      acc[row.daysAt] = row;
      return acc;
    }, {});

    return Array.from({ length: 14 }, (_, i) => {
      const ageDay = i + 1;
      const rowData = dataByDay[ageDay];

      if (rowData) {
        const weightVal = rowData.weight;
        const pct =
          birthWeight && weightVal
            ? ((birthWeight - weightVal) / birthWeight) * 100
            : 0;

        let advice = "";
        if (pct >= 7) advice = "ควรพบแพทย์";
        else if (pct >= 5) advice = "ควรกระตุ้นการดูดนมทุก 2 ชั่วโมง";

        return {
          daysAt: ageDay,
          "น้ำหนัก (g)": weightVal,
          ...(birthWeight ? { "ลดจากแรกเกิด (%)": `${pct.toFixed(1)}%` } : {}),
          ...(birthWeight ? { คำแนะนำ: advice || "-" } : {}),
          Actions: (
            <button
              className="inline-flex items-center justify-center 
             bg-gradient-to-r from-[#F5D8EB] to-[#F8CFE5] 
             hover:from-[#f782c0] hover:to-[#ff6bbf]
             text-[#6C3B73] font-semibold text-xs 
             px-3 py-[6px] rounded-full shadow-md 
             transition-all duration-200 
             whitespace-nowrap 
             hover:scale-105 active:scale-95 w-full"
              onClick={async () => {
                const { value: grams } = await Swal.fire({
                  title: `แก้ไขน้ำหนักวันที่ ${ageDay}`,
                  input: "number",
                  inputValue: weightVal,
                  showCancelButton: true,
                  confirmButtonText: "บันทึก",
                  cancelButtonText: "ยกเลิก",
                  confirmButtonColor: "#C266A4", // Darker pink
                  cancelButtonColor: "#aaa", // Default grey
                });

                if (!grams) return;
                try {
                  await BabyService.updateBabyWeightLog(
                    selected.id,
                    rowData.id,
                    {
                      currentWeight: Number(grams),
                      userId: uid,
                      daysAt: ageDay,
                    }
                  );
                  await loadLogs();
                  success("อัปเดตน้ำหนักเรียบร้อยแล้ว");
                } catch {
                  info("อัปเดตไม่สำเร็จ");
                }
              }}
            >
              แก้ไข
            </button>
          ),
        };
      }

      return {
        daysAt: ageDay,
        "น้ำหนัก (g)": "-",
        ...(birthWeight ? { "ลดจากแรกเกิด (%)": "-" } : {}),
        ...(birthWeight ? { คำแนะนำ: "-" } : {}),
        Actions: (
          <button
            className="inline-flex items-center justify-center 
             bg-gradient-to-r from-[#F5D8EB] to-[#F8CFE5] 
             hover:from-[#FF9ED1] hover:to-[#FF80C8]
             text-[#6C3B73] font-semibold text-xs 
             px-3 py-[6px] rounded-full shadow-md 
             transition-all duration-200 
             whitespace-nowrap 
             hover:scale-105 active:scale-95"
            onClick={async () => {
              const result = await weightAlert({
                title: `เพิ่มน้ำหนักวันที่ ${ageDay}`,
                birthWeight,
                lockBirth: Boolean(birthWeight),
              });

              if (result) {
                try {
                  await BabyService.recordBabyWeight(selected.id, {
                    currentWeight: result.currentWeight,
                    userId: uid,
                    daysAt: ageDay,
                  });
                  await loadLogs();
                  success("เพิ่มน้ำหนักสำเร็จ");
                } catch {
                  info("เพิ่มไม่สำเร็จ");
                }
              }
            }}
          >
            💕 เพิ่มน้ำหนัก
          </button>
        ),
      };
    });
  }, [rows, birthWeight, uid, selected?.id]);

  useEffect(() => {
    const run = async () => {
      if (!uid || !selected?.id) return;
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
        const bw =
          found?.birthWeight ?? found?.weightAtBirth ?? found?.birth_weight;
        if (typeof bw === "number" && bw > 0) setBirthWeight(bw);
        const bd = found?.birthday ?? found?.dob;
        if (bd) setBirthDate(new Date(bd));
      } catch {}
    };
    run();
  }, [uid, selected?.id]);

  return (
    <div className="w-full flex flex-col items-center justify-center mt-8 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
      {/* 💖 หัวข้อด้านบน */}
      <div className="flex flex-col items-center text-center mb-4">
        <img
          src="/src/assets/love.png"
          alt="icon"
          className="w-16 h-16 animate-pulse mb-2"
        />
        <h1 className="text-3xl font-bold text-[#FF66C4] drop-shadow-sm">
          บันทึกน้ำหนักทารก 💕
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          ติดตามน้ำหนักลูกน้อยของคุณทุกวันเพื่อสุขภาพที่แข็งแรง 🌸
        </p>
      </div>

      {/* คำเตือน */}
      {weightWarning.show && (
        <div className="w-full max-w-[640px] mx-auto px-4">
          <div className="text-[#6C3B73] text-sm font-semibold mb-2">
            คำเตือนสำคัญ
          </div>
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
            {typeof weightWarning.percent === "number" &&
              weightWarning.percent > 0 && (
                <span> (ลด {weightWarning.percent}%)</span>
              )}
          </div>
        </div>
      )}

      {/* ตาราง */}
      <BabyTable
        columns={[
          { key: "daysAt", label: "อายุของทารก (วัน)" },
          "น้ำหนัก (g)",
          ...(birthWeight ? ["ลดจากแรกเกิด (%)", "คำแนะนำ"] : []),
          "Actions",
        ]}
        data={tableData}
      />

      {/* ข้อมูลเพิ่มเติม */}
      {birthWeight !== undefined && (
        <div className="w-full text-sm text-gray-600 text-center">
          น้ำหนักแรกเกิด:{" "}
          <span className="font-semibold text-[#6C3B73]">{birthWeight} g</span>
        </div>
      )}

      {/* กราฟ */}
      <PinkGraph
        data={labeledData}
        lines={[{ dataKey: "weight", color: "#FF66C4", label: "น้ำหนัก (g)" }]}
      />

      {/* สถานะล่าสุด */}
      <h1 className="text-lg text-[#E2A9F1] font-medium">
        {weight?.data?.at(-1)?.gainStatus?.status}
      </h1>

      {/* รูป */}
      <div>
        <img src="/src/assets/weight/weight.jpg" alt="weight" />
      </div>
    </div>
  );
};

export default Weight;
