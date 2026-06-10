import React, { useState, useMemo } from 'react'
import { useStore, Booking } from '../store'
import Modal from '../components/Modal'

const ACTIVITIES = ['Spinning', 'Yoga', 'CrossFit', 'Pilates', 'Sala pesi', 'Personal training']

export default function Bookings() {
  const { data, addBooking, updateBooking, deleteBooking } = useStore()
  const [open, setOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [actFilter, setActFilter] = useState('all')
  const [form, setForm] = useState<Omit<Booking, 'id'>>({
    memberId: '', memberName: '', activity: 'Spinning',
    date: new Date().toISOString().slice(0, 10), time: '18:00', status: 'confirmed'
  })

  const filtered = useMemo(() => data.bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    if (actFilter !== 'all' && b.activity !== actFilter) return false
    return true
  }), [data.bookings, statusFilter, actFilter])

  function openNew() {
    setForm({
      memberId: data.members[0]?.id || '', memberName: data.members[0]?.name || '',
      activity: 'Spinning', date: new Date().toISOString().slice(0, 10), time: '18:00', status: 'confirmed'
    })
    setOpen(true)
  }
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.memberId) { alert('Aggiungi prima un cliente nel CRM'); return }
    addBooking(form); setOpen(false)
  }
  function pickMember(id: string) {
    const m = data.members.find(x => x.id === id)
    if (m) setForm({ ...form, memberId: id, memberName: m.name })
  }
  function setStatus(b: Booking, s: Booking['status']) { updateBooking(b.id, { status: s }) }

  return (
    <div>
      <div className="page-title">
        <div><h2>Prenotazioni</h2><div className="sub">{data.bookings.length} prenotazioni totali</div></div>
        <button className="btn-sm primary" onClick={openNew}>+ Nuova prenotazione</button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Tutti gli stati</option>
            <option value="confirmed">Confermata</option>
            <option value="pending">In attesa</option>
            <option value="cancelled">Annullata</option>
          </select>
          <select value={actFilter} onChange={e => setActFilter(e.target.value)}>
            <option value="all">Tutte le attività</option>
            {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="emoji">🎟️</div>
            <h4>Nessuna prenotazione</h4>
            <p>Crea la prima prenotazione per un cliente.</p>
            <button className="btn-sm primary" onClick={openNew}>+ Crea prenotazione</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Cliente</th><th>Attività</th><th>Data</th><th>Orario</th><th>Stato</th><th></th></tr></thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.memberName}</strong></td>
                    <td>{b.activity}</td>
                    <td>{b.date}</td>
                    <td>{b.time}</td>
                    <td><span className={'badge ' + (b.status === 'confirmed' ? 'ok' : b.status === 'pending' ? 'warn' : 'err')}>{b.status === 'confirmed' ? 'Confermata' : b.status === 'pending' ? 'In attesa' : 'Annullata'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {b.status !== 'confirmed' && <button className="btn-icon" onClick={() => setStatus(b, 'confirmed')}>Conferma</button>}
                      {b.status !== 'cancelled' && <button className="btn-icon" onClick={() => setStatus(b, 'cancelled')}>Annulla</button>}
                      <button className="btn-icon" onClick={() => { if (confirm('Eliminare prenotazione?')) deleteBooking(b.id) }}>Elimina</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <Modal title="Nuova prenotazione" onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <div className="field"><label>Cliente</label>
              <select required value={form.memberId} onChange={e => pickMember(e.target.value)}>
                <option value="">— Seleziona cliente —</option>
                {data.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Attività</label>
              <select value={form.activity} onChange={e => setForm({ ...form, activity: e.target.value })}>
                {ACTIVITIES.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="field"><label>Data</label><input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div className="field"><label>Orario</label><input type="time" required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
            <div className="field"><label>Stato</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                <option value="confirmed">Confermata</option>
                <option value="pending">In attesa</option>
                <option value="cancelled">Annullata</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-sm ghost" onClick={() => setOpen(false)}>Annulla</button>
              <button type="submit" className="btn-sm primary">Crea prenotazione</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
