import React, { useState, useMemo } from 'react'
import { useStore, Invoice } from '../store'
import { Modal } from '../components/Modal'
import { API_URL } from '../config'

// Listino piani centralizzato (fix logica prezzi annuali)
const PLAN_PRICES: Record<string, number> = {
  'Base': 25,
  'Pro': 39,
  'Pro Annuale': 390,
  'Base Annuale': 250,
}

function priceFor(plan: string): number {
  return PLAN_PRICES[plan] ?? 0
}

export default function Invoices() {
  const { invoices, setInvoices } = useStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)
  const [form, setForm] = useState<Partial<Invoice>>({
    memberName: '',
    plan: 'Base',
    amount: 25,
    date: new Date().toISOString().slice(0, 10),
    status: 'pending',
  })

  const totals = useMemo(() => {
    const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
    const pending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0)
    const overdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
    return { paid, pending, overdue, total: paid + pending + overdue }
  }, [invoices])

  function openNew() {
    setEditing(null)
    setForm({
      memberName: '',
      plan: 'Base',
      amount: PLAN_PRICES['Base'],
      date: new Date().toISOString().slice(0, 10),
      status: 'pending',
    })
    setOpen(true)
  }

  function openEdit(inv: Invoice) {
    setEditing(inv)
    setForm(inv)
    setOpen(true)
  }

  function onPlanChange(plan: string) {
    setForm(f => ({ ...f, plan, amount: priceFor(plan) }))
  }

  function save() {
    if (!form.memberName || !form.plan) return
    if (editing) {
      setInvoices(prev => prev.map(i => (i.id === editing.id ? { ...editing, ...form } as Invoice : i)))
    } else {
      const newInv: Invoice = {
        id: 'i' + Date.now(),
        memberName: form.memberName!,
        plan: form.plan!,
        amount: Number(form.amount) || priceFor(form.plan!),
        date: form.date || new Date().toISOString().slice(0, 10),
        status: (form.status as Invoice['status']) || 'pending',
      }
      setInvoices(prev => [newInv, ...prev])
    }
    setOpen(false)
  }

  function remove(id: string) {
    if (!confirm('Eliminare questa fattura?')) return
    setInvoices(prev => prev.filter(i => i.id !== id))
  }

  function markPaid(id: string) {
    setInvoices(prev => prev.map(i => (i.id === id ? { ...i, status: 'paid' } : i)))
  }

  async function checkout(plan: string) {
    try {
      const priceId = plan === 'Pro' ? 'price_pro_monthly' : 'price_base_monthly'
      const res = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Errore checkout')
    } catch (e: any) {
      alert('Errore di connessione: ' + e.message)
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h2>Fatture</h2>
        <button className="btn-primary" onClick={openNew}>+ Nuova fattura</button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Incassato</div>
          <div className="stat-value">€{totals.paid}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In attesa</div>
          <div className="stat-value">€{totals.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Scadute</div>
          <div className="stat-value">€{totals.overdue}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Totale</div>
          <div className="stat-value">€{totals.total}</div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Piano</th>
              <th>Importo</th>
              <th>Data</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(i => (
              <tr key={i.id}>
                <td>{i.memberName}</td>
                <td>{i.plan}</td>
                <td>€{i.amount}</td>
                <td>{i.date}</td>
                <td>
                  <span className={`badge badge-${i.status}`}>{i.status}</span>
                </td>
                <td className="row-actions">
                  {i.status !== 'paid' && (
                    <button className="btn-link" onClick={() => markPaid(i.id)}>Segna pagata</button>
                  )}
                  <button className="btn-link" onClick={() => openEdit(i)}>Modifica</button>
                  <button className="btn-link danger" onClick={() => remove(i.id)}>Elimina</button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={6} className="empty">Nessuna fattura</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Acquista piano (Stripe)</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => checkout('Base')}>Base €25/mese</button>
          <button className="btn-primary" onClick={() => checkout('Pro')}>Pro €39/mese</button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Modifica fattura' : 'Nuova fattura'}>
        <div className="form">
          <label>
            Cliente
            <input
              value={form.memberName || ''}
              onChange={e => setForm(f => ({ ...f, memberName: e.target.value }))}
            />
          </label>
          <label>
            Piano
            <select value={form.plan} onChange={e => onPlanChange(e.target.value)}>
              <option value="Base">Base (€25/mese)</option>
              <option value="Pro">Pro (€39/mese)</option>
              <option value="Base Annuale">Base Annuale (€250)</option>
              <option value="Pro Annuale">Pro Annuale (€390)</option>
            </select>
          </label>
          <label>
            Importo (€)
            <input
              type="number"
              value={form.amount ?? 0}
              onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
            />
          </label>
          <label>
            Data
            <input
              type="date"
              value={form.date || ''}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </label>
          <label>
            Stato
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as Invoice['status'] }))}
            >
              <option value="pending">In attesa</option>
              <option value="paid">Pagata</option>
              <option value="overdue">Scaduta</option>
            </select>
          </label>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setOpen(false)}>Annulla</button>
            <button className="btn-primary" onClick={save}>Salva</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}