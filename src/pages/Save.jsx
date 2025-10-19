import React, { useEffect, useState } from "react";
import { CiCircleAlert } from "react-icons/ci";

export const Save = () => {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    let id;
    if (running) {
      const startAt = Date.now() - elapsedMs;
      id = setInterval(() => {
        setElapsedMs(Date.now() - startAt);
      }, 1000);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [running]);

  const toggleTimer = () => setRunning((v) => !v);
  const resetTimer = () => {
    setRunning(false);
    setElapsedMs(0);
  };

  const formatTime = (ms) => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center mt-7 relative z-10 gap-4">
        <div className="relative">
          <button className="btn rounded-xl bg-white w-fit text-[22px] font-medium shadow-xl btn-ghost h-[52px]">
            <CiCircleAlert className="w-[30px] h-[30px]" /> เช็คท่าก่อนดูด
          </button>
        </div>
        <div className="absolute left-1 mb-130 ml-10 text-4xl text-[#e3a9f1d7]">
          close 
          </div>
          <div className="absolute right-1 mb-130 mr-5 text-4xl text-[#e3a9f1d7]">
          straight 
          </div>
          <div className="absolute left-1 mb-10 ml-10 text-4xl text-[#e3a9f1d7]">
          face 
          </div>
          <div className="absolute right-1 mb-10 mr-5 text-4xl text-[#e3a9f1d7]">
          support
          </div>
          <div className="rounded-full bg-[#E2A9F1] w-[200px] h-[200px] flex items-center justify-center mt-15 ">
            <img
              src="/assets/save/breastfeeding.png"
              className="w-[144px] h-[144px]"
            />
          </div>
        

        <h1 className="text-[30px] font-medium mt-10">บันทึกเวลาให้นม</h1>

        <button
          onClick={toggleTimer}
          className="btn hover:bg-[#e3a9f1d7] text-[30px] rounded-full bg-[#EFB8FF] w-[100px] h-[100px] flex items-center justify-center mt-5t font-light"
        >
          {running ? "stop" : "start"}
        </button>

        {/* บรรทัดที่ 24: ฟังก์ชันจับเวลา แสดงผลที่นี่ */}
        <div className="flex gap-3 items-center mt-5">
          <div className="flex border border-gray-300 rounded-md w-[228px] h-[61px] items-center justify-center text-2xl tracking-wide">
            {formatTime(elapsedMs)}
            <button
              onClick={resetTimer}
              className="btn btn-outline btn-sm ml-5"
            >
              reset
            </button>
          </div>
        </div>

        <button className="btn hover:bg-[#e3a9f1d7] text-[30px] font-light rounded-[20px] bg-[#EFB8FF] w-[400px] h-[50px] flex items-center justify-center mt-5 text-white">
          บันทึก
        </button>
      </div>
    </>
  );
};
