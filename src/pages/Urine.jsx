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
  const todayKey = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }, []);
  const hasToday = useMemo(() => {
    const keyOf = (v) => {
      const src = v?.date || v?.createdAt || v?.created_at || v?.logDate;
      const d = src ? new Date(src) : null;
      if (!d || Number.isNaN(d.getTime())) return null;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    };
    return Array.isArray(logs) && logs.some((l) => keyOf(l) === todayKey);
  }, [logs, todayKey]);

  useEffect(() => {
    loadLogs();
  }, [uid, selected?.id]);

  async function loadLogs() {
    if (!uid || !selected?.id) return;
    try {
      const res = await BabyService.showBabyPeeLogs(selected.id);
      const data = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data?.logs)
        ? res.data.logs
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setLogs(data);
      const mapped = data.map((l, idx) => ({
        name: l?.createdAt ? new Date(l.createdAt).toLocaleDateString() : `Day ${idx + 1}`,
        times: Number(
          l?.totalPee ?? l?.count ?? l?.times ?? l?.peeCount ?? l?.pees ?? l?.value ?? 0
        ) || 0,
      }));
      setRows(mapped);
    } catch (e) {
    }
  }

  async function handleEdit(index) {
    const log = logs[index];
    if (!log) return;
    const id = log?.id ?? log?.logId ?? log?._id ?? index;
    const current = Number(
      log?.totalPee ?? log?.count ?? log?.times ?? log?.peeCount ?? log?.pees ?? log?.value ?? 0
    ) || 1;
    const res = await countPerDayAlert({
      title: "Edit Pee Count",
      label: "Enter new total",
      placeholder: String(current),
      confirmText: "Update",
    });
    if (!res) return;
    try {
      await BabyService.updateBabyPeeLog(selected.id, id, { totalPee: res.count, userId: uid });
      await loadLogs();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "";
      info(msg || "Update failed");
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
      <button
        disabled={hasToday}
        onClick={async () => {
          if (!uid || !selected?.id) {
            info("กรุณาเลือกเด็กก่อนทำรายการ");
            return;
          }
          const res = await countPerDayAlert({
            title: "บันทึกจำนวนปัสสาวะ",
            label: "ระบุจำนวนครั้งต่อวัน",
            placeholder: "เช่น 6",
          });
          if (res) {
            try {
              await BabyService.recordBabyPeeing(selected.id, { totalPee: res.count, userId: uid });
            } catch (e) {
              const msg = e?.response?.data?.message || e?.message || "";
              info(msg || "ไม่สามารถบันทึกจำนวนปัสสาวะได้");
              return;
            }
            success(`บันทึกสำเร็จ\nจำนวนปัสสาวะ: ${res.count} ครั้ง/วัน`);
            await loadLogs();
          }
        }}
        className="btn rounded-xl bg-[#F5D8EB] text-xl font-light w-full"
      >
        บันทึกจำนวนปัสสาวะ
      </button>

      <BabyTable
        columns={[
          { key: "name", label: "วันที่" },
          { key: "times", label: "จำนวนครั้ง" },
          { key: "actions", label: "Actions" },
        ]}
        data={rows.map((row, idx) => ({
          ...row,
          actions: (
            <div className="flex gap-2 justify-center">
              <button className="btn btn-xs bg-[#E2A9F1] text-white" onClick={() => handleEdit(idx)}>
                Edit
              </button>
            </div>
          ),
        }))}
      />
      <PinkGraph data={rows} lines={[{ dataKey: "times", color: "#FF66C4", label: "จำนวนครั้ง" }]} />
    </div>
  );
};

export default Urine;
