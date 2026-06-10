import React, { useState } from 'react'
import { useStore, Shift } from '../store'
import Modal from '../components/Modal'

const ROLES = ['Reception', 'Trainer Sala', 'Personal Trainer', 'Pulizie', 'Manager']

export default function Shifts() {
  const { data, addShift, deleteShift } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Omit<Shift, 'id'>>({
    userId: '', userName: '', date: new Date().toISOString().slice(0, 10),
    start: '09:00', end: '17:00', role: 'Reception'
  })

  const staff = data.users.filter(u => u.active)

  function openNew() {
    setForm({
      userId: staff[0]?.id || '', userName: staff[0]?.name || '',
      date: new Date().toISOString().slice(0, 10), start: '09:00', end: '17:00', role: 'Reception'
    })
    setOpen(true)
  }
  function pickUser(id: string) {
    const u = data.users.find(x => x.id === id)
    if (u) setForm({ ...form, userId: id, userName: u.name })
  }
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.userId) { alert('Crea prima un utente staff'); return }
    addShift(form); setOpen(false)
  }

  const grouped = data.shifts.reduce((acc, s) => {
    (acc[s.date] = acc[s.date] || []).push(s); return acc
  }, {} as Record<string, Shift[]>)
  const dates = Object.keys(grouped).sort()

  return (
    <div>
      <div className="page-title">
        <div><h2>Turni Staff</h2><div className="sub">{data.shifts.length} turni pianificati</div></div>
        <button className="btn-sm primary" onClick={openNew}>+ Nuovo turno</button>
      </div>

      <div className="card">
        {data.shifts.length === 0 ? (
          <div className="empty">
            <div className="emoji">⏰</div>
            <h4>Nessun turno pianificato</h4>
            <p>Pianifica i turni dello staff per la settimana.</p>
            <button className="btn-sm primary" onClick={openNew}>+ Aggiungi turno</button>
          </div>
        ) : (
          dates.map(date => (
            <div key={date} style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '8px 0 12px', fontSize: 14, color: 'var(--muted)' }}>{date}</h4>
              <div className="shift-grid">
                {grouped[date].map(s => (
                  <div key={s.id} className="shift-card">
                    <div className="who">{s.userName}</div>
                    <div className="role">{s.role}</div>
                    <div className="time">🕐 {s.start} — {s.end}</div>
                    <button className="btn-icon" onClick={() => { if (confirm('Eliminare turno?')) deleteShift(s.id) }}>Elimina</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {open && (
        <Modal title="Nuovo turno" onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <div className="field"><label>Staff</label>
              <select required value={form.userId} onChange={e => pickUser(e.target.value)}>
                <option value="">— Seleziona —</option>
                {staff.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Mansione</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="field"><label>Data</label><input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div className="field"><label>Inizio</label><input type="time" required value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} /></div>
            <div className="field"><label>Fine</label><input type="time" required value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} /></div>
            <div className="modal-actions">
              <button type="button" className="btn-sm ghost" onClick={() => setOpen(false)}>Annulla</button>
              <button type="submit" className="btn-sm primary">Crea turno</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
