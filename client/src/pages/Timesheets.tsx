import React, { useState, useMemo } from 'react'
import { useStore, Timesheet } from '../store'
import Modal from '../components/Modal'

export default function Timesheets() {
  const { data, addTimesheet, deleteTimesheet } = useStore()
  const [open, setOpen] = useState(false)
  const [filterUser, setFilterUser] = useState('all')
  const [form, setForm] = useState<Omit<Timesheet, 'id'>>({
    userId: '', userName: '', date: new Date().toISOString().slice(0, 10), hours: 8, note: ''
  })

  const filtered = useMemo(() => data.timesheets.filter(t => filterUser === 'all' || t.userId === filterUser), [data.timesheets, filterUser])
  const totalHours = filtered.reduce((s, t) => s + t.hours, 0)
  const byUser = useMemo(() => {
    const m: Record<string, number> = {}
    data.timesheets.forEach(t => { m[t.userName] = (m[t.userName] || 0) + t.hours })
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [data.timesheets])

  function openNew() {
    setForm({
      userId: data.users[0]?.id || '', userName: data.users[0]?.name || '',
      date: new Date().toISOString().slice(0, 10), hours: 8, note: ''
    })
    setOpen(true)
  }
  function pickUser(id: string) {
    const u = data.users.find(x => x.id === id)
    if (u) setForm({ ...form, userId: id, userName: u.name })
  }
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.userId) { alert('Crea prima un utente'); return }
    addTimesheet(form); setOpen(false)
  }

  return (
    <div>
      <div className="page-title">
        <div><h2>Timesheet</h2><div className="sub">Time tracking ore lavorate</div></div>
        <button className="btn-sm primary" onClick={openNew}>+ Registra ore</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><div className="label">Ore totali</div><div className="value">{totalHours}h</div><span className="trend up">↑ Tracciate</span></div>
        <div className="kpi"><div className="label">Membri attivi</div><div className="value">{byUser.length}</div><span className="trend neutral">— Staff</span></div>
        <div className="kpi"><div className="label">Registrazioni</div><div className="value">{filtered.length}</div><span className="trend neutral">— Voci</span></div>
        <div className="kpi"><div className="label">Media giornaliera</div><div className="value">{filtered.length ? (totalHours / filtered.length).toFixed(1) : '0'}h</div><span className="trend neutral">— Per voce</span></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>Registro ore</h3></div>
          <div className="filter-bar">
            <select value={filterUser} onChange={e => setFilterUser(e.target.value)}>
              <option value="all">Tutti i membri</option>
              {data.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="emoji">⏱️</div>
              <h4>Nessuna registrazione</h4>
              <p>Registra le ore lavorate dal tuo staff.</p>
              <button className="btn-sm primary" onClick={openNew}>+ Registra ore</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th>Membro</th><th>Data</th><th>Ore</th><th>Note</th><th></th></tr></thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td><strong>{t.userName}</strong></td>
                      <td>{t.date}</td>
                      <td>{t.hours}h</td>
                      <td>{t.note || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-icon" onClick={() => { if (confirm('Eliminare?')) deleteTimesheet(t.id) }}>Elimina</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><h3>Top per membro</h3></div>
          {byUser.length === 0 ? (
            <div className="empty"><div className="emoji">📊</div><h4>Nessun dato</h4><p>I totali appariranno qui.</p></div>
          ) : (
            <div style={{ padding: 8 }}>
              {byUser.map(([name, hrs]) => (
                <div key={name} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                    <span>{name}</span><strong>{hrs}h</strong>
                  </div>
                  <div className="bar"><div className="bar-fill" style={{ width: Math.min(100, (hrs / Math.max(...byUser.map(x => x[1]))) * 100) + '%' }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && (
        <Modal title="Registra ore" onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <div className="field"><label>Membro staff</label>
              <select required value={form.userId} onChange={e => pickUser(e.target.value)}>
                <option value="">— Seleziona —</option>
                {data.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Data</label><input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div className="field"><label>Ore lavorate</label><input type="number" step="0.5" min="0" required value={form.hours} onChange={e => setForm({ ...form, hours: parseFloat(e.target.value) })} /></div>
            <div className="field"><label>Note</label><textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
            <div className="modal-actions">
              <button type="button" className="btn-sm ghost" onClick={() => setOpen(false)}>Annulla</button>
              <button type="submit" className="btn-sm primary">Registra</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
