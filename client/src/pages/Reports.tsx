import React, { useMemo } from 'react'
import { useStore } from '../store'
import { API_URL } from '../config'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function Reports() {
  const { data, demoMode, toast } = useStore()

  const membersByPlan = useMemo(() => {
    const basic = data.members.filter(m => m.plan === 'Basic').length
    const pro = data.members.filter(m => m.plan === 'Pro').length
    if (basic + pro === 0) return []
    return [{ name: 'Basic', value: basic }, { name: 'Pro', value: pro }]
  }, [data.members])

  const monthly = demoMode ? [
    { m: 'Gen', ricavi: 3200, iscritti: 8 },
    { m: 'Feb', ricavi: 3800, iscritti: 12 },
    { m: 'Mar', ricavi: 4100, iscritti: 9 },
    { m: 'Apr', ricavi: 4600, iscritti: 14 },
    { m: 'Mag', ricavi: 5200, iscritti: 18 },
    { m: 'Giu', ricavi: 5800, iscritti: 22 }
  ] : []

  const occupancy = demoMode ? [
    { d: 'Lun', v: 65 }, { d: 'Mar', v: 72 }, { d: 'Mer', v: 80 },
    { d: 'Gio', v: 75 }, { d: 'Ven', v: 88 }, { d: 'Sab', v: 95 }, { d: 'Dom', v: 45 }
  ] : []

  async function exportPDF(kind: string) {
    try {
      const r = await fetch(`${API_URL}/api/reports/pdf`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, data })
      })
      if (r.headers.get('content-type')?.includes('application/pdf')) {
        const blob = await r.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `report-${kind}.pdf`; a.click()
        toast('Report PDF scaricato', 'success')
      } else {
        const d = await r.json()
        toast(d.error || 'Servizio PDF non configurato', 'error')
      }
    } catch (e: any) { toast('Errore: ' + e.message, 'error') }
  }

  function exportCSV() {
    const rows: string[] = ['Tipo,Conteggio']
    rows.push(`Iscritti totali,${data.members.length}`)
    rows.push(`Iscritti attivi,${data.members.filter(m => m.status === 'active').length}`)
    rows.push(`Prenotazioni totali,${data.bookings.length}`)
    rows.push(`Fatture totali,${data.invoices.length}`)
    rows.push(`Ricavi incassati,${data.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)}`)
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'riepilogo.csv'; a.click()
    toast('CSV scaricato', 'success')
  }

  return (
    <div>
      <div className="page-title">
        <div><h2>Report & Export</h2><div className="sub">Statistiche e download dati</div></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-sm ghost" onClick={exportCSV}>📥 Export CSV</button>
          <button className="btn-sm ghost" onClick={() => exportPDF('finanziario')}>📄 PDF Finanziario</button>
          <button className="btn-sm primary" onClick={() => exportPDF('completo')}>📄 PDF Completo</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><div className="label">Iscritti</div><div className="value">{data.members.length}</div><span className="trend neutral">— Tot</span></div>
        <div className="kpi"><div className="label">Prenotazioni</div><div className="value">{data.bookings.length}</div><span className="trend neutral">— Tot</span></div>
        <div className="kpi"><div className="label">Ricavi</div><div className="value">€ {data.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)}</div><span className="trend up">↑ Incassati</span></div>
        <div className="kpi"><div className="label">Ore staff</div><div className="value">{data.timesheets.reduce((s, t) => s + t.hours, 0)}h</div><span className="trend neutral">— Tracciate</span></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>Andamento semestrale</h3></div>
          {monthly.length === 0 ? (
            <div className="empty"><div className="emoji">📈</div><h4>Nessuna serie storica</h4><p>Attiva la demo o registra fatture nel tempo.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="m" stroke="#8a8a93" fontSize={12} />
                <YAxis stroke="#8a8a93" fontSize={12} />
                <Tooltip contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="ricavi" stroke="#F97316" strokeWidth={2} fill="url(#gR)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header"><h3>Nuovi iscritti</h3></div>
          {monthly.length === 0 ? (
            <div className="empty"><div className="emoji">👥</div><h4>Nessun dato</h4><p>Le iscrizioni mensili appariranno qui.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="m" stroke="#8a8a93" fontSize={12} />
                <YAxis stroke="#8a8a93" fontSize={12} />
                <Tooltip contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="iscritti" stroke="#fdba74" strokeWidth={3} dot={{ fill: '#fdba74', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Occupazione settimanale (%)</h3></div>
        {occupancy.length === 0 ? (
          <div className="empty"><div className="emoji">🏋️</div><h4>Nessun dato</h4><p>I tassi di occupazione delle sale appariranno qui.</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={occupancy}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="d" stroke="#8a8a93" fontSize={12} />
              <YAxis stroke="#8a8a93" fontSize={12} />
              <Tooltip contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="v" fill="#F97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <div className="card-header"><h3>Distribuzione piani</h3></div>
        {membersByPlan.length === 0 ? (
          <div className="empty"><div className="emoji">📊</div><h4>Nessun iscritto</h4><p>I dati appariranno appena registri clienti.</p></div>
        ) : (
          <div style={{ padding: 8 }}>
            {membersByPlan.map(p => (
              <div key={p.name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                  <span>{p.name}</span><strong>{p.value} iscritti</strong>
                </div>
                <div className="bar"><div className="bar-fill" style={{ width: (p.value / data.members.length * 100) + '%' }} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
