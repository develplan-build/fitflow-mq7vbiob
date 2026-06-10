import React from 'react'
import { useStore } from '../store'

export default function Toasts() {
  const { toasts } = useStore()
  if (!toasts.length) return null
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={'toast ' + t.type}>{t.msg}</div>
      ))}
    </div>
  )
}
