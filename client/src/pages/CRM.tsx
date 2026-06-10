import React, { useState, useMemo } from 'react'
import { useStore, Member } from '../store'
import Modal from '../components/Modal'

export default function CRM() {
  const { data, addMember, updateMember, deleteMember } = useStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [q, setQ] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState<Omit<Member, 'id'>>({ name: '', email: '', phone: '', plan: 'Basic', status: 'active', joined: new Date().toISOString().slice(0, 10) })

  const filtered = useMemo(() => data.members.filter(m => {
    if (q && !`${m.name} ${m.email}`.toLowerCase().includes(q.toLowerCase())) return false
    if (planFilter !== 'all' && m.plan !== planFilter) return false
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    return true
  }), [data.members, q, planFilter, statusFilter])

  function openNew() {
    setEditing(null)
    setForm({ name: '', email: '', phone: '', plan: 'Basic', status: 'active', joined: new Date().toISOString().slice(0, 10) })
    setOpen(true)
  }
  function openEdit(m: Member) {
    setEditing(m); setForm({ name: m.name, email: m.email, phone: m.phone, plan: m.plan, status: m.status, joined: m.joined }); setOpen(true)
  }
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) updateMember(editing.id, form)
    else addMember(form)
    setOpen(false)
  }
  function exportCSV() {
    const head = 'Nome,Email,Telefono,Piano,Stato,Iscrizione\n'
    const body = filtered.map(m => `${m.name},${m.email},${m.phone},${m.plan},${m.status},${m.joined}`).join('\n')
    const blob = new Blob([head + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'clienti.csv'; a.click()
  }

  return (
    <div>
      <div className="page-title">
        <div><h2>CRM Clienti</h2><div className="sub">{data.members.length} iscritti totali</div></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-sm ghost" onClick={exportCSV}>📥 Esporta CSV</button>
          <button className="btn-sm primary" onClick={openNew}>+ Nuovo cliente</button>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input placeholder="Cerca per nome o email..." value={q} onChange={e => setQ(e.target.value)} />
          <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
            <option value="all">Tutti i piani</option><option value="Basic">Basic</option><option value="Pro">Pro</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Tutti gli stati</option><option value="active">Attivo</option><option value="suspended">Sospeso</option><option value="expired">Scaduto</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="emoji">👥</div>
            <h4>{data.members.length === 0 ? 'Nessun cliente ancora' : 'Nessun risultato'}</h4>
            <p>{data.members.length === 0 ? 'Aggiungi il tuo primo iscritto per iniziare.' : 'Modifica i filtri o aggiungi un nuovo cliente.'}</p>
            <button className="btn-sm primary" onClick={openNew}>+ Aggiungi cliente</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Nome</th><th>Email</th><th>Telefono</th><th>Piano</th><th>Stato</th><th>Iscritto</th><th></th></tr></thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.email}</td>
                    <td>{m.phone}</td>
                    <td><span className={'badge ' + (m.plan === 'Pro' ? 'info' : 'muted')}>{m.plan}</span></td>
                    <td><span className={'badge ' + (m.status === 'active' ? 'ok' : m.status === 'suspended' ? 'warn' : 'err')}>{m.status === 'active' ? 'Attivo' : m.status === 'suspended' ? 'Sospeso' : 'Scaduto'}</span></td>
                    <td>{m.joined}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon" onClick={() => openEdit(m)}>Modifica</button>
                      <button className="btn-icon" onClick={() => { if (confirm('Eliminare ' + m.name + '?')) deleteMember(m.id) }}>Elimina</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <Modal title={editing ? 'Modifica cliente' : 'Nuovo cliente'} onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <div className="field"><label>Nome completo</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="field"><label>Telefono</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="field"><label>Piano</label>
              <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value as any })}>
                <option value="Basic">Basic</option><option value="Pro">Pro</option>
              </select>
            </div>
            <div className="field"><label>Stato</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                <option value="active">Attivo</option><option value="suspended">Sospeso</option><option value="expired">Scaduto</option>
              </select>
            </div>
            <div className="field"><label>Data iscrizione</label><input type="date" value={form.joined} onChange={e => setForm({ ...form, joined: e.target.value })} /></div>
            <div className="modal-actions">
              <button type="button" className="btn-sm ghost" onClick={() => setOpen(false)}>Annulla</button>
              <button type="submit" className="btn-sm primary">{editing ? 'Salva' : 'Crea cliente'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
