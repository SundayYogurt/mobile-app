import React from "react";
import LoginCarousel from "../components/LoginCarousel";
import { Link } from "react-router";

export const Home = () => {
  return (
    <div className="flex flex-col items-center justify-start mt-[-50px] h-auto">
      {/* ✅ Carousel อยู่ด้านบน */}
      <LoginCarousel />

      {/* ✅ ปุ่มต่อจาก Carousel */}
      <div className="w-full flex flex-col items-center justify-center mt-7 relative z-10 gap-5 px-6 max-w-[440px] mx-auto">
        
        {/* ปุ่ม: บันทึก */}
        <Link to="/save" className="w-full">
          <div className="relative w-full flex justify-center items-center">
            <img
              src="/src/assets/home/save.png"
              className="absolute left-[-20px] w-[80px] h-[80px] rotate-[-15deg]"
              alt="save icon"
            />
            <button className="btn rounded-xl bg-[#ff66c450] w-full h-[70px] text-[26px] font-medium">
              บันทึก
            </button>
          </div>
        </Link>

        {/* ปุ่ม: Baby Health */}
        <Link to="/baby-health" className="w-full">
          <div className="relative w-full flex justify-center items-center">
            <img
              src="/src/assets/home/heath.png"
              className="absolute right-[-20px] w-[80px] h-[80px] rotate-[15deg]"
              alt="health icon"
            />
            <button className="btn rounded-xl bg-[#E2A9F175] w-full h-[70px] text-[26px] font-medium">
              Baby Health
            </button>
          </div>
        </Link>

        {/* ปุ่ม: ความรู้ */}
        <Link to="/knowledge" className="w-full">
          <div className="relative w-full flex justify-center items-center">
            <img
              src="/src/assets/home/knowledge.png"
              className="absolute left-[-20px] w-[80px] h-[80px] rotate-[-15deg]"
              alt="knowledge icon"
            />
            <button className="btn rounded-xl bg-[#FF66C450] w-full h-[70px] text-[26px] font-medium">
              ความรู้
            </button>
          </div>
        </Link>

        {/* ปุ่ม: Contact */}
        <Link to="/contact" className="w-full">
          <div className="relative w-full flex justify-center items-center">
            <img
              src="/src/assets/home/contact.png"
              className="absolute right-[-20px] w-[70px] h-[70px] rotate-[15deg]"
              alt="contact icon"
            />
            <button className="btn rounded-xl bg-[#CB6CE670] w-full h-[70px] text-[26px] font-medium">
              Contact
            </button>
          </div>
        </Link>

      </div>
    </div>
  );
};
