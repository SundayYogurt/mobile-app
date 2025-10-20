import React from "react";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <h1 className="text-2xl font-semibold text-[#6C3B73]">ไม่มีสิทธิ์เข้าถึง</h1>
      <p className="text-gray-600 mt-2">กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้</p>
    </div>
  );
}

