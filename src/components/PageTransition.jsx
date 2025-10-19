import React from "react";
import { AnimatePresence, motion } from "framer-motion";

// ใช้สำหรับใส่อนิเมชันให้ทุกหน้าที่เปลี่ยนผ่านด้วย Outlet
export default function PageTransition({ children, routeKey }) {
  return (
    <AnimatePresence initial>
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
