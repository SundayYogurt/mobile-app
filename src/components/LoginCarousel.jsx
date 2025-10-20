import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerBabyAlert } from "../utils/babyAlert";
import { success, info, loginAlert, registerAlert } from "../utils/alert";
import { useAuthContext } from "../context/AuthContext";
import AuthService from "../services/AuthService";
import BabyService from "../services/BabyService";
import SelectedBabyService from "../services/SelectedBabyService";

export default function LoginCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const { login, user } = useAuthContext();
  const [babies, setBabies] = useState([]);
  const getUid = () => user?.userId ?? user?.id ?? user?.sub;
  const storageKey = (uid) => `ms_babies_${uid}`;

  const daysBetween = (isoDate) => {
    try {
      const d = new Date(isoDate);
      const t = new Date();
      const utc1 = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
      const utc2 = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
      return Math.max(0, Math.floor((utc2 - utc1) / 86400000));
    } catch {
      return 0;
    }
  };

  const reloadBabies = async () => {
    const uid = getUid();
    if (!uid) return;
    const res = await BabyService.getAllByUserId(uid);
    const rawData = res?.data;
    const raw = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(rawData?.response)
      ? rawData.response
      : [];
    const list = raw
      .map((b) => ({
        id: b?.id ?? b?.babyId,
        name: b?.name || b?.babyName || b?.title || "",
        birthday: b?.birthday || b?.dob || b?.birthDate || "",
      }))
      .filter((b) => b.name && b.birthday)
      .map((b) => ({ ...b, days: daysBetween(b.birthday) }));

    setBabies(list);
    try {
      localStorage.setItem(storageKey(uid), JSON.stringify(list));
    } catch {}
    if (list.length > 0) {
      const sel = SelectedBabyService.get(uid);
      const exists = sel && list.some((b) => b.id === sel.id);
      if (!exists) {
        SelectedBabyService.set(uid, { id: list[0].id, name: list[0].name });
      }
    }
  };

  const loginSlide = {
    id: 0,
    title: "เลื่อนเพื่อลงทะเบียน",
    button: "เข้าสู่ระบบ",
    icon: "/src/assets/home/baby.png",
    onClick: async () => {
      const creds = await loginAlert();
      if (!creds) return;
      const { username, password } = creds;
      try {
        await login(username, password);
        success("เข้าสู่ระบบสำเร็จ!");
      } catch (err) {
        const status = err?.response?.status;
        const backendMsg = err?.response?.data?.message || err?.message || "";
        if (
          status === 401 ||
          /invalid|unauthori[sz]ed|wrong password|incorrect/i.test(backendMsg)
        ) {
          info("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        } else {
          info("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
        }
        console.error("Login failed:", err);
      }
    },
  };

  const registerSlide = {
    id: 1,
    title: "ลงทะเบียน",
    button: "เริ่มลงทะเบียน",
    icon: "/src/assets/home/baby.png",
    onClick: async () => {
      const payload = await registerAlert();
      if (!payload) return;
      const { username, name, password, confirmPassword } = payload;
      try {
        await AuthService.register({ username, name, password, confirmPassword });
        success("ลงทะเบียนสำเร็จ!");
      } catch (err) {
        const backendMsg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
        console.error("Register failed:", err);
        info(`ลงทะเบียนไม่สำเร็จ\n${backendMsg}`);
      }
    },
  };

  const babySlide = {
    id: 2,
    title: "เพิ่มลูกน้อยใหม่",
    button: "ลงทะเบียนลูกน้อย",
    icon: "/src/assets/home/baby.png",
onClick: async () => {
  const payload = await registerBabyAlert({ title: "ลงทะเบียนลูกน้อย" });
  if (!payload) return;
  const { name, birthday, birthWeight, ageText } = payload;

  try {
    await BabyService.addBaby({ name, birthday, birthWeight });

    // ✅ เพิ่มลูกใหม่เข้า state พร้อมเลื่อนไปยังลูกนั้นทันที
    setBabies((prev) => {
      const newBaby = { id: Date.now(), name, birthday, days: daysBetween(birthday) };
      const updated = [...prev, newBaby];
      setTimeout(() => setIndex(updated.length - 1), 200); // ✅ ไปยังลูกใหม่
      return updated;
    });

    await reloadBabies();

    success(
      `บันทึกสำเร็จ\nชื่อ: ${name}\nวันเกิด: ${birthday}\nอายุปัจจุบัน: ${ageText}`
    );
  } catch (err) {
    const backendMsg = err?.response?.data?.message || err?.message || "";
    console.error("Register baby failed:", err);
    info(backendMsg || "บันทึกลูกน้อยไม่สำเร็จ กรุณาลองใหม่");
  }
}

  }

  const babySlides = babies.map((b, i) => ({
    id: `baby-${b.id ?? i}`,
    title: b.name,
    subtitle: `อายุ ${b.days} วัน`,
    icon: "/src/assets/home/baby.png",
    type: "baby",
    baby: b,
    onClick: () => {},
    button: "",
  }));

  const slides = user
    ? [...babySlides, { ...babySlide, type: "add" }]
    : [loginSlide, registerSlide];

  // ✅ ป้องกัน crash ตอน slides ยังไม่พร้อม
  if (!slides || slides.length === 0 || !slides[index]) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  // 🌀 Animation
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

  const nextSlide = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % slides.length);
  };
  const prevSlide = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const handleDragEnd = (e, { offset }) => {
    if (offset.x < -80) nextSlide();
    if (offset.x > 80) prevSlide();
  };

  // ✅ รีเฟรช index เมื่อ babies เปลี่ยน
  useEffect(() => {
    setIndex(0);
  }, [babies]);

  return (
    <div className="flex flex-col items-center justify-start bg-white w-full mt-10 shadow-lg rounded-2xl ">
      <div className="w-full h-[360px] flex flex-col items-center justify-center relative overflow-hidden ">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 z-10">
          {slides[index]?.title || "กำลังโหลด..."}
        </h2>

        {/* 🍼 วงกลมกลาง */}
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
              <img
                src={slides[index]?.icon || "/src/assets/home/baby.png"}
                className="w-[75px]"
                alt="baby icon"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ปุ่ม / ข้อมูล */}
        {user && babies.length > 0 && slides[index]?.type === "baby" ? (
          <motion.div
            key={`baby-${slides[index]?.baby?.id ?? index}`}
            className="mt-6 text-center z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-base font-medium text-gray-700">
              {slides[index].title}
            </div>
            <div className="text-sm text-gray-500">{slides[index].subtitle}</div>
          </motion.div>
        ) : (
          <motion.button
            key={`btn-${index}`}
            onClick={slides[index]?.onClick || (() => {})}
            className="mt-10 btn bg-[#E2A9F1B2] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#e3a9f1d7] transition z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {slides[index]?.button || ""}
          </motion.button>
        )}
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
