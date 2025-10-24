import React, { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import SelectedBabyService from "../services/SelectedBabyService";
import BabyService from "../services/BabyService";
import { info } from "../utils/alert";


const Food = () => {
  const { user } = useAuthContext();
  const uid = useMemo(() => user?.userId ?? user?.id ?? user?.sub, [user]);
  const selected = useMemo(() => (uid ? SelectedBabyService.get(uid) : null), [uid]);
  const [poopWarning, setPoopWarning] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        if (!uid || !selected?.id) return;
        // ดึงวันเกิดจาก cache รายชื่อลูกน้อยที่ LoginCarousel เก็บไว้
        let birthday;
        try {
          const cached = JSON.parse(localStorage.getItem(`ms_babies_${uid}`) || "null");
          const found = Array.isArray(cached) ? cached.find((b) => b && b.name && b.birthday && b.name === selected.name) : null;
          birthday = found?.birthday;
        } catch {}
        // ถ้าไม่มีใน cache ลองโหลดจาก API รายชื่อลูกน้อย
        if (!birthday) {
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
            birthday = found?.birthday || found?.dob || found?.birthDate;
          } catch {}
        }
        if (!birthday) return;

        const dob = new Date(birthday);
        if (Number.isNaN(dob.getTime())) return;
        const hoursSinceBirth = (Date.now() - dob.getTime()) / 36e5;
        if (hoursSinceBirth < 24) return; // ยังไม่ครบ 24 ชม. ไม่ต้องเตือน

        // ตรวจ log อุจจาระของเด็กคนนี้
        let countLogs = 0;
        try {
          const res = await BabyService.showBabyPoopLogs(selected.id);
          const raw = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.data?.response)
            ? res.data.response
            : [];
          countLogs = Array.isArray(raw) ? raw.length : 0;
        } catch {
          // ถ้าเรียกไม่ได้ ถือว่ายังไม่มีข้อมูล ไม่ spam error
        }

        // แสดงเตือนครั้งเดียวต่อวัน/ต่อเด็ก
        const key = `poop_alert_shown_${selected.id}_${new Date().toISOString().slice(0, 10)}`;
        const shown = localStorage.getItem(key);
        if (countLogs === 0) {
          setPoopWarning(true);
          if (!shown) {
            info(
              "ครบ 24 ชั่วโมงหลังคลอดแล้วยังไม่ถ่ายอุจจาระ\nกรุณาติดต่อเจ้าหน้าที่สาธารณสุข/สถานพยาบาลใกล้บ้านเพื่อรับคำแนะนำ"
            );
            try { localStorage.setItem(key, "1"); } catch {}
          }
        } else {
          setPoopWarning(false);
        }
      } catch {}
    };
    run();
  }, [uid, selected?.id, selected?.name]);
  return (
    <>
      <div className="w-full flex flex-col items-center justify-center mt-20 relative z-10 gap-10 ">

        <div className="relative">
          <img
            className="absolute w-[91px] h-[91px]  -rotate-20 -mt-20 xs:w-[71px] xs:h-[71px]"
            src="/src/assets/knowledge/list.png"
          ></img>
          <img
            className="absolute w-[91px] h-[91px] rotate-20 -mt-18 right-1 xs:w-[71px] xs:h-[71px]"
            src="/src/assets/knowledge/salad.png"
          ></img>
          <button className="btn rounded-xl bg-[#ff66c450] w-full h-[70px] text-[30px] font-medium justify-center items-center xs:text-[22px]">
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
            อาหารบำรุงน้ำนมได{" "}
          </button>

          <div
            role="button"
            tabIndex={0}
            className="btn rounded-xl bg-white shadow-xl w-full text-center font-medium normal-case h-auto min-h-[70px] p-4 whitespace-normal mt-10 "
          >
            <img
              className="absolute w-[66px] h-[66px] mt-25 -right-1 xs:w-[51px] xs:h-[51px]"
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
              <h1 className="text-[22px]">ใบกะเพรา</h1>{" "}
              <p className="text-[19px]">
                มีรสร้อน บำรุงธาตุ กระตุ้นการไหลเวียนเลือด ช่วยให้น้ำนมมากขึ้น
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
กระตุ้นการไหลเวียนเลือด ช่วยให้น้ำนมมากขึ้น
              </p>{" "}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Food;
