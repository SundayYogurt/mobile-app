import React, { useEffect } from "react";
import LoginCarousel from "../components/LoginCarousel";
import { Link } from "react-router";
import { useAuthContext } from "../context/AuthContext";

export const Home = () => {
  const { user } = useAuthContext();

  return (
<>
    
    <div className="flex flex-col items-center justify-start mt-[-50px] h-auto">
      {/* ✅ Carousel อยู่ด้านบน */}
      <LoginCarousel />

      {/* ✅ ปุ่มต่อจาก Carousel */}
      <div className="w-full flex flex-col items-center justify-center mt-7 relative z-10 gap-5 px-6 max-w-[440px] mx-auto">
        <div className="grid grid-cols-2 gap-3 w-full">
          <a href={user ? "https://docs.google.com/forms/d/e/1FAIpQLSd43VXRGRq-hzIVp4cVhS4KIPZhOrHCo5xa-prp19AC02H3IA/viewform" : "#"} target={user ? "_blank" : "_self"}>
          <button className={`btn rounded-xl bg-[#ee0e9850] w-full h-[70px] text-[20px] font-medium ${!user ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!user}>แบบทดสอบถาม Pre-Test</button>
          </a>
         <a href={user ? "https://docs.google.com/forms/d/e/1FAIpQLSeBhbm5PymqpM290yE0oMxX96Lbok2Gl4IkYpOKc_v_eaXHug/viewform" : "#"} target={user ? "_blank" : "_self"}>
          <button className={`btn rounded-xl bg-[#e0569065] w-full h-[70px] text-[20px] font-medium ${!user ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!user}>แบบทดสอบถาม Post-Test</button>
          </a>
          </div>
         
        {/* ปุ่ม: บันทึก */}
        <Link to={user ? "/save" : "#"} className={`w-full ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <div className="relative w-full flex justify-center items-center">
            <img
              src="/src/assets/home/save.png"
              className="absolute left-[-20px] w-[80px] h-[80px] rotate-[-15deg]"
              alt="save icon"
            />
            <button className="btn rounded-xl bg-[#ff66c450] w-full h-[70px] text-[26px] font-medium" disabled={!user}>
              บันทึก
            </button>
          </div>
        </Link>

        {/* ปุ่ม: Baby Health */}
        <Link to={user ? "/baby-health" : "#"} className={`w-full ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <div className="relative w-full flex justify-center items-center">
            <img
              src="/src/assets/home/heath.png"
              className="absolute right-[-20px] w-[80px] h-[80px] rotate-[15deg]"
              alt="health icon"
            />
            <button className="btn rounded-xl bg-[#E2A9F175] w-full h-[70px] text-[26px] font-medium" disabled={!user}>
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

                {/* ปุ่ม: Profile */}
        <Link to={user ? "/profile" : "#"} className={`w-full ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <button className="btn rounded-xl bg-[#CB6CE670] w-full h-[70px] text-[26px] font-medium" disabled={!user}>
              โปรไฟล์
            </button>
        </Link>

          <a href={user ? "https://forms.gle/RqycqfVNc9ShmGSv5" : "#"} target={user ? "_blank" : "_self"}>
          <button className={`btn rounded-xl bg-[#ff459265] w-full h-[70px] text-[20px] font-medium ${!user ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!user}>แบบประเมินความพึงพอใจ</button>
          </a>

      </div>
    </div>
    </>
  );
};
