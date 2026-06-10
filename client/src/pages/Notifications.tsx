import React, { useState } from 'react'
import { useStore } from '../store'
import { API_URL } from '../config'
import Modal from '../components/Modal'

export default function Notifications() {
  const { data, markRead, clearNotifications, addNotification, toast } = useStore()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ channel: 'email', to: '', subject: '', body: '' })

  const filtered = data.notifications.filter(n => filter === 'all' || (filter === 'unread' && !n.read) || n.type === filter)
  const unread = data.notifications.filter(n => !n.read).length

  async function sendNow(e: React.FormEvent) {
    e.preventDefault()
    setOpen(false)
    try {
      const endpoint = form.channel === 'email' ? '/api/email/send' : '/api/sms/send'
      const body = form.channel === 'email'
        ? { to: form.to, subject: form.subject, body: form.body }
        : { to: form.to, body: form.body }
      const r = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
      const d = await r.json()
      if (d.ok) {
        addNotification({ title: `${form.channel.toUpperCase()} inviato`, body: `A: ${form.to}`, type: 'success', read: false, date: new Date().toISOString().slice(0, 10) })
        toast('Messaggio inviato', 'success')
      } else {
        addNotification({ title: `${form.channel.toUpperCase()} non configurato`, body: d.error || 'Servizio non disponibile', type: 'warning', read: false, date: new Date().toISOString().slice(0, 10) })
        toast(d.error || 'Servizio non configurato', 'error')
      }
    } catch (e: any) { toast('Errore: ' + e.message, 'error') }
    setForm({ channel: 'email', to: '', subject: '', body: '' })
  }

  return (
    <div>
      <div className="page-title">
        <div><h2>Notifiche</h2><div className="sub">{unread} non lette · {data.notifications.length} totali</div></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-sm ghost" onClick={clearNotifications}>Svuota</button>
          <button className="btn-sm primary" onClick={() => setOpen(true)}>✉ Invia messaggio</button>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">Tutte</option>
            <option value="unread">Non lette</option>
            <option value="info">Info</option>
            <option value="success">Successo</option>
            <option value="warning">Avviso</option>
            <option value="error">Errore</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="emoji">🔔</div>
            <h4>Nessuna notifica</h4>
            <p>Le notifiche appariranno qui quando il sistema le genererà.</p>
          </div>
        ) : (
          <div className="notif-list">
            {filtered.map(n => (
              <div key={n.id} className={'notif ' + n.type + (n.read ? ' read' : '')}>
                <div className="ic">{n.type === 'success' ? '✓' : n.type === 'warning' ? '⚠' : n.type === 'error' ? '✕' : 'ℹ'}</div>
                <div className="body">
                  <div className="top"><strong>{n.title}</strong><span className="date">{n.date}</span></div>
                  <div className="msg">{n.body}</div>
                </div>
                {!n.read && <button className="btn-icon" onClick={() => markRead(n.id)}>Segna letta</button>}
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <Modal title="Invia messaggio" onClose={() => setOpen(false)}>
          <form onSubmit={sendNow}>
            <div className="field"><label>Canale</label>
              <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}>
                <option value="email">Email (Resend)</option>
                <option value="sms">SMS (Twilio)</option>
              </select>
            </div>
            <div className="field"><label>Destinatario</label><input required placeholder={form.channel === 'email' ? 'cliente@mail.com' : '+39 333 1234567'} value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} /></div>
            {form.channel === 'email' && (
              <div className="field"><label>Oggetto</label><input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
            )}
            <div className="field"><label>Messaggio</label><textarea required value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></div>
            <div className="modal-actions">
              <button type="button" className="btn-sm ghost" onClick={() => setOpen(false)}>Annulla</button>
              <button type="submit" className="btn-sm primary">Invia ora</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
