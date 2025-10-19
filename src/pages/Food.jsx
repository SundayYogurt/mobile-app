import React from "react";

const Food = () => {
  return (
    <>
      <div className="w-full flex flex-col items-center justify-center mt-20 relative z-10 gap-10 ">
        <div className="relative">
          <img
            className="absolute w-[91px] h-[91px] -rotate-20 -mt-20"
            src="/src/assets/knowledge/list.png"
          ></img>
          <img
            className="absolute w-[91px] h-[91px] rotate-20 -mt-18 right-1"
            src="/src/assets/knowledge/salad.png"
          ></img>
          <button className="btn rounded-xl bg-[#ff66c450] w-full h-[70px] text-[30px] font-medium justify-center items-center">
            อาหารสำหรับ มารดาหลังคลอด{" "}
          </button>

          <div className="relative mt-5">
            <img
              className="absolute w-[88px] h-[88px] -rotate-15 mt-18 right-1"
              src="/src/assets/food/maternity.png"
            ></img>
            <div
              role="button"
              tabIndex={0}
              className="btn rounded-xl bg-white shadow-xl w-full text-left font-medium normal-case h-auto min-h-[70px] p-4 whitespace-normal"
            >
              <ul className="list-disc pl-5 text-[18px] leading-6 space-y-1">
                <li>อาหาร 5 หมู่ ครบ 3 มื้อ ควรแบ่งอาหารเป็นมื้อเล็กๆ</li>
                <li>รับประทานระหว่างมื้อ</li>
                <li>ดื่มน้ำให้เพียงพอ</li>
                <li>สมุนไพรเพิ่มน้ำนม</li>
              </ul>
            </div>
          </div>

          <button className="btn rounded-xl bg-[#F5EBFF] w-fit h-13 text-[22px] justify-start font-medium  mt-10">
            อาหารเรียกน้ำนม{" "}
          </button>

          <div
            role="button"
            tabIndex={0}
            className="btn rounded-xl bg-white shadow-xl w-full text-center font-medium normal-case h-auto min-h-[70px] p-4 whitespace-normal mt-10 "
          >
            <img
              className="absolute w-[66px] h-[66px] mt-25 -right-1"
              src="/src/assets/food/pumpkin.png"
            ></img>
            <div className="space-y-2">
              {" "}
              <h1 className="text-[22px]">ฟักทอง</h1>{" "}
              <p className="text-[19px]">
                ช่วยขับน้ำนมและเสริมสร้างระบบภูมิคุ้มกัน
              </p>{" "}
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            className="btn rounded-xl bg-[#FBE2CC4D] shadow-xl w-full text-center font-medium normal-case h-auto min-h-[70px] p-4 whitespace-normal mt-10 "
          >
            <img
              className="absolute w-[97px] h-[97px]  -left-1"
              src="/src/assets/food/chives.png"
            ></img>
            <div className="space-y-2">
              {" "}
              <h1 className="text-[22px]">กุยช่าย</h1>{" "}
              <p className="text-[19px]">ช่วยบำรุงและขับน้ำนม</p>{" "}
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            className="btn rounded-xl bg-[#FBE2CC4D] shadow-xl w-full text-center font-medium normal-case h-auto min-h-[70px] p-4 whitespace-normal mt-10 "
          >
            <img
              className="absolute w-[97px] h-[97px]  -right-1"
              src="/src/assets/food/papaya.png"
            ></img>
            <div className="space-y-2">
              {" "}
              <h1 className="text-[22px]">มะละกอ</h1>{" "}
              <p className="text-[19px]">ช่วยกระตุ้นการผลิตน้ำนม</p>{" "}
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            className="btn rounded-xl bg-[#FBE2CC4D] shadow-xl w-full text-center font-medium normal-case h-auto min-h-[70px] p-4 whitespace-normal mt-10 "
          >
            <img
              className="absolute w-[97px] h-[97px] -mt-25 -left-1"
              src="/src/assets/food/banana.png"
            ></img>
            <div className="space-y-2">
              {" "}
              <h1 className="text-[22px]">หัวปลี</h1>{" "}
              <p className="text-[19px]">
                กระตุ้นการสร้างฮอร์โมน Oxytocin และ Prolactin ช่วยในการผลิตน้ำนม
              </p>{" "}
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            className="btn rounded-xl bg-[#DAE1D84D] shadow-xl w-full text-center font-medium normal-case h-auto min-h-[70px] p-4 whitespace-normal mt-10 "
          >
            <img
              className="absolute w-[97px] h-[97px] -mt-25 -right-1"
              src="/src/assets/food/ginger.png"
            ></img>
            <div className="space-y-2">
              {" "}
              <h1 className="text-[22px]">ขิง</h1>{" "}
              <p className="text-[19px]">
                กระตุ้นการไหลเวียนของเลือดช่วยให้น้ำนมไหลดี
              </p>{" "}
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            className="btn rounded-xl bg-[#FBE2CC4D] shadow-xl w-full text-center font-medium normal-case h-auto min-h-[70px] p-4 whitespace-normal mt-10 "
          >
            <img
              className="absolute w-[97px] h-[97px] -mt-25 -left-1"
              src="/src/assets/food/basil.png"
            ></img>
            <div className="space-y-2">
              {" "}
              <h1 className="text-[22px]">ใบกระเพรา</h1>{" "}
              <p className="text-[19px]">
                มีรสร้อน บำรุงธาตุ กระตุ้นการไหลเวียนเลือ ช่วยให้น้ำนมมากขึ้น
              </p>{" "}
            </div>
          </div>

                    <div
            role="button"
            tabIndex={0}
            className="btn rounded-xl bg-[#DAE1D84D] shadow-xl w-full text-center font-medium normal-case h-auto min-h-[70px] p-4 whitespace-normal mt-10 "
          >
            <img
              className="absolute w-[97px] h-[97px] -mt-25 -right-1"
              src="/src/assets/food/bail2.png"
            ></img>
            <div className="space-y-2">
              {" "}
              <h1 className="text-[22px]">ใบแมงลัก</h1>{" "}
              <p className="text-[19px]">
                มีรสร้อน บำรุงธาตุ
กระตุ้นการไหลเวียนเลือ ช่วยให้น้ำนมมากขึ้น
              </p>{" "}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Food;
