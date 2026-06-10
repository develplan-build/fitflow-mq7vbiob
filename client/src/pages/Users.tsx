import React, { useState } from 'react'
import { useStore, User } from '../store'
import Modal from '../components/Modal'

export default function Users() {
  const { data, addUser, updateUser, deleteUser } = useStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<Omit<User, 'id'>>({ name: '', email: '', role: 'staff', active: true })

  function openNew() { setEditing(null); setForm({ name: '', email: '', role: 'staff', active: true }); setOpen(true) }
  function openEdit(u: User) { setEditing(u); setForm({ name: u.name, email: u.email, role: u.role, active: u.active }); setOpen(true) }
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) updateUser(editing.id, form); else addUser(form)
    setOpen(false)
  }
  function toggleActive(u: User) { updateUser(u.id, { active: !u.active }) }

  const roleLabel = (r: string) => r === 'admin' ? 'Amministratore' : r === 'staff' ? 'Staff' : 'Trainer'

  return (
    <div>
      <div className="page-title">
        <div><h2>Utenti & Ruoli</h2><div className="sub">Gestisci accessi e permessi dello staff</div></div>
        <button className="btn-sm primary" onClick={openNew}>+ Nuovo utente</button>
      </div>

      <div className="card">
        {data.users.length === 0 ? (
          <div className="empty">
            <div className="emoji">🛡️</div>
            <h4>Nessun utente registrato</h4>
            <p>Crea il primo account staff per gestire la palestra.</p>
            <button className="btn-sm primary" onClick={openNew}>+ Crea utente</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Nome</th><th>Email</th><th>Ruolo</th><th>Stato</th><th></th></tr></thead>
              <tbody>
                {data.users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={'badge ' + (u.role === 'admin' ? 'info' : u.role === 'trainer' ? 'warn' : 'muted')}>{roleLabel(u.role)}</span></td>
                    <td><span className={'badge ' + (u.active ? 'ok' : 'err')}>{u.active ? 'Attivo' : 'Disattivato'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon" onClick={() => toggleActive(u)}>{u.active ? 'Disattiva' : 'Attiva'}</button>
                      <button className="btn-icon" onClick={() => openEdit(u)}>Modifica</button>
                      <button className="btn-icon" onClick={() => { if (confirm('Eliminare ' + u.name + '?')) deleteUser(u.id) }}>Elimina</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <Modal title={editing ? 'Modifica utente' : 'Nuovo utente'} onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <div className="field"><label>Nome</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="field"><label>Ruolo</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as any })}>
                <option value="admin">Amministratore</option>
                <option value="staff">Staff</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>
            <div className="field"><label>Stato</label>
              <select value={form.active ? '1' : '0'} onChange={e => setForm({ ...form, active: e.target.value === '1' })}>
                <option value="1">Attivo</option><option value="0">Disattivato</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-sm ghost" onClick={() => setOpen(false)}>Annulla</button>
              <button type="submit" className="btn-sm primary">{editing ? 'Salva' : 'Crea utente'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
