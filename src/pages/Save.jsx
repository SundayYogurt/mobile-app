import React, { useEffect, useMemo, useRef, useState } from "react";
import { CiCircleAlert } from "react-icons/ci";
import { useAuthContext } from "../context/AuthContext";
import { loginAlert, success, info } from "../utils/alert";
import SelectedBabyService from "../services/SelectedBabyService";
import BabyService from "../services/BabyService";
import FeedingService from "../services/FeedingService";
import { useNavigate } from "react-router";

export const Save = () => {
  const { user, login } = useAuthContext();
  const navigate = useNavigate();

  const [running, setRunning] = useState(false);
  const [displayMs, setDisplayMs] = useState(0);
  const [sessionAccumulatedMs, setSessionAccumulatedMs] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [baseCountToday, setBaseCountToday] = useState(0);
  const [baseMinutesToday, setBaseMinutesToday] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1); // ✅ อายุวันที่เลือก (1–14)

  const startAtRef = useRef(null);

  const uidMemo = useMemo(() => user?.userId ?? user?.id ?? user?.sub, [user]);
  const selMemo = useMemo(
    () => (uidMemo ? SelectedBabyService.get(uidMemo) : null),
    [uidMemo]
  );

  // ✅ คำนวณวันที่จริงจากอายุวัน (วันที่ 1 = วันเกิด)
  const calcDateFromDaysAt = (birthDate, daysAt) => {
    if (!birthDate) return new Date().toISOString().split("T")[0];
    const date = new Date(birthDate);
    date.setDate(date.getDate() + (daysAt - 1));
    return date.toISOString().split("T")[0];
  };

  const todayKey = () => {
    const now = new Date();
    const bangkokTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const y = bangkokTime.getUTCFullYear();
    const m = String(bangkokTime.getUTCMonth() + 1).padStart(2, "0");
    const d = String(bangkokTime.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // ✅ ตั้งค่า timer
  useEffect(() => {
    const tick = () => {
      const base = sessionAccumulatedMs;
      const extra = startAtRef.current ? Date.now() - startAtRef.current : 0;
      setDisplayMs(base + extra);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sessionAccumulatedMs, running]);

  const toggleTimer = () => {
    if (!running) {
      startAtRef.current = Date.now();
      setSessionCount((c) => c + 1);
      setRunning(true);
    } else {
      if (startAtRef.current) {
        const delta = Date.now() - startAtRef.current;
        setSessionAccumulatedMs((ms) => ms + delta);
      }
      startAtRef.current = null;
      setRunning(false);
    }
  };

  const resetTimer = () => {
    setRunning(false);
    startAtRef.current = null;
    setSessionAccumulatedMs(0);
    setDisplayMs(0);
    setSessionCount(0);
  };

  const formatTime = (ms) => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const ensureLogin = async () => {
    if (user) return true;
    const creds = await loginAlert();
    if (!creds) return false;
    const { username, password } = creds;
    try {
      await login(username, password);
      success("เข้าสู่ระบบสำเร็จ!");
      return true;
    } catch {
      info("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
      return false;
    }
  };

  const handleSave = async () => {
    if (saving) return;
    const ok = await ensureLogin();
    if (!ok) return;

    if (running) {
      info("โปรดหยุดจับเวลาก่อนบันทึก");
      return;
    }

    const durationMinutes = Math.max(0, Math.round(sessionAccumulatedMs / 60000));
    if (durationMinutes <= 0) {
      info("เวลารวมต้องมากกว่า 0 นาที");
      return;
    }

    const uid = uidMemo;
    const selected = selMemo;
    const babyId = selected?.id;
    if (!babyId) {
      info("กรุณาเลือกเด็กก่อนทำรายการ");
      return;
    }

    try {
      setSaving(true);

      const logDate = calcDateFromDaysAt(selected?.birthday, selectedDay);

      await BabyService.recordBabyFeeding(babyId, {
        durationMinutes,
        userId: uid,
        daysAt: selectedDay,
        logDate,
      });

      success("บันทึกการให้นมสำเร็จ");
      resetTimer();
      navigate("/suckingBreasts");
    } catch (e) {
    
      info(e?.response?.data?.message || e.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center mt-7 relative z-10 gap-4 px-6">
      <div className="relative">
        <button className="btn rounded-xl bg-white w-fit text-[22px] font-medium shadow-xl btn-ghost h-[52px]">
          <CiCircleAlert className="w-[30px] h-[30px]" /> เช็คท่าอุ้มก่อนนะคะ 😊
        </button>
      </div>
<div className="absolute  flex items-center justify-center">

  <div className="absolute -top-85 left-25 text-2xl text-[#e3a9f1d7]">straight</div>
  <div className="absolute bottom-25 left-25 text-2xl text-[#e3a9f1d7]">support</div>
  <div className="absolute -top-85 right-30 text-2xl text-[#e3a9f1d7]">close</div>
  <div className="absolute bottom-25 right-30 text-2xl text-[#e3a9f1d7]">face</div>

  {/* เนื้อหาตรงกลาง */}
  {/* <YourCenterContentHere /> */}

      </div>
      {/* รูปภาพ */}
      <div className="rounded-full bg-[#E2A9F1] w-[200px] h-[200px] flex items-center justify-center mt-4 shadow-md">
        <img src="/src/assets/save/breastfeeding.png" className="w-[144px] h-[144px]" />
      </div>


      <h1 className="text-[30px] font-medium mt-6 text-[#6C3B73]">บันทึกการดูดนม</h1>

      {/* ✅ เลือกอายุวัน */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <label className="text-gray-600 text-sm">เลือกอายุของทารก (วัน)</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(Number(e.target.value))}
          className="select select-bordered rounded-xl border-[#E2A9F1] focus:border-[#FF66C4] w-[220px] text-center text-[#6C3B73]"
        >
          {Array.from({ length: 14 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              วันที่ {i + 1}
            </option>
          ))}
        </select>
      </div>

      {/* ปุ่ม start/stop */}
      <button
        onClick={toggleTimer}
        className="btn hover:bg-[#e3a9f1d7] text-[30px] rounded-full bg-[#EFB8FF] w-[100px] h-[100px] flex items-center justify-center mt-5 font-light shadow-md"
      >
        {running ? "stop" : "start"}
      </button>

      {/* เวลา */}
      <div className="flex flex-col gap-3 items-center mt-5">
        <div className="flex border border-gray-300 rounded-md w-[260px] h-[61px] items-center justify-center text-2xl tracking-wide">
          {formatTime(displayMs)}
          <button onClick={resetTimer} className="btn btn-outline btn-sm ml-3">
            reset
          </button>
        </div>

        {/* ปุ่มเทส 1 นาที
        <button
          onClick={() => setSessionAccumulatedMs(60000)}
          className="btn btn-xs bg-[#FFB6E1] text-[#6C3B73] hover:bg-[#ff8fc8] border-none rounded-full shadow-sm"
        >
          เทส 1 นาที
        </button> */}
      </div>

      <div className="text-sm text-gray-600 mt-2">
        อายุวันที่เลือก: {selectedDay} วัน
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`btn text-[24px] font-medium rounded-[20px] w-[380px] h-[50px] flex items-center justify-center mt-5 text-white transition-all ${
          saving
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-[#EFB8FF] to-[#FF66C4] hover:from-[#f782c0] hover:to-[#ff6bbf]"
        }`}
      >
        {saving ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </div>
  );
};
