import React from 'react'
import { useMatches, useNavigate } from 'react-router'
import { FiChevronLeft } from 'react-icons/fi'

export const Navbar = () => {
  const matches = useMatches?.() || []
  const current = [...matches].reverse().find(m => m?.handle && m.handle.title)
  const title = current?.handle?.title || 'MOMSURE แม่อุ่นใจ'
  const backTo = current?.handle?.backTo
  const navigate = useNavigate?.()
  return (
    <div className="navbar shadow-sm bg-[#f08ece]">
      {backTo ? (
        <button
          type="button"
          aria-label="ย้อนกลับ"
          className="btn btn-ghost btn-sm text-white"
          onClick={() => {
            if (!navigate) return;
            if (window.history.length > 1) {
              navigate(-1);
            } else if (backTo) {
              navigate(backTo);
            }
          }}
        >
          <FiChevronLeft size={24} />
        </button>
      ) : (
        <div className="w-10" />
      )}
      <div className="flex-1 flex justify-center">
        <span className="btn btn-ghost font-light text-[30px] text-white">{title}</span>
      </div>
      <div className="w-10" />
    </div>
  )
}
