import React from "react";
import { Link } from "react-router";

const Knowledge = () => {
  return (
    <>
      <div className="w-full flex flex-col items-center justify-center mt-50 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
        
        {/* ปุ่ม: อาหารสำหรับมารดาหลังคลอด */}
        <Link to="/food" className="w-full">
          <div className="relative w-full flex justify-center items-center">
            <img
              className="absolute left-[-25px] w-[80px] h-[80px] rotate-[-15deg] -mt-4"
              src="/src/assets/knowledge/list.png"
              alt="list"
            />
            <img
              className="absolute right-[-25px] w-[80px] h-[80px] rotate-[15deg] -mt-4"
              src="/src/assets/knowledge/salad.png"
              alt="salad"
            />
            <button className="btn rounded-xl bg-[#ff66c450] w-full h-[70px] text-[26px] font-medium">
              อาหารสำหรับมารดาหลังคลอด
            </button>
          </div>
        </Link>

        {/* ปุ่ม: 4 Steps ดูดเป๊ะ */}
        <Link to="/four-step" className="w-full">
          <div className="relative w-full flex justify-center items-center">
            <img
              className="absolute right-[-25px] w-[80px] h-[80px] rotate-[15deg]"
              src="/src/assets/knowledge/baby.png"
              alt="baby"
            />
            <button className="btn rounded-xl bg-[#E2A9F175] w-full h-[70px] text-[26px] font-medium">
              4 Steps ดูดเป๊ะ
            </button>
          </div>
        </Link>

        {/* ปุ่ม: 4 จุด หยุดปัญหาเต้า */}
        <Link to="/four-point" className="w-full">
          <div className="relative w-full flex justify-center items-center">
            <img
              className="absolute left-[-25px] w-[80px] h-[80px] rotate-[-15deg]"
              src="/src/assets/knowledge/mom.png"
              alt="mom"
            />
            <button className="btn rounded-xl bg-[#FF66C450] w-full h-[70px] text-[26px] font-medium">
              4 จุด หยุดปัญหาเต้า
            </button>
          </div>
        </Link>

        {/* ปุ่ม: ท่านวดเต้านมด้วยตนเอง */}
        <Link to="/posture" className="w-full">
          <div className="relative w-full flex justify-center items-center">
            <img
              className="absolute right-[-20px] w-[70px] h-[70px] rotate-[15deg]"
              src="/src/assets/knowledge/hearth.png"
              alt="heart"
            />
            <button className="btn rounded-xl bg-[#CB6CE670] w-full h-[70px] text-[26px] font-medium">
              ท่านวดเต้านมด้วยตนเอง
            </button>
          </div>
        </Link>
      </div>
    </>
  );
};

export default Knowledge;
