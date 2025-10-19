import Swal from "sweetalert2";

export function notify({ title = "", text = "", confirmText = "ตกลง" } = {}) {
  return Swal.fire({
    title,
    text,
    confirmButtonText: confirmText,
    confirmButtonColor: "#F5D8EB",
    backdrop: true,
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

// แสดง Alert ฟอร์มเข้าสู่ระบบ
// คืนค่า Promise ที่ resolve เป็น { email, password, remember } เมื่อกดยืนยัน
// หรือ resolve เป็น null เมื่อกดยกเลิก/ปิดหน้าต่าง
export async function loginAlert({
  title = "เข้าสู่ระบบ",
  confirmText = "เข้าสู่ระบบ",
  cancelText = "ยกเลิก",
  showRemember = true,
} = {}) {
  const result = await Swal.fire({
    title,
    html: `
      <div class="swal2-content" style="margin-top:6px">
        <input id="swal-login-email" class="swal2-input" placeholder="อีเมล" type="email" />
        <input id="swal-login-password" class="swal2-input" placeholder="รหัสผ่าน" type="password" />
        ${showRemember ? '<label style="display:flex;gap:6px;align-items:center;justify-content:flex-start;margin:6px 1.2em 0"><input id="swal-login-remember" type="checkbox" checked /> <span style="font-size:0.9rem">จดจำฉัน</span></label>' : ''}
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#F5D8EB",
    reverseButtons: true,
    allowOutsideClick: () => !Swal.isLoading(),
    didOpen: () => {
      const titleEl = Swal.getTitle();
      if (titleEl) titleEl.style.color = "#F0A4D6";
    },
    preConfirm: () => {
      const email = /** @type {HTMLInputElement} */ (document.getElementById("swal-login-email"))?.value?.trim();
      const password = /** @type {HTMLInputElement} */ (document.getElementById("swal-login-password"))?.value ?? "";
      const remember = /** @type {HTMLInputElement} */ (document.getElementById("swal-login-remember"))?.checked ?? false;

      if (!email || !password) {
        Swal.showValidationMessage("กรอกอีเมลและรหัสผ่านให้ครบ");
        return false;
      }
      // ตรวจสอบอีเมลเบื้องต้น
      const ok = /.+@.+\..+/.test(email);
      if (!ok) {
        Swal.showValidationMessage("รูปแบบอีเมลไม่ถูกต้อง");
        return false;
      }
      return { email, password, remember };
    },
  });

  if (result.isConfirmed && result.value) {
    return result.value;
  }
  return null;
}

// แสดง Alert ฟอร์มลงทะเบียน
// คืนค่า Promise เป็น { firstName, lastName, password } เมื่อกดยืนยัน หรือ null เมื่อยกเลิก
export async function registerAlert({
  title = "ลงทะเบียน",
  confirmText = "ลงทะเบียน",
  cancelText = "ยกเลิก",
} = {}) {
  const result = await Swal.fire({
    title,
    html: `
      <div class="swal2-content" style="margin-top:6px">
        <input id="swal-reg-firstname" class="swal2-input" placeholder="ชื่อ" type="text" />
        <input id="swal-reg-lastname" class="swal2-input" placeholder="นามสกุล" type="text" />
        <input id="swal-reg-password" class="swal2-input" placeholder="รหัสผ่าน" type="password" />
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#F5D8EB",
    reverseButtons: true,
    allowOutsideClick: () => !Swal.isLoading(),
    didOpen: () => {
      const titleEl = Swal.getTitle();
      if (titleEl) titleEl.style.color = "#F0A4D6";
    },
    preConfirm: () => {
      const firstName = /** @type {HTMLInputElement} */ (document.getElementById("swal-reg-firstname"))?.value?.trim();
      const lastName = /** @type {HTMLInputElement} */ (document.getElementById("swal-reg-lastname"))?.value?.trim();
      const password = /** @type {HTMLInputElement} */ (document.getElementById("swal-reg-password"))?.value ?? "";

      if (!firstName || !lastName || !password) {
        Swal.showValidationMessage("กรอกข้อมูลให้ครบถ้วน");
        return false;
      }
      if (password.length < 6) {
        Swal.showValidationMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        return false;
      }
      return { firstName, lastName, password };
    },
  });

  if (result.isConfirmed && result.value) {
    return result.value;
  }
  return null;
}
