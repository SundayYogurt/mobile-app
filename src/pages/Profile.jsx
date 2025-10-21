import React, { useEffect, useState } from "react";
import UserProfileService from "../services/UserProfileService";
import Swal from "sweetalert2";
import { useAuthContext } from "../context/AuthContext";

const Profile = () => {
  const [profile, setProfile] = useState({});
  const { user } = useAuthContext();
  const id = user?.id;

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const response = await UserProfileService.showUserProfile(id);
        setProfile(response.status === 200 ? response.data : {});
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
          text:
            error.response?.data?.message ||
            error.message ||
            "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
          confirmButtonText: "ตกลง",
        });
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center justify-start py-10 px-6">
      {/* 🌸 โลโก้ / ไอคอน */}
      <img
        src="/src/assets/love.png"
        alt="love"
        className="w-24 h-24 mb-4 animate-pulse"
      />

      {/* 💕 หัวข้อ */}
      <h1 className="text-3xl font-bold text-pink-600 mb-8 drop-shadow-sm">
        โปรไฟล์คุณแม่ 💕
      </h1>

      {/* 🌼 การ์ดโปรไฟล์ */}
      <div className="bg-white shadow-md rounded-2xl border border-pink-100 w-full max-w-md p-6">
        <div className="flex justify-between py-3 border-b border-pink-100">
          <span className="font-semibold text-gray-600">ชื่อ–นามสกุล</span>
          <span className="text-gray-800">{profile?.name || "ไม่ระบุ"}</span>
        </div>

        <div className="flex justify-between py-3 border-b border-pink-100">
          <span className="font-semibold text-gray-600">อายุ</span>
          <span className="text-gray-800">{profile?.age || "ไม่ระบุ"}</span>
        </div>

        <div className="flex justify-between py-3 border-b border-pink-100">
          <span className="font-semibold text-gray-600">ระดับการศึกษา</span>
          <span className="text-gray-800">
            {profile?.educationLevel || "ไม่ระบุ"}
          </span>
        </div>

        <div className="flex justify-between py-3">
          <span className="font-semibold text-gray-600">
            จำนวนครั้งการฝากครรภ์
          </span>
          <span className="text-gray-800">
            {profile?.antenatal_visit_counts || "ไม่ระบุ"}
          </span>
        </div>
      </div>

      {/* 🌷 ปุ่มแก้ไข */}
      <button
        onClick={() =>
          Swal.fire("กำลังพัฒนา", "ฟีเจอร์แก้ไขโปรไฟล์จะมาเร็ว ๆ นี้ 💗", "info")
        }
        className="mt-8 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-8 rounded-full shadow-md transition-all duration-300 hover:scale-105"
      >
        แก้ไขข้อมูล
      </button>

      {/* 🕊️ เครดิตเล็ก ๆ */}
      <p className="text-sm text-gray-400 mt-6">
        ระบบดูแลคุณแม่โดย <span className="text-pink-500 font-medium">MomSure</span>
      </p>
    </div>
  );
};

export default Profile;
