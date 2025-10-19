import Swal from "sweetalert2";

// Popup น้ำหนักทารก: แสดง/กรอกน้ำหนักแรกเกิด และกรอกน้ำหนักปัจจุบัน (กรัม)
// คืนค่า { birthWeight, currentWeight }
export async function weightAlert({
  title = "น้ำหนักทารก",
  birthWeight = "",
  lockBirth = false,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
} = {}) {
  const result = await Swal.fire({
    title,
    html: `
      <div class="swal2-content" style="margin-top:6px;text-align:left">
        <label for="swal-birth-weight" style="display:block;font-size:0.9rem;margin:6px 1.2em 2px;color:#555">น้ำหนักแรกเกิด (กรัม)</label>
        <input id="swal-birth-weight" class="swal2-input" placeholder="เช่น 3200" type="number" inputmode="numeric" min="1" value="${birthWeight ?? ""}" ${lockBirth ? 'readonly style="background:#f6f6f6"' : ''} />
        <label for="swal-current-weight" style="display:block;font-size:0.9rem;margin:6px 1.2em 2px;color:#555">น้ำหนักปัจจุบัน (กรัม)</label>
        <input id="swal-current-weight" class="swal2-input" placeholder="เช่น 3500" type="number" inputmode="numeric" min="1" />
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
      const birth = /** @type {HTMLInputElement} */ (document.getElementById("swal-birth-weight"))?.value;
      const current = /** @type {HTMLInputElement} */ (document.getElementById("swal-current-weight"))?.value;

      const currentNum = current ? Number(current) : null;
      let birthNum = null;
      if (lockBirth) {
        birthNum = typeof birthWeight === 'number' ? birthWeight : (birth ? Number(birth) : null);
      } else {
        birthNum = birth ? Number(birth) : null;
        if (birth && (!birthNum || birthNum <= 0)) {
          Swal.showValidationMessage("ค่าน้ำหนักแรกเกิดไม่ถูกต้อง");
          return false;
        }
      }

      if (!currentNum || currentNum <= 0) {
        Swal.showValidationMessage("กรุณากรอกน้ำหนักปัจจุบัน (กรัม) ให้ถูกต้อง");
        return false;
      }

      return { birthWeight: birthNum, currentWeight: currentNum };
    },
  });

  if (result.isConfirmed && result.value) {
    return result.value;
  }
  return null;
}
