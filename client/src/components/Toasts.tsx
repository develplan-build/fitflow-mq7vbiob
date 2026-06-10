import React from 'react'
import { useStore } from '../store'

export default function Toasts() {
  const { toasts, dismissToast } = useStore()
  if (!toasts || toasts.length === 0) return null
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div
          key={t.id}
          className={'toast ' + t.type}
          onClick={() => dismissToast(t.id)}
          style={{ cursor: 'pointer' }}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}