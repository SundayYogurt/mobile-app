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
  const [displayMs, setDisplayMs] = useState(0); // เวลาแสดงผลขณะ session ยังรันอยู่
  const [sessionAccumulatedMs, setSessionAccumulatedMs] = useState(0); // เวลาสะสมของ session ปัจจุบัน
  const [sessionCount, setSessionCount] = useState(0); // จำนวนรอบใน session ปัจจุบัน
  const [baseCountToday, setBaseCountToday] = useState(0); // จำนวนครั้งที่บันทึกไว้ก่อนหน้าในวันนี้
  const [baseMinutesToday, setBaseMinutesToday] = useState(0); // เวลานาทีที่บันทึกไว้ก่อนหน้าในวันนี้
  const startAtRef = useRef(null);

  const uidMemo = useMemo(() => user?.userId ?? user?.id ?? user?.sub, [user]);
  const selMemo = useMemo(() => (uidMemo ? SelectedBabyService.get(uidMemo) : null), [uidMemo]);

  // คำนวณเวลาที่แสดงบนหน้าจอทุก 1 วิ
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

  const todayKey = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // โหลดข้อมูลที่บันทึกไว้ของวันปัจจุบัน
  useEffect(() => {
    if (!uidMemo || !selMemo?.id) return;
    const list = FeedingService.getHistory(uidMemo, selMemo.id);
    const today = list.find((r) => r.date === todayKey());
    setBaseCountToday(Number(today?.count || 0));
    setBaseMinutesToday(Number(today?.minutes || 0));
  }, [uidMemo, selMemo?.id]);

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
    } catch (e) {
      info("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
      return false;
    }
  };

  const handleSave = async () => {
    const ok = await ensureLogin();
    if (!ok) return;
    if (running) {
      info("โปรดหยุดจับเวลาก่อนบันทึก");
      return;
    }
    const durationMinutes = Math.max(0, Math.round(sessionAccumulatedMs / 60000));
    if (durationMinutes <= 0 && sessionCount <= 0) {
      info("ยังไม่มีเวลาหรือจำนวนครั้งสำหรับวันนี้");
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
      await BabyService.recordBabyFeeding(babyId, { durationMinutes, userId: uid });
      success("บันทึกการให้นมสำเร็จ");

      // รวมข้อมูลวันนี้กลับเข้า local history
      const merged = FeedingService.mergeToday(uid, babyId, {
        date: todayKey(),
        addCount: sessionCount,
        addMinutes: durationMinutes,
      });
      const today = merged.find((r) => r.date === todayKey());
      setBaseCountToday(Number(today?.count || 0));
      setBaseMinutesToday(Number(today?.minutes || 0));

      resetTimer();
      navigate("/suckingBreasts");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "";
      info(msg || "บันทึกไม่สำเร็จ");
    }
  };

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center mt-7 relative z-10 gap-4">
        <div className="relative">
          <button className="btn rounded-xl bg-white w-fit text-[22px] font-medium shadow-xl btn-ghost h-[52px]">
            <CiCircleAlert className="w-[30px] h-[30px]" /> คำแนะนำการให้นม
          </button>
        </div>

        <div className="absolute -mt-170 mr-150 text-3xl text-[#e3a9f1d7]">close</div>
        <div className="absolute -mt-30 mr-150 text-3xl text-[#e3a9f1d7]">face</div>
        <div className="absolute -mt-170 -mr-150 text-3xl text-[#e3a9f1d7]">straight</div>
        <div className="absolute -mt-30 -mr-150 text-3xl text-[#e3a9f1d7]">support</div>

        <div className="rounded-full bg-[#E2A9F1] w-[200px] h-[200px] flex items-center justify-center mt-4">
          <img src="/src/assets/save/breastfeeding.png" className="w-[144px] h-[144px]" />
        </div>

        <h1 className="text-[30px] font-medium mt-6">บันทึกการให้นม</h1>

        <button
          onClick={toggleTimer}
          className="btn hover:bg-[#e3a9f1d7] text-[30px] rounded-full bg-[#EFB8FF] w-[100px] h-[100px] flex items-center justify-center mt-5 font-light"
        >
          {running ? "stop" : "start"}
        </button>

        <div className="flex gap-3 items-center mt-5">
          <div className="flex border border-gray-300 rounded-md w-[228px] h-[61px] items-center justify-center text-2xl tracking-wide">
            {formatTime(displayMs)}
            <button onClick={resetTimer} className="btn btn-outline btn-sm ml-5">
              reset
            </button>
          </div>
        </div>

        {/* ✅ แสดงจำนวนครั้งและนาทีต่อวัน */}
        <div className="text-sm text-gray-600 mt-2">
          จำนวนครั้งวันนี้: {baseCountToday + sessionCount} ครั้ง, รวมเวลา:{" "}
          {Math.round((baseMinutesToday * 60000 + sessionAccumulatedMs) / 60000)} นาที
        </div>

        <button
          onClick={handleSave}
          className="btn hover:bg-[#e3a9f1d7] text-[30px] font-light rounded-[20px] bg-[#EFB8FF] w-[400px] h-[50px] flex items-center justify-center mt-5 text-white"
        >
          บันทึก
        </button>
      </div>
    </>
  );
};
