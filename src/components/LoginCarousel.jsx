import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerBabyAlert } from "../utils/babyAlert";
import { success, info, loginAlert, registerAlert } from "../utils/alert";

export default function LoginCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next (ปัดซ้าย), -1 = prev (ปัดขวา)

  const slides = [
    {
      id: 0,
      title: "เลื่อนเพื่อลงทะเบียน",
      button: "เข้าสู่ระบบ",
      color: "bg-[#FAF7F9]",
      icon: "/src/assets/home/baby.png",
      onClick: async () => {
        const creds = await loginAlert();
        if (creds) {
          // คุณสามารถนำ creds ไปเรียก AuthService ได้ต่อ: { email, password, remember }
          success("เข้าสู่ระบบสำเร็จ!");
        }
      },
    },
    {
      id: 1,
      title: "ลงทะเบียน",
      button: "เริ่มลงทะเบียน",
      color: "bg-[#FAF7F9]",
      icon: "/src/assets/home/baby.png",
      onClick: async () => {
        const payload = await registerAlert();
        if (payload) {
          // payload = { firstName, lastName, password }
          success("ลงทะเบียนสำเร็จ!");
        }
      },
    },
    {
      id: 2,
      title: "เพิ่มลูกน้อยใหม่",
      button: "ลงทะเบียนลูกน้อย",
      color: "bg-[#FAF7F9]",
      icon: "/src/assets/home/baby.png",
      onClick: () => info("เพิ่มลูกใหม่!"),
    },
  ];

  // Override slide id 2 to open baby registration alert
  slides[2].onClick = async () => {
    const payload = await registerBabyAlert({ title: "ลงทะเบียนลูกน้อย" });
    if (payload) {
      const { name, dob, ageText } = payload;
      success(`บันทึกสำเร็จ\nชื่อ: ${name}\nวันเกิด: ${dob}\nอายุปัจจุบัน: ${ageText}`);
    }
  };

  const nextSlide = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleDragEnd = (e, { offset }) => {
    if (offset.x < -80) nextSlide(); // ปัดซ้าย → ไปขวา
    if (offset.x > 80) prevSlide(); // ปัดขวา → ไปซ้าย
  };

  // 🌀 animation แบบ slide เข้าจากขวา / ซ้าย
  const circleVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      zIndex: 10,
      transition: { duration: 0.35, ease: "easeInOut" },
    },
    exit: (dir) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
      scale: 0.8,
      zIndex: 0,
      transition: { duration: 0.35, ease: "easeInOut" },
    }),
  };

  return (
    <div className="flex flex-col items-center justify-start  bg-white w-full mt-10 shadow-lg rounded-2xl ">
      <div className="w-full h-[360px] flex flex-col items-center justify-center relative overflow-hidden ">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 z-10">
          {slides[index].title}
        </h2>

        {/* วงกลมกลาง (มี animation เปลี่ยนสไลด์) */}
        <div className="relative w-[130px] h-[130px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={slides[index].id}
              className="absolute w-[130px] h-[130px] rounded-full bg-white border-4 border-pink-200 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
              custom={direction}
              variants={circleVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
            >
              <img src={slides[index].icon} className="w-[75px]" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ปุ่ม */}
        <motion.button
          key={`btn-${index}`}
          onClick={slides[index].onClick}
          className="mt-10 btn bg-[#E2A9F1B2] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#e3a9f1d7] transition z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {slides[index].button}
        </motion.button>
      </div>

      {/* จุดบอกสไลด์ */}
      <div className="flex gap-2 ">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition ${
              i === index ? "bg-pink-400" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3">(ปัดซ้าย/ขวา เพื่อเปลี่ยนหน้า)</p>
    </div>
  );
}
