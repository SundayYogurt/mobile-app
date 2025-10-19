import React from 'react'
import { FiEye, FiUsers } from 'react-icons/fi'

// Footer แสดงผลเป็นกริด 2 ฝั่ง
// - ซ้าย: จำนวนผู้เข้าชม พร้อมไอคอนตา
// - ขวา: จำนวนผู้ใช้งานออนไลน์ พร้อมสถานะและไอคอนผู้ใช้
// ใส่ค่าได้ผ่าน props: visitorCount, onlineCount
export const Footer = ({ visitorCount = 0, onlineCount = 0, className = '' }) => {
  return (
    <footer className={`w-full fixed h-[60px] bottom-0 left-0 right-0 z-50 shadow-sm border-t border-neutral/20 bg-[#F5D8EB] text-base-content ${className}`}>
      <div className="max-w-screen-md mx-auto grid grid-cols-2 items-center gap-2 p-3">
        {/* Left: Visitors */}
        <button type="button" className="btn btn-ghost btn-sm justify-self-start gap-2 px-0">
          <FiEye className="text-primary" size={18} />
          <span className="opacity-80">ผู้เข้าชม</span>
          <span className="font-semibold">
            {Number(visitorCount).toLocaleString()}
          </span>
        </button>

        {/* Right: Online users */}
        <button type="button" className="btn btn-ghost btn-sm justify-self-end gap-2 px-0">
          {/* live status dot */}
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <FiUsers className="text-success" size={18} />
          <span className="opacity-80">ออนไลน์</span>
          <span className="font-semibold">
            {Number(onlineCount).toLocaleString()}
          </span>
        </button>
      </div>
    </footer>
  )
}
