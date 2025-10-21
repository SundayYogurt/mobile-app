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
  const [rows, setRows] = useState([]); // [{id, date, weight}]
  const [weight, setWeight] = useState([]);
  const [weightWarning, setWeightWarning] = useState({ show: false, level: "", percent: 0 });
  const uid = useMemo(() => user?.userId ?? user?.id ?? user?.sub, [user]);
  const selected = useMemo(() => (uid ? SelectedBabyService.get(uid) : null), [uid]);
  const [birthWeight, setBirthWeight] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await BabyService.showBabyWeightLogs(selected?.id);
        setWeight(response.status === 200 ? response.data : []);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
          text:
            error.response?.data?.message ||
            error.message ||
            "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
          confirmButtonText: "ตกลง",
        });
      }
    };
    fetchData();
  }, []);

  const labeledData = useMemo(() => {
    const sorted = rows.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.map((r, i) => ({ name: `วัน ${i + 1}`, weight: r.weight }));
  }, [rows]);

  const tableData = useMemo(() => {
    const sorted = rows.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.map((r, i) => {
      const base = {
        วัน: `วัน ${i + 1}`,
        "น้ำหนัก (g)": r.weight,
        สถานะ: r.status || "",
      };

      // ✅ popup แก้ไขน้ำหนักแบบ SweetAlert2
      const editBtn = (
        <button
          className="btn btn-xs bg-[#E2A9F1] text-white"
          onClick={async () => {
            const { value: grams } = await Swal.fire({
              title: "แก้ไขน้ำหนัก",
              input: "number",
              inputLabel: "กรอกน้ำหนักใหม่ (กรัม)",
              inputValue: r.weight,
              inputAttributes: {
                min: 1,
                step: 1,
              },
              showCancelButton: true,
              confirmButtonText: "บันทึก",
              cancelButtonText: "ยกเลิก",
              confirmButtonColor: "#E2A9F1",
              cancelButtonColor: "#aaa",
              background: "#fff",
              color: "#333",
              inputValidator: (value) => {
                if (!value || isNaN(value) || value <= 0) {
                  return "กรุณากรอกค่าน้ำหนักให้ถูกต้อง";
                }
              },
            });

            if (!grams) return;

            try {
              await BabyService.updateBabyWeightLog(selected.id, r.id, {
                currentWeight: Number(grams),
                userId: uid,
              });
              await loadLogs();
              success("อัปเดตน้ำหนักเรียบร้อยแล้ว");
            } catch (err) {
              const msg = err?.response?.data?.message || err?.message || "";
              info(msg || "อัปเดตไม่สำเร็จ");
            }
          }}
        >
          แก้ไข
        </button>
      );

      if (!birthWeight) return { ...base, Actions: editBtn };

      const pct = ((birthWeight - r.weight) / birthWeight) * 100;
      const pctText = `${pct.toFixed(1)}%`;
      let advice = "";
      if (pct >= 7) advice = "ควรพบแพทย์";
      else if (pct >= 5) advice = "ควรกระตุ้นการดูดนมทุก 2 ชั่วโมง";

      return {
        ...base,
        "ลดจากแรกเกิด (%)": pctText,
        ...(advice ? { คำแนะนำ: advice } : {}),
        Actions: editBtn,
      };
    });
  }, [rows, birthWeight]);

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
          date:
            it?.date ||
            it?.createdAt ||
            it?.created_at ||
            it?.logDate ||
            new Date().toISOString().slice(0, 10),
          weight:
            Number(it?.weight ?? it?.currentWeight ?? it?.value ?? it?.grams) ||
            0,
          status: it?.gainStatus?.status ?? it?.status ?? "",
        }))
        .filter((r) => r.weight > 0);
      setRows(mapped);
    } catch (e) {
    }
  };

  useEffect(() => {
    loadLogs();
  }, [uid, selected?.id]);

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
      } catch {}
    };
    run();
  }, [uid, selected?.id]);

  useEffect(() => {
    if (!rows.length) {
      setWeightWarning({ show: false, level: "", percent: 0 });
      return;
    }

    const numericBirth = Number(birthWeight);
    if (!Number.isFinite(numericBirth) || numericBirth <= 0) {
      setWeightWarning({ show: false, level: "", percent: 0 });
      return;
    }

    const sorted = rows.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    const latest = sorted[sorted.length - 1];
    const current = Number(latest?.weight);
    if (!Number.isFinite(current) || current <= 0) {
      setWeightWarning({ show: false, level: "", percent: 0 });
      return;
    }

    const pct = ((numericBirth - current) / numericBirth) * 100;
    if (pct >= 7) {
      setWeightWarning({ show: true, level: "sev", percent: Number(pct.toFixed(1)) });
    } else if (pct >= 5) {
      setWeightWarning({ show: true, level: "mod", percent: Number(pct.toFixed(1)) });
    } else {
      setWeightWarning({ show: false, level: "", percent: 0 });
    }
  }, [birthWeight, rows]);

  const onWeightClick = async () => {
    if (!uid || !selected?.id) {
      info("กรุณาเลือกเด็กก่อนทำรายการ");
      return;
    }
    if (hasToday) {
      info("วันนี้บันทึกแล้ว โปรดแก้ไขรายการเดิมหากต้องการเปลี่ยน");
      return;
    }
    const result = await weightAlert({
      title: "บันทึกน้ำหนัก (กรัม)",
      birthWeight,
      lockBirth: Boolean(birthWeight),
    });
    if (result) {
      try {
        await BabyService.recordBabyWeight(selected.id, {
          currentWeight: result.currentWeight,
          userId: uid,
        });
        await loadLogs();
        success("บันทึกน้ำหนักสำเร็จ");
      } catch (e) {
        info("บันทึกไม่สำเร็จ");
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
      {weightWarning.show && (
        <div className="w-full max-w-[640px] mx-auto px-4">
          <div className="text-[#6C3B73] text-sm font-semibold mb-2">คำเตือนสำคัญ</div>
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
            {typeof weightWarning.percent === "number" && weightWarning.percent > 0 && (
              <span> (ลด {weightWarning.percent}%)</span>
            )}
          </div>
        </div>
      )}

      <button
        onClick={onWeightClick}
        className="btn rounded-xl bg-[#F5D8EB] text-xl font-light w-full"
      >
        บันทึกน้ำหนัก
      </button>

      <BabyTable
        columns={[
          "วัน",
          "น้ำหนัก (g)",
          ...(birthWeight ? ["ลดจากแรกเกิด (%)", "คำแนะนำ"] : []),
          "Actions",
        ]}
        data={tableData}
      />

      {birthWeight !== undefined && (
        <div className="w-full text-sm text-gray-600">
          น้ำหนักแรกเกิด: {birthWeight} g
        </div>
      )}

      <PinkGraph
        data={labeledData}
        lines={[{ dataKey: "weight", color: "#FF66C4", label: "น้ำหนัก (g)" }]}
      />

      {/* ✅ แสดงสถานะล่าสุด */}
      <h1 className="text-lg text-[#E2A9F1] font-medium">
        {weight?.data?.at(-1)?.gainStatus?.status}
      </h1>

      <div>
        <img src="/src/assets/weight/weight.jpg" alt="weight" />
      </div>
    </div>
  );
};

export default Weight;
