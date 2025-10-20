import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerBabyAlert } from "../utils/babyAlert";
import { success, info, loginAlert, registerAlert } from "../utils/alert";
import { useAuthContext } from "../context/AuthContext";
import AuthService from "../services/AuthService";
import BabyService from "../services/BabyService";
import SelectedBabyService from "../services/SelectedBabyService";

const BABY_ICON = "/src/assets/home/baby.png";

const normalizeBabies = (raw = []) =>
  raw
    .map((item) => {
      const id =
        item?.id ??
        item?.babyId ??
        item?.uuid ??
        item?.externalId ??
        null;
      const name = item?.name || item?.babyName || item?.title || "";
      const birthday = item?.birthday || item?.dob || item?.birthDate || "";
      if (!name) return null;
      const days = birthday ? daysBetween(birthday) : 0;
      return {
        id: id ?? `${name}-${birthday || Math.random().toString(36).slice(2)}`,
        name,
        birthday,
        days,
      };
    })
    .filter(Boolean);

function daysBetween(isoDate) {
  try {
    const start = new Date(isoDate);
    if (Number.isNaN(start.getTime())) return 0;
    const today = new Date();
    const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.max(0, Math.floor((utcToday - utcStart) / 86400000));
  } catch {
    return 0;
  }
}

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

export default function LoginCarousel() {
  const { login, user } = useAuthContext();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [babies, setBabies] = useState([]);

  const userId = useMemo(
    () => user?.userId ?? user?.id ?? user?.sub ?? null,
    [user]
  );
  const storageKey = useMemo(
    () => (userId ? `ms_babies_${userId}` : null),
    [userId]
  );

  const applyBabies = useCallback(
    (list = []) => {
      setBabies(list);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(list));
        } catch {}
      }
      if (!userId) return;
      const current = SelectedBabyService.get(userId);
      if (list.length === 0) {
        if (current) SelectedBabyService.remove(userId);
        return;
      }
      if (!current || !list.some((b) => b.id === current.id)) {
        const first = list[0];
        SelectedBabyService.set(userId, { id: first.id, name: first.name });
      }
    },
    [storageKey, userId]
  );

  const fetchBabies = useCallback(async () => {
    if (!userId) return [];
    try {
      const response = await BabyService.getAllByUserId(userId);
      const raw = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data?.response)
        ? response.data.response
        : [];
      const normalized = normalizeBabies(raw);
      applyBabies(normalized);
      return normalized;
    } catch (err) {
      console.error("Load babies failed:", err);
      return [];
    }
  }, [applyBabies, userId]);

  useEffect(() => {
    if (!userId) {
      setBabies([]);
      setIndex(0);
      return;
    }

    if (storageKey) {
      try {
        const cached = JSON.parse(localStorage.getItem(storageKey) || "null");
        if (Array.isArray(cached) && cached.length) {
          setBabies(cached);
        }
      } catch {}
    }

    fetchBabies();
  }, [fetchBabies, storageKey, userId]);

  useEffect(() => {
    setIndex(0);
  }, [userId]);

  useEffect(() => {
    const slidesCount = babies.length + (user ? 1 : 2);
    setIndex((prev) => {
      if (slidesCount <= 0) return 0;
      return Math.min(prev, slidesCount - 1);
    });
  }, [babies.length, user]);

  useEffect(() => {
    if (!userId || !babies.length) return;
    const safeIndex = Math.min(index, babies.length - 1);
    const currentBaby = babies[safeIndex];
    if (currentBaby) {
      SelectedBabyService.set(userId, {
        id: currentBaby.id,
        name: currentBaby.name,
      });
    }
  }, [babies, index, userId]);

  const handleLogin = useCallback(async () => {
    const creds = await loginAlert();
    if (!creds) return;
    const { username, password } = creds;
    try {
      await login(username, password);
      success("เข้าสู่ระบบสำเร็จ");
      fetchBabies();
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.message || "เข้าสู่ระบบไม่สำเร็จ";
      info(backendMsg);
      console.error("Login failed:", err);
    }
  }, [fetchBabies, login]);

  const handleRegister = useCallback(async () => {
    const payload = await registerAlert();
    if (!payload) return;
    const { username, name, password, confirmPassword } = payload;
    try {
      await AuthService.register({ username, name, password, confirmPassword });
      success("ลงทะเบียนสำเร็จ");
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.message || "ลงทะเบียนไม่สำเร็จ";
      info(backendMsg);
      console.error("Register failed:", err);
    }
  }, []);

  const handleAddBaby = useCallback(async () => {
    if (!userId) {
      info("กรุณาเข้าสู่ระบบก่อนเพิ่มลูกน้อย");
      return;
    }

    const payload = await registerBabyAlert({ title: "ลงทะเบียนลูกน้อย" });
    if (!payload) return;

    const { name, birthday, birthWeight, ageText } = payload;
    try {
      const response = await BabyService.addBaby({ name, birthday, birthWeight });
      const created =
        response?.data?.data ??
        response?.data ??
        {};

      const updated = await fetchBabies();
      let nextIndex = updated.findIndex((b) => {
        if (created?.id || created?.babyId) {
          return (
            b.id === created.id ||
            b.id === created.babyId ||
            b.id === (created.data?.id ?? created.data?.babyId)
          );
        }
        return b.name === name && (!b.birthday || b.birthday === birthday);
      });
      if (nextIndex === -1) nextIndex = Math.max(updated.length - 1, 0);

      if (updated[nextIndex]) {
        setDirection(1);
        setIndex(nextIndex);
        SelectedBabyService.set(userId, {
          id: updated[nextIndex].id,
          name: updated[nextIndex].name,
        });
      }

      success(
        `เพิ่มลูกน้อยเรียบร้อย\nชื่อ: ${name}\nวันเกิด: ${birthday}${
          ageText ? `\nอายุ: ${ageText}` : ""
        }`
      );
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.message || "เพิ่มลูกน้อยไม่สำเร็จ";
      info(backendMsg);
      console.error("Register baby failed:", err);
    }
  }, [fetchBabies, userId]);

  const loginSlide = useMemo(
    () => ({
      id: "login",
      title: "เข้าสู่ระบบเพื่อจัดการข้อมูลลูกน้อย",
      button: "เข้าสู่ระบบ",
      icon: BABY_ICON,
      onClick: handleLogin,
    }),
    [handleLogin]
  );

  const registerSlide = useMemo(
    () => ({
      id: "register",
      title: "ยังไม่มีบัญชี?",
      button: "สร้างบัญชีใหม่",
      icon: BABY_ICON,
      onClick: handleRegister,
    }),
    [handleRegister]
  );

  const addSlide = useMemo(
    () => ({
      id: "add",
      title: "เพิ่มลูกน้อยใหม่",
      button: "เพิ่มลูกน้อย",
      icon: BABY_ICON,
      onClick: handleAddBaby,
      type: "add",
    }),
    [handleAddBaby]
  );

  const babySlides = useMemo(
    () =>
      babies.map((baby, i) => ({
        id: baby.id ?? `baby-${i}`,
        title: baby.name,
        subtitle: baby.birthday ? `อายุ ${baby.days} วัน` : "",
        icon: BABY_ICON,
        type: "baby",
        baby,
      })),
    [babies]
  );

  const slides = useMemo(() => {
    if (!user) return [loginSlide, registerSlide];
    return [...babySlides, addSlide];
  }, [addSlide, babySlides, loginSlide, registerSlide, user]);

  if (!slides.length || !slides[index]) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        ไม่พบข้อมูลที่จะแสดง
      </div>
    );
  }

  const nextSlide = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleDragEnd = (_evt, { offset }) => {
    if (offset.x < -80) nextSlide();
    if (offset.x > 80) prevSlide();
  };

  return (
    <div className="flex flex-col items-center justify-start bg-white w-full mt-10 shadow-lg rounded-2xl ">
      <div className="w-full h-[360px] flex flex-col items-center justify-center relative overflow-hidden ">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 z-10">
          {slides[index].title}
        </h2>

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
              <img src={slides[index].icon} className="w-[75px]" alt="baby icon" />
            </motion.div>
          </AnimatePresence>
        </div>

        {user && slides[index].type === "baby" ? (
          <motion.div
            key={`baby-${slides[index].id}`}
            className="mt-6 text-center z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-base font-medium text-gray-700">{slides[index].title}</div>
            {slides[index].subtitle ? (
              <div className="text-sm text-gray-500">{slides[index].subtitle}</div>
            ) : null}
          </motion.div>
        ) : (
          <motion.button
            key={`btn-${slides[index].id}`}
            onClick={slides[index].onClick}
            className="mt-10 btn bg-[#E2A9F1B2] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#e3a9f1d7] transition z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {slides[index].button}
          </motion.button>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`w-3 h-3 rounded-full transition ${
              i === index ? "bg-pink-400" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        (ปัดซ้าย/ขวาเพื่อเปลี่ยนสไลด์)
      </p>
    </div>
  );
}
