import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerBabyAlert } from "../utils/babyAlert";
import { success, info, loginAlert, registerAlert } from "../utils/alert";
import { useAuthContext } from "../context/AuthContext";
import AuthService from "../services/AuthService";
import BabyService from "../services/BabyService";
import SelectedBabyService from "../services/SelectedBabyService";

const BABY_ICON = "/src/assets/home/baby.png";

/* ---------------------------------------------------
   🔧 Utilities
--------------------------------------------------- */

const formatAgeLabel = ({ years = 0, months = 0, days = 0, fallbackDays = 0 }) => {
  const parts = [];
  if (years > 0) parts.push(`${years} ปี`);
  if (months > 0) parts.push(`${months} เดือน`);
  if (days > 0) parts.push(`${days} วัน`);
  if (parts.length) return `อายุ ${parts.join(" ")}`;
  if (fallbackDays > 0) return `อายุ ${fallbackDays} วัน`;
  return "";
};

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

const normalizeBabies = (raw = []) =>
  raw
    .map((item) => {
      const id =
        item?.id ?? item?.babyId ?? item?.uuid ?? item?.externalId ?? null;
      const name = item?.name || item?.babyName || item?.title || "";
      const birthday = item?.birthday || item?.dob || item?.birthDate || "";
      if (!name) return null;

      const ageYears = Number(item?.ageYears ?? item?.years ?? 0) || 0;
      const ageMonths = Number(item?.ageMonths ?? item?.months ?? 0) || 0;
      const ageDays = Number(item?.ageDays ?? item?.days ?? 0) || 0;

      const derivedDays = birthday
        ? daysBetween(birthday)
        : ageYears * 365 + ageMonths * 30 + ageDays;

      const weightRaw =
        item?.birthWeight ??
        item?.weight ??
        item?.latestWeight ??
        item?.currentWeight ??
        item?.lastWeight ??
        null;
      const weight = Number(weightRaw);

      return {
        id: id ?? `${name}-${birthday || Math.random().toString(36).slice(2)}`,
        name,
        birthday,
        days: derivedDays,
        ageLabel: formatAgeLabel({
          years: ageYears,
          months: ageMonths,
          days: ageDays,
          fallbackDays: derivedDays,
        }),
        weight: Number.isFinite(weight) && weight > 0 ? weight : null,
      };
    })
    .filter(Boolean);

/* ---------------------------------------------------
   🔄 Framer Motion Animation
--------------------------------------------------- */
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

/* ---------------------------------------------------
   🎠 Component
--------------------------------------------------- */
export default function LoginCarousel() {
  const { login, user } = useAuthContext();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [babies, setBabies] = useState([]);

  const userId = useMemo(() => user?.userId ?? user?.id ?? user?.sub ?? null, [user]);
  const storageKey = useMemo(() => (userId ? `ms_babies_${userId}` : null), [userId]);

  /* ---------------------------------------------------
     🧠 Helper: Sync Selected Baby
  --------------------------------------------------- */
  const syncSelectedIndex = useCallback(
    (list = []) => {
      if (!Array.isArray(list) || list.length === 0) {
        if (userId) SelectedBabyService.remove(userId);
        return;
      }

      const stored = SelectedBabyService.get(userId);
      const matchById = (item, value) =>
        item?.id != null && value != null && String(item.id) === String(value);

      const idx = stored ? list.findIndex((b) => matchById(b, stored.id)) : 0;
      if (idx >= 0) setIndex(idx);
      else setIndex(0);
    },
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
      syncSelectedIndex(list);
    },
    [storageKey, syncSelectedIndex]
  );

  /* ---------------------------------------------------
     🔍 โหลดข้อมูลลูกน้อย
  --------------------------------------------------- */
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
      return [];
    }
  }, [applyBabies, userId]);

  /* ---------------------------------------------------
     🧭 โหลดข้อมูลเมื่อเข้า Home (จำ index เดิมไว้)
  --------------------------------------------------- */
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

          // ✅ โหลด baby ที่เลือกไว้ก่อนหน้า
          const stored = SelectedBabyService.get(userId);
          if (stored) {
            const idx = cached.findIndex((b) => String(b.id) === String(stored.id));
            if (idx >= 0) setIndex(idx);
            else setIndex(0);
          } else {
            setIndex(0);
          }
        }
      } catch {}
    }

    // ✅ โหลดข้อมูลจาก API โดยไม่รีเซ็ต index
    fetchBabies();
  }, [fetchBabies, storageKey, userId]);

  /* ---------------------------------------------------
     🧩 เมื่อเปลี่ยน index หรือ list
  --------------------------------------------------- */
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

  /* ---------------------------------------------------
     🔐 เข้าสู่ระบบ / ลงทะเบียน / เพิ่มลูกน้อย
  --------------------------------------------------- */
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
      const created = response?.data?.data ?? response?.data ?? {};

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
    }
  }, [fetchBabies, userId]);

  /* ---------------------------------------------------
     🧷 สร้าง slides
  --------------------------------------------------- */
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
        subtitle: baby.ageLabel || "",
        description: baby.weight ? `น้ำหนักแรกเกิด ${baby.weight.toLocaleString()} กรัม` : "",
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

  /* ---------------------------------------------------
     🎠 UI Render
  --------------------------------------------------- */
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
            {slides[index].subtitle ? (
              <div className="text-sm text-gray-500">{slides[index].subtitle}</div>
            ) : null}
            {slides[index].description ? (
              <div className="text-sm text-gray-500 mt-1">{slides[index].description}</div>
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
