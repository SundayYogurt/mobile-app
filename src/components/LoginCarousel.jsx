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
  const [direction, setDirection] = useState(1); // 1 = next (ปัดซ้าย), -1 = prev (ปัดขวา)
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
    // Preserve selected baby if available; only default to first if none or not found
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
    color: "bg-[#FAF7F9]",
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
    color: "bg-[#FAF7F9]",
    icon: "/src/assets/home/baby.png",
    onClick: async () => {
      const payload = await registerAlert();
      if (!payload) return;
      const { username, name, password, confirmPassword } = payload;
      try {
        await AuthService.register({
          username,
          name,
          password,
          confirmPassword,
        });
        success("ลงทะเบียนสำเร็จ!");
      } catch (err) {

        const backendMsg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";

        console.error("Register failed:", err);

        // แสดงข้อความสวย ๆ
        info(`ลงทะเบียนไม่สำเร็จ\n${backendMsg}`);
      }
    },
  };

  const babySlide = {
    id: 2,
    title: "เพิ่มลูกน้อยใหม่",
    button: "ลงทะเบียนลูกน้อย",
    color: "bg-[#FAF7F9]",
    icon: "/src/assets/home/baby.png",
    onClick: async () => {
      const payload = await registerBabyAlert({ title: "ลงทะเบียนลูกน้อย" });
      if (!payload) return;
      const { name, birthday, birthWeight, ageText } = payload;
      try {
        await BabyService.addBaby({ name, birthday, birthWeight });
        await reloadBabies();
        success(
          `บันทึกสำเร็จ\nชื่อ: ${name}\nวันเกิด: ${birthday}\nอายุปัจจุบัน: ${ageText}`
        );
      } catch (err) {
        const backendMsg = err?.response?.data?.message || err?.message || "";
        console.error("Register baby failed:", err);
        info(backendMsg || "บันทึกลูกน้อยไม่สำเร็จ กรุณาลองใหม่");
      }
    },
  };

  const babySlides = babies.map((b, i) => ({
    id: `baby-${b.id ?? i}`,
    title: b.name,
    subtitle: `อายุ ${b.days} วัน`,
    color: "bg-[#FAF7F9]",
    icon: "/src/assets/home/baby.png",
    type: "baby",
    baby: b,
    onClick: () => {},
    button: "",
  }));

  // เมื่อยังไม่ล็อกอิน: ไม่อนุญาตเพิ่มลูกน้อย ให้ขึ้น login ก่อน
  const addGuestSlide = {
    ...babySlide,
    onClick: async () => {
      const creds = await loginAlert();
      if (!creds) return;
      const { username, password } = creds;
      try {
        await login(username, password);
        success("เข้าสู่ระบบสำเร็จ!");
      } catch (err) {
        info("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
      }
    },
  };

  const slides = user
    ? [...babySlides, { ...babySlide, type: "add" }]
    : [loginSlide, registerSlide];

  // เมื่อโหลดรายชื่อเด็กแล้ว ให้ตั้ง index ไปยังเด็กที่ถูกเลือกไว้ก่อนหน้า
  useEffect(() => {
    if (!user || babies.length === 0) return;
    const uid = getUid();
    const sel = SelectedBabyService.get(uid);
    if (sel?.id) {
      const idx = babySlides.findIndex((s) => s?.baby?.id === sel.id);
      if (idx >= 0) setIndex(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, babies.length]);

  useEffect(() => {
    // ป้องกัน index เกินเมื่อจำนวนสไลด์เปลี่ยนตามสถานะ user
    setIndex((prev) => (prev >= slides.length ? 0 : prev));
  }, [user]);

  useEffect(() => {
    if (!user && babies.length) setBabies([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // โหลดรายชื่อลูกน้อยทั้งหมดหลังล็อกอิน
  useEffect(() => {
    const run = async () => {
      if (!user) return;
      try {
        const uid = getUid();
        // โหลดจาก localStorage ก่อน เพื่อให้เห็นทันทีระหว่างรอ API
        try {
          const cached = JSON.parse(
            localStorage.getItem(storageKey(uid)) || "null"
          );
          if (Array.isArray(cached) && cached.length) setBabies(cached);
        } catch {}
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
          .map((b) => {
            const id = b?.id ?? b?.babyId;
            const name = b?.name || b?.babyName || b?.title || "";
            const birthday = b?.birthday || b?.dob || b?.birthDate || "";
            let days;
            if (
              b &&
              (b.ageDays !== undefined ||
                b.ageMonths !== undefined ||
                b.ageYears !== undefined)
            ) {
              const y = Number(b.ageYears || 0) || 0;
              const m = Number(b.ageMonths || 0) || 0;
              const d = Number(b.ageDays || 0) || 0;
              days = y * 365 + m * 30 + d;
            } else if (birthday) {
              days = daysBetween(birthday);
            }
            return { id, name, birthday, days };
          })
          .filter((b) => b.name && (b.birthday || Number.isFinite(b.days)))
          .map((b) => ({
            ...b,
            days: Number.isFinite(b.days) ? b.days : daysBetween(b.birthday),
          }));
        setBabies(list);
        try {
          localStorage.setItem(storageKey(uid), JSON.stringify(list));
        } catch {}
      } catch (e) {
        console.error("Load babies failed:", e);
      }
    };
    run();
  }, [user]);

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

  // เลือก baby อัตโนมัติเมื่อเปลี่ยนสไลด์
  useEffect(() => {
    if (!user || babies.length === 0) return;
    const uid = getUid();
    const current = slides[index];
    if (current?.type === "baby" && current?.baby) {
      SelectedBabyService.set(uid, {
        id: current.baby.id,
        name: current.baby.name,
      });
    }
  }, [index, babies, user]);

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

        {/* ปุ่ม/ข้อมูล ใต้ไอคอน */}
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
            <div className="text-sm text-gray-500">
              {slides[index].subtitle}
            </div>
          </motion.div>
        ) : (
          <motion.button
            key={`btn-${index}`}
            onClick={slides[index].onClick}
            className="mt-10 btn bg-[#E2A9F1B2] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#e3a9f1d7] transition z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {slides[index].type === "add"
              ? slides[index].button
              : slides[index].button || ""}
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

      <p className="text-xs text-gray-400 mt-3">
        (ปัดซ้าย/ขวา เพื่อเปลี่ยนหน้า)
      </p>
    </div>
  );
}
