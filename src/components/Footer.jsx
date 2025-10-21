import React from 'react'
import { FiEye, FiUsers } from 'react-icons/fi'
import { useNavigate } from 'react-router'
import { useAuthContext } from '../context/AuthContext'
import useRealtimeMetrics from '../hooks/useRealtimeMetrics'

export const Footer = ({ visitorCount: visitorCountProp, onlineCount: onlineCountProp, className = '' }) => {
  const { visitorCount, onlineCount } = useRealtimeMetrics()
  const { user, logout } = useAuthContext()
  const navigate = useNavigate?.()

  const formattedVisitors = Number((visitorCountProp ?? visitorCount) || 0).toLocaleString()
  const formattedOnline = Number((onlineCountProp ?? onlineCount) || 0).toLocaleString()

  return (
    <footer className={`w-full fixed h-[60px] bottom-0 left-0 right-0 z-50 shadow-sm border-t border-neutral/20 bg-[#F5D8EB] text-base-content ${className}`}>
      <div className="max-w-screen-md mx-auto grid grid-cols-3 items-center gap-2 p-3">
        <button type="button" className="btn btn-ghost btn-sm justify-self-start gap-2 px-0">
          <FiEye className="text-primary" size={18} />
          <span className="opacity-80">Visitors</span>
          <span className="font-semibold">{formattedVisitors}</span>
        </button>

        <div className="justify-self-center">
          {user ? (
            <button
              type="button"
              className="btn btn-sm bg-transparent border-none text-[#6C3B73] hover:bg-[#f8f0f5]"
              onClick={() => {
                try {
                  logout?.()
                  if (navigate) navigate('/')
                } catch (err) {
                }
              }}
            >
              Logout
            </button>
          ) : null}
        </div>

        <button type="button" className="btn btn-ghost btn-sm justify-self-end gap-2 px-0">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <FiUsers className="text-success" size={18} />
          <span className="opacity-80">Online</span>
          <span className="font-semibold">{formattedOnline}</span>
        </button>
      </div>
    </footer>
  )
}

export default Footer
