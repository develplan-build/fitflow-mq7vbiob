import React, { useState, useMemo } from 'react'
import { useStore, Invoice } from '../store'
import { API_URL } from '../config'
import Modal from '../components/Modal'

export default function Invoices() {
  const { data, addInvoice, updateInvoice, deleteInvoice, toast } = useStore()
  const [open, setOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState<Omit<Invoice, 'id'>>({
    memberId: '', memberName: '', amount: 25, status: 'pending',
    date: new Date().toISOString().slice(0, 10), plan: 'Basic mensile'
  })

  const filtered = useMemo(() => data.invoices.filter(i => statusFilter === 'all' || i.status === statusFilter), [data.invoices, statusFilter])

  const totals = useMemo(() => ({
    paid: data.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
    pending: data.invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0),
    overdue: data.invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
  }), [data.invoices])

  function openNew() {
    setForm({
      memberId: data.members[0]?.id || '', memberName: data.members[0]?.name || '',
      amount: 25, status: 'pending', date: new Date().toISOString().slice(0, 10), plan: 'Basic mensile'
    })
    setOpen(true)
  }
  function pickMember(id: string) {
    const m = data.members.find(x => x.id === id)
    if (m) setForm({ ...form, memberId: id, memberName: m.name })
  }
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.memberId) { alert('Aggiungi prima un cliente'); return }
    addInvoice(form); setOpen(false)
  }

  async function checkoutSubscription(plan: 'basic' | 'pro') {
    try {
      const r = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })
      const d = await r.json()
      if (d.url) { window.location.href = d.url; return }
      toast(d.error || 'Stripe non configurato', 'error')
    } catch (e: any) { toast('Errore: ' + e.message, 'error') }
  }

  return (
    <div>
      <div className="page-title">
        <div><h2>Fatturazione</h2><div className="sub">Fatture e pagamenti ricorrenti</div></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-sm ghost" onClick={() => checkoutSubscription('basic')}>Test checkout Basic</button>
          <button className="btn-sm ghost" onClick={() => checkoutSubscription('pro')}>Test checkout Pro</button>
          <button className="btn-sm primary" onClick={openNew}>+ Nuova fattura</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><div className="label">Incassato</div><div className="value">€ {totals.paid}</div><span className="trend up">✓ Pagato</span></div>
        <div className="kpi"><div className="label">In attesa</div><div className="value">€ {totals.pending}</div><span className="trend neutral">— Da incassare</span></div>
        <div className="kpi"><div className="label">Scaduto</div><div className="value">€ {totals.overdue}</div><span className="trend down">↓ Solleciti</span></div>
        <div className="kpi"><div className="label">Fatture totali</div><div className="value">{data.invoices.length}</div><span className="trend neutral">— Storico</span></div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Tutte</option>
            <option value="paid">Pagate</option>
            <option value="pending">In attesa</option>
            <option value="overdue">Scadute</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="emoji">💳</div>
            <h4>Nessuna fattura</h4>
            <p>Crea la prima fattura o configura Stripe per i pagamenti automatici.</p>
            <button className="btn-sm primary" onClick={openNew}>+ Crea fattura</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Cliente</th><th>Piano</th><th>Importo</th><th>Data</th><th>Stato</th><th></th></tr></thead>
              <tbody>
                {filtered.map(i => (
                  <tr key={i.id}>
                    <td><strong>{i.memberName}</strong></td>
                    <td>{i.plan}</td>
                    <td>€ {i.amount}</td>
                    <td>{i.date}</td>
                    <td><span className={'badge ' + (i.status === 'paid' ? 'ok' : i.status === 'pending' ? 'warn' : 'err')}>{i.status === 'paid' ? 'Pagata' : i.status === 'pending' ? 'In attesa' : 'Scaduta'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {i.status !== 'paid' && <button className="btn-icon" onClick={() => updateInvoice(i.id, { status: 'paid' })}>Segna pagata</button>}
                      <button className="btn-icon" onClick={() => { if (confirm('Eliminare fattura?')) deleteInvoice(i.id) }}>Elimina</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <Modal title="Nuova fattura" onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <div className="field"><label>Cliente</label>
              <select required value={form.memberId} onChange={e => pickMember(e.target.value)}>
                <option value="">— Seleziona —</option>
                {data.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Piano</label>
              <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value, amount: e.target.value.includes('Pro') ? 39 : 25 })}>
                <option value="Basic mensile">Basic mensile (25€)</option>
                <option value="Pro mensile">Pro mensile (39€)</option>
                <option value="Basic annuale">Basic annuale (250€)</option>
                <option value="Pro annuale">Pro annuale (390€)</option>
              </select>
            </div>
            <div className="field"><label>Importo (€)</label><input type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} /></div>
            <div className="field"><label>Data</label><input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div className="field"><label>Stato</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                <option value="pending">In attesa</option>
                <option value="paid">Pagata</option>
                <option value="overdue">Scaduta</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-sm ghost" onClick={() => setOpen(false)}>Annulla</button>
              <button type="submit" className="btn-sm primary">Crea fattura</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
