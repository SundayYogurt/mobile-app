
import React from "react";
import LoginCarousel from "../components/LoginCarousel";
import { Link } from "react-router";
const BabyHealth = () => {
  return (
    <div className="flex flex-col items-center justify-start mt-[-50px] h-auto">
      {/* ✅ Carousel อยู่ด้านบน */}
      <LoginCarousel />

      {/* ✅ ปุ่มต่อจาก Carousel */}
      <div className="w-full flex flex-col items-center justify-center mt-7 relative z-10 gap-5 px-6 max-w-[440px] mx-auto">
        
        {/* ปุ่ม: น้ำหนักของทารก */}
        <Link to="/weight" className="w-full">
          <div className="relative w-full flex justify-center items-center">
            <button className="btn rounded-xl bg-[#ff66c450] w-full h-[70px] text-[26px] font-medium">
              น้ำหนักของทารก
            </button>
          </div>
        </Link>

        {/* ปุ่ม: จำนวนครั้งที่ลูกดูดนม  */}
        <Link to="/suckingBreasts" className="w-full">
          <div className="relative w-full flex justify-center items-center">
            
            <button className="btn rounded-xl bg-[#E2A9F175] w-full h-[70px] text-[26px] font-medium">
              จำนวนครั้งที่ลูกดูดนม
            </button>
          </div>
        </Link>

      
        {/* ปุ่ม: Contact */}
        <Link to="/urine" className="w-full">
          <div className="relative w-full flex justify-center items-center">
 
            <button className="btn rounded-xl bg-[#CB6CE670] w-full h-[70px] text-[26px] font-medium">
              จำนวนครั้งที่ลูกถ่ายปัสสาวะ
            </button>
          </div>
        </Link>

        {/* ปุ่ม: จำนวนครั้งที่ลูกถ่ายอุจจาระ */}
        <Link to="/poop" className="w-full">
          <div className="relative w-full flex justify-center items-center">

            <button className="btn rounded-xl bg-[#FF66C450] w-full h-[70px] text-[26px] font-medium">
              จำนวนครั้งที่ลูกถ่ายอุจจาระ
            </button>
          </div>
        </Link>


      </div>
    </div>
  );
};

export default BabyHealth