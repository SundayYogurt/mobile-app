// 📁 src/utils/alert.js
import Swal from "sweetalert2";

// ฟังก์ชันแจ้งเตือนพื้นฐาน
export function notify({ title = "", text = "", html = "", confirmText = "ตกลง" } = {}) {
  return Swal.fire({
    title,
    text,
    html: html || text, // Use html if provided, otherwise use text
    confirmButtonText: confirmText,
    confirmButtonColor: "#F5D8EB",
    backdrop: true,
    showCloseButton: true,
    allowEscapeKey: true,
    didOpen: () => {
      const titleEl = Swal.getTitle();
      if (titleEl) titleEl.style.color = "#F0A4D6";
    },
  });
}

export function success(message) {
  return notify({ title: "สำเร็จ", text: message });
}

export function info(message) {
  return notify({ title: "แจ้งเตือน", text: message });
}

// ✅ ฟอร์มเข้าสู่ระบบ
export async function loginAlert({
  title = "เข้าสู่ระบบ",
  confirmText = "เข้าสู่ระบบ",
  cancelText = "ยกเลิก",
  showRemember = true,
} = {}) {
  const result = await Swal.fire({
    title,
    html: `
      <form id="swal-login-form" class="swal2-content ms-wrap" style="margin-top:4px" autocomplete="off">
        <style>
          .ms-wrap .swal2-input {
            width: 100% !important;
            box-sizing: border-box;
            height: 38px;
            padding: 8px 38px 8px 10px;
            font-size: 14px;
            margin: 4px 0 6px;
          }
          .ms-wrap .eye-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            opacity: 0.6;
          }
          .ms-wrap .swal2-input-wrapper {
            position: relative;
          }
        </style>
        <input id="swal-login-username" name="username" class="swal2-input" placeholder="ชื่อผู้ใช้" type="text" autocomplete="username" />
        <div class="swal2-input-wrapper">
          <input id="swal-login-password" name="password" class="swal2-input" placeholder="รหัสผ่าน" type="password" autocomplete="current-password" />
          <span id="toggle-login-pass" class="eye-icon">👁️</span>
        </div>
        ${
          showRemember
            ? '<label style="display:flex;gap:6px;align-items:center;justify-content:flex-start;margin:4px 2px 0"><input id="swal-login-remember" type="checkbox" checked /> <span style="font-size:0.9rem">จดจำฉัน</span></label>'
            : ""
        }
      </form>
    `,
    didOpen: () => {
      const titleEl = Swal.getTitle();
      if (titleEl) titleEl.style.color = "#F0A4D6";
      const toggle = document.getElementById("toggle-login-pass");
      const pass = document.getElementById("swal-login-password");
      toggle?.addEventListener("click", () => {
        const show = pass.type === "password";
        pass.type = show ? "text" : "password";
        toggle.textContent = show ? "🙈" : "👁️";
      });
    },
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#F5D8EB",
    reverseButtons: true,
    showCloseButton: true,
    allowEscapeKey: true,
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: () => {
      const username = document.getElementById("swal-login-username")?.value?.trim();
      const password = document.getElementById("swal-login-password")?.value ?? "";
      const remember = document.getElementById("swal-login-remember")?.checked ?? false;

      if (!username || !password) {
        Swal.showValidationMessage("กรอกชื่อผู้ใช้และรหัสผ่านให้ครบ");
        return false;
      }
      return { username, password, remember };
    },
  });

  if (result.isConfirmed && result.value) return result.value;
  return null;
}

// ✅ ฟอร์มลงทะเบียนผู้ใช้ใหม่
export async function registerAlert({
  title = "ลงทะเบียน",
  confirmText = "ลงทะเบียน",
  cancelText = "ยกเลิก",
} = {}) {
  const result = await Swal.fire({
    title,
    html: `
      <form id="swal-register-form" class="swal2-content ms-wrap" style="margin-top:4px" autocomplete="off">
        <style>
          .ms-wrap .ms-field { margin-top: 8px; position: relative; }
          .ms-wrap .ms-field label {
            display:block;
            margin-bottom:4px;
            font-size:14px;
            color:#F0A4D6;
          }
          .ms-wrap .swal2-input {
            width: 100% !important;
            box-sizing: border-box;
            height: 38px;
            padding: 8px 38px 8px 10px;
            font-size: 14px;
            margin: 2px 0 4px;
          }
          .eye-icon {
            position: absolute;
            right: 12px;
            top: 62%;
            transform: translateY(-50%);
            cursor: pointer;
            opacity: 0.6;
          }
        </style>
        <div class="ms-field">
          <label for="swal-reg-username">ชื่อผู้ใช้ (จำเป็น)</label>
          <input id="swal-reg-username" class="swal2-input" placeholder="เช่น momsure01" type="text" autocomplete="username" />
        </div>
        <div class="ms-field">
          <label for="swal-reg-name">ชื่อที่แสดง (จำเป็น)</label>
          <input id="swal-reg-name" class="swal2-input" placeholder="เช่น แม่พอใจ" type="text" autocomplete="name" />
        </div>
        <div class="ms-field">
          <label for="swal-reg-password">รหัสผ่าน</label>
          <input id="swal-reg-password" class="swal2-input" placeholder="อย่างน้อย 6 ตัวอักษร และมีพิมพ์ใหญ่ 1 ตัว" type="password" autocomplete="new-password" />
          <span id="toggle-reg-pass" class="eye-icon">👁️</span>
        </div>
        <div class="ms-field">
          <label for="swal-reg-confirm">ยืนยันรหัสผ่าน</label>
          <input id="swal-reg-confirm" class="swal2-input" placeholder="พิมพ์ซ้ำอีกครั้ง" type="password" autocomplete="new-password" />
          <span id="toggle-reg-confirm" class="eye-icon">👁️</span>
        </div>
        <div class="ms-field" >
          <label for="swal-reg-education">ระดับการศึกษา</label>
          <select id="swal-reg-education" class="swal2-input">
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
        <div class="ms-field hidden">
          <label for="swal-reg-birthday">วันเกิด</label>
          <input id="swal-reg-birthday" class="swal2-input" type="date" />
        </div>
        <div class="ms-field">
          <label for="swal-reg-antenatal-visits">จำนวนครั้งการฝากครรภ์</label>
          <input id="swal-reg-antenatal-visits" class="swal2-input" placeholder="จำนวนครั้งการฝากครรภ์" type="number" />
        </div>
      </form>
    `,
    didOpen: () => {
      const titleEl = Swal.getTitle();
      if (titleEl) titleEl.style.color = "#F0A4D6";

      const pass = document.getElementById("swal-reg-password");
      const confirm = document.getElementById("swal-reg-confirm");
      const togglePass = document.getElementById("toggle-reg-pass");
      const toggleConfirm = document.getElementById("toggle-reg-confirm");

      const toggle = (input, icon) => {
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        icon.textContent = show ? "🙈" : "👁️";
      };

      togglePass?.addEventListener("click", () => toggle(pass, togglePass));
      toggleConfirm?.addEventListener("click", () => toggle(confirm, toggleConfirm));
    },
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#F5D8EB",
    showCloseButton: true,
    reverseButtons: true,
    allowEscapeKey: true,
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: () => {
      const username = document.getElementById("swal-reg-username")?.value?.trim();
      const nameInput = document.getElementById("swal-reg-name")?.value?.trim();
      const password = document.getElementById("swal-reg-password")?.value ?? "";
      const confirmPassword = document.getElementById("swal-reg-confirm")?.value ?? "";
      const educationLevel = document.getElementById("swal-reg-education")?.value;
      const birthday = document.getElementById("swal-reg-birthday")?.value;
      const antenatal_visit_counts = document.getElementById("swal-reg-antenatal-visits")?.value;


      if (!username || !password || !confirmPassword || !nameInput  || !educationLevel || !antenatal_visit_counts) {
        Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
        return false;
      }

      if (password.length < 6) {
        Swal.showValidationMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        return false;
      }

      if (!/[A-Z]/.test(password)) {
        Swal.showValidationMessage("รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่ (A–Z) อย่างน้อย 1 ตัว");
        return false;
      }

      if (password !== confirmPassword) {
        Swal.showValidationMessage("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
        return false;
      }

      const name = nameInput && nameInput.length > 0 ? nameInput : username;
      return { username, name, password, confirmPassword, educationLevel, birthday, antenatal_visit_counts: Number(antenatal_visit_counts) };
    },
  });

  if (result.isConfirmed && result.value) return result.value;
  return null;
}
