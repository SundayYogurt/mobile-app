import Swal from "sweetalert2";

export async function urineAlert({
  title = "บันทึกปัสสาวะ",
  label = "จำนวนครั้งที่ปัสสาวะ",
  placeholder = "เช่น 5",
  confirmText = "บันทึก",
  cancelText = "ยกเลิก",
  invalidMessage = "กรุณากรอกจำนวนครั้งที่ปัสสาวะให้ถูกต้อง",
  inputValue = null,
} = {}) {
  const result = await Swal.fire({
    title,
    position: 'center',
    width: '80%',
    customClass: { popup: 'swal2-responsive' },
    html: `
      <style>
        .swal2-input {
          box-sizing: border-box !important;
          width: calc(100% - 20px) !important; /* Adjust width to account for padding */
          padding: 10px !important; /* Add internal padding */
          margin: 6px 10px !important; /* Adjust margin */
        }
      </style>
      <div class="swal2-content" style="margin-top:6px;text-align:center">
        <label for="swal-count" style="display:block;font-size:0.9rem;margin:6px 1.2em 2px;color:#555">${label}</label>
        <input id="swal-count" class="swal2-input" placeholder="${placeholder}" type="number" inputmode="numeric" min="0" value="${inputValue !== null ? inputValue : ''}" />
      </div>
    `,
    showClass: { popup: 'swal2-slide-up-show' },
    hideClass: { popup: 'swal2-slide-up-hide' },
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#C266A4",
    reverseButtons: true,
    showCloseButton: true,
    allowEscapeKey: true,
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: () => {
      const val = /** @type {HTMLInputElement} */ (document.getElementById("swal-count"))?.value;
      const num = val ? Number(val) : null;
      if (!num || num < 0) {
        Swal.showValidationMessage(invalidMessage);
        return false;
      }
      return { count: num };
    },
  });

  if (result.isConfirmed && result.value) return result.value;
  return null;
}
