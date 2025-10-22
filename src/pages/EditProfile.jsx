import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate , useParams} from "react-router";
import { useAuthContext } from "../context/AuthContext";
import UserProfileService from "../services/UserProfileService";


const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { id } = useParams();

  const [profile, setProfile] = useState({
    name: "",
    birthday: "",
    educationLevel: "NONE",
    antenatal_visit_counts: "",
  });

  // ✅ โหลดข้อมูลโปรไฟล์จาก backend
  useEffect(() => {
    const getProfile = async () => {
      if (!id) return;
      try {
        const response = await UserProfileService.showUserProfile(id);
        if (response.status === 200) {
          setProfile(response?.data);
            console.log(response)
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาดในการดึงข้อมูล",
          text: error?.response?.data?.message || error.message,
          confirmButtonText: "ตกลง",
        });
      }
    };
    getProfile();
  }, [id]);



  // ✅ ฟังก์ชันเปลี่ยนค่าฟิลด์ในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ ฟังก์ชันส่งฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await UserProfileService.editUserProfile(id, profile);
      if (response.status === 200) {
        Swal.fire({
          title: "สำเร็จ",
          text: "โปรไฟล์แก้ไขเรียบร้อยแล้ว 💖",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => navigate("/profile"), 2000);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการบันทึก",
        text: error?.response?.data?.message || error.message,
        confirmButtonText: "ตกลง",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center justify-start py-10 px-6">
      {/* 🌸 โลโก้ */}
      <img
        src="/src/assets/love.png"
        alt="love"
        className="w-24 h-24 mb-4 animate-pulse"
      />

      {/* 💕 หัวข้อ */}
      <h1 className="text-3xl font-bold text-pink-600 mb-8 drop-shadow-sm">
        แก้ไขโปรไฟล์คุณแม่ 💕
      </h1>

      {/* 🌼 ฟอร์มแก้ไข */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl border border-pink-100 w-full max-w-md p-6 space-y-4"
      >
        {/* ชื่อ–นามสกุล */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            ชื่อ–นามสกุล
          </label>
          <input
            type="text"
            name="name"
            value={profile.name || ""}
            onChange={handleChange}
            className="input input-bordered w-full rounded-lg border-pink-200 focus:border-pink-400"
          />
        </div>

        {/* วันเกิด */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            วันเกิด
          </label>
          <input
            type="date"
            name="birthday"
            value={profile.birthday || ""}
            onChange={handleChange}
            className="input input-bordered w-full rounded-lg border-pink-200 focus:border-pink-400"
          />
        </div>

        {/* ระดับการศึกษา */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            ระดับการศึกษา
          </label>
<div className="relative w-full">
  <select
    name="educationLevel"
    value={profile.educationLevel || ""}
    onChange={handleChange}
    className="
      select select-bordered w-full rounded-lg border-pink-200 focus:border-pink-400 bg-white 
      text-base p-2 h-11
      xs:text-sm xs:p-1.5 xs:h-9   /* 👈 เมื่อจอเล็กลงจะปรับขนาดเล็กลง */
    "
  >
    <option value="">เลือกระดับการศึกษา</option>
    <option value="NONE">ไม่เคยเรียนเลย</option>
    <option value="PRIMARY">ประถมศึกษา</option>
    <option value="SECONDARY">มัธยมต้น</option>
    <option value="HIGH_SCHOOL">มัธยมปลาย</option>
    <option value="VOCATIONAL">ปวช./ปวส.</option>
    <option value="BACHELOR">ปริญญาตรี</option>
    <option value="MASTER">ปริญญาโท</option>
    <option value="DOCTORATE">ปริญญาเอก</option>
    <option value="OTHER">อื่นๆ</option>
  </select>
</div>

        </div>

        {/* จำนวนครั้งการฝากครรภ์ */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            จำนวนครั้งการฝากครรภ์
          </label>
          <input
            type="number"
            name="antenatal_visit_counts"
            value={profile.antenatal_visit_counts || ""}
            onChange={handleChange}
            className="input input-bordered w-full rounded-lg border-pink-200 focus:border-pink-400"
          />
        </div>

        {/* ปุ่มยืนยัน */}
        <button
          type="submit"
          className="mt-4 w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-8 rounded-full shadow-md transition-all duration-300 hover:scale-105"
        >
          ✅ ยืนยันการแก้ไข
        </button>
      </form>

      {/* 🕊️ เครดิต */}
      <p className="text-sm text-gray-400 mt-6">
        ระบบดูแลคุณแม่โดย{" "}
        <span className="text-pink-500 font-medium">MomSure</span>
      </p>
    </div>
  );
};

export default EditProfile;
