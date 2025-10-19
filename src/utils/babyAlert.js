import Swal from "sweetalert2";

// Alert ลงทะเบียนลูกน้อย (เพิ่ม label + น้ำหนักแรกเกิด + ปุ่มเท่ากัน)
export async function registerBabyAlert({
  title = "ลงทะเบียนลูกน้อย",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
} = {}) {
  const result = await Swal.fire({
    title,
    html: `
      <div class="swal2-content" style="margin-top:8px; text-align:left;">
        <label style="font-size:15px; color:#F0A4D6;">ชื่อของลูกน้อย</label>
        <input id="swal-baby-name" class="swal2-input" placeholder="เช่น น้องพอใจ" type="text" />

        <label style="font-size:15px; color:#F0A4D6;">วันเกิดของลูกน้อย</label>
        <input id="swal-baby-dob" class="swal2-input" placeholder="วันเกิดของลูกน้อย" type="date" />

        <label style="font-size:15px; color:#F0A4D6;">อายุปัจจุบัน</label>
        <input id="swal-baby-age" class="swal2-input" placeholder="คำนวณอัตโนมัติ" type="text" readonly />

        <label style="font-size:15px; color:#F0A4D6;">น้ำหนักแรกเกิด (กรัม)</label>
        <input id="swal-baby-weight" class="swal2-input" placeholder="เช่น 3200" type="number" min="500" max="8000" />
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#F5D8EB",
    cancelButtonColor: "#F5D8EB",
    reverseButtons: true,
    customClass: {
      confirmButton: "swal2-confirm-btn",
      cancelButton: "swal2-cancel-btn",
    },
    allowOutsideClick: () => !Swal.isLoading(),
    didOpen: () => {
      const titleEl = Swal.getTitle();
      if (titleEl) titleEl.style.color = "#F0A4D6";

      const dobEl = document.getElementById("swal-baby-dob");
      const ageEl = document.getElementById("swal-baby-age");

      const computeAge = (dobStr) => {
        if (!dobStr) return "";
        const dob = new Date(dobStr);
        const now = new Date();
        if (Number.isNaN(dob.getTime()) || dob > now) return "";
        let y = now.getFullYear() - dob.getFullYear();
        let m = now.getMonth() - dob.getMonth();
        let d = now.getDate() - dob.getDate();
        if (d < 0) {
          const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          d += prevMonth.getDate();
          m -= 1;
        }
        if (m < 0) {
          m += 12;
          y -= 1;
        }
        const parts = [];
        if (y > 0) parts.push(`${y} ปี`);
        if (m > 0) parts.push(`${m} เดือน`);
        parts.push(`${d} วัน`);
        return parts.join(" ");
      };

      const updateAge = () => {
        if (ageEl && dobEl) {
          ageEl.value = computeAge(dobEl.value);
        }
      };

      if (dobEl) {
        dobEl.addEventListener("input", updateAge);
        dobEl.addEventListener("change", updateAge);
        updateAge();
      }

      // ปรับขนาดปุ่มให้เท่ากัน
      const confirmBtn = Swal.getConfirmButton();
      const cancelBtn = Swal.getCancelButton();
      [confirmBtn, cancelBtn].forEach((btn) => {
        if (btn) {
          btn.style.width = "120px";
          btn.style.height = "42px";
          btn.style.borderRadius = "8px";
          btn.style.fontSize = "16px";
          btn.style.color = "#6C3B73";
          btn.style.fontWeight = "600";
        }
      });
    },
    preConfirm: () => {
      const name = document.getElementById("swal-baby-name")?.value?.trim();
      const dobStr = document.getElementById("swal-baby-dob")?.value;
      const weight = document.getElementById("swal-baby-weight")?.value?.trim();

      if (!name || !dobStr || !weight) {
        Swal.showValidationMessage("กรอกข้อมูลให้ครบทุกช่อง");
        return false;
      }

      const dob = new Date(dobStr);
      const now = new Date();
      if (Number.isNaN(dob.getTime()) || dob > now) {
        Swal.showValidationMessage("วันเกิดไม่ถูกต้อง");
        return false;
      }

      const ageText = (() => {
        let y = now.getFullYear() - dob.getFullYear();
        let m = now.getMonth() - dob.getMonth();
        let d = now.getDate() - dob.getDate();
        if (d < 0) {
          const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          d += prevMonth.getDate();
          m -= 1;
        }
        if (m < 0) {
          m += 12;
          y -= 1;
        }
        const parts = [];
        if (y > 0) parts.push(`${y} ปี`);
        if (m > 0) parts.push(`${m} เดือน`);
        parts.push(`${d} วัน`);
        return parts.join(" ");
      })();

      return { name, dob: dobStr, weight, ageText };
    },
  });

  if (result.isConfirmed && result.value) {
    return result.value;
  }
  return null;
}
