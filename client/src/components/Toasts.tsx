import React from 'react'
import { useStore } from '../store'

export default function Toasts() {
  const { notifications } = useStore()
  const unread = (notifications || []).filter(n => !n.read).slice(0, 5)
  if (!unread.length) return null
  return (
    <div className="toast-wrap">
      {unread.map(t => (
        <div key={t.id} className={'toast ' + t.type}>
          <strong>{t.title}</strong>
          {t.message && <span> — {t.message}</span>}
        </div>
      ))}
    </div>
  )
}