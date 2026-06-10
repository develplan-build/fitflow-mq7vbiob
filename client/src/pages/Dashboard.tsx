import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#F97316', '#fb923c', '#fdba74', '#fed7aa']

export default function Dashboard() {
  const nav = useNavigate()
  const { data, demoMode } = useStore()

  const totalRevenue = useMemo(() => data.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0), [data.invoices])
  const activeMembers = data.members.filter(m => m.status === 'active').length
  const pendingInvoices = data.invoices.filter(i => i.status !== 'paid').length
  const todayBookings = data.bookings.filter(b => b.status === 'confirmed').length

  const revenueData = demoMode ? [
    { m: 'Lug', v: 2400 }, { m: 'Ago', v: 2100 }, { m: 'Set', v: 3100 },
    { m: 'Ott', v: 3500 }, { m: 'Nov', v: 4200 }, { m: 'Dic', v: 4800 }
  ] : []

  const activityData = demoMode ? [
    { name: 'Spinning', v: 32 }, { name: 'Yoga', v: 28 },
    { name: 'CrossFit', v: 24 }, { name: 'Pilates', v: 18 }
  ] : []

  const planSplit = useMemo(() => {
    const basic = data.members.filter(m => m.plan === 'Basic').length
    const pro = data.members.filter(m => m.plan === 'Pro').length
    if (basic + pro === 0) return []
    return [{ name: 'Basic', value: basic }, { name: 'Pro', value: pro }]
  }, [data.members])

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi">
          <div className="label">Ricavi totali</div>
          <div className="value">€ {totalRevenue.toLocaleString()}</div>
          <span className={'trend ' + (totalRevenue > 0 ? 'up' : 'neutral')}>{totalRevenue > 0 ? '↑ Aggiornato' : '— Nessun dato'}</span>
        </div>
        <div className="kpi">
          <div className="label">Iscritti attivi</div>
          <div className="value">{activeMembers}</div>
          <span className={'trend ' + (activeMembers > 0 ? 'up' : 'neutral')}>{activeMembers > 0 ? '↑ Live' : '— Vuoto'}</span>
        </div>
        <div className="kpi">
          <div className="label">Prenotazioni confermate</div>
          <div className="value">{todayBookings}</div>
          <span className={'trend ' + (todayBookings > 0 ? 'up' : 'neutral')}>{todayBookings > 0 ? '↑ Attive' : '— Vuoto'}</span>
        </div>
        <div className="kpi">
          <div className="label">Fatture da incassare</div>
          <div className="value">{pendingInvoices}</div>
          <span className={'trend ' + (pendingInvoices > 0 ? 'down' : 'up')}>{pendingInvoices > 0 ? '↓ Attenzione' : '✓ Tutto a posto'}</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Andamento ricavi</h3>
            <button className="btn-sm ghost" onClick={() => nav('/app/reports')}>Vai ai report →</button>
          </div>
          {revenueData.length === 0 ? (
            <div className="empty">
              <div className="emoji">📈</div>
              <h4>Nessun dato di vendita</h4>
              <p>Attiva la modalità demo o inizia a registrare fatture per vedere i grafici.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="m" stroke="#8a8a93" fontSize={12} />
                <YAxis stroke="#8a8a93" fontSize={12} />
                <Tooltip contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="v" stroke="#F97316" strokeWidth={3} dot={{ fill: '#F97316', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Distribuzione piani</h3>
          </div>
          {planSplit.length === 0 ? (
            <div className="empty">
              <div className="emoji">🍩</div>
              <h4>Nessun iscritto</h4>
              <p>Aggiungi clienti dal CRM per vedere la distribuzione.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={planSplit} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                  {planSplit.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Attività più prenotate</h3>
          <button className="btn-sm ghost" onClick={() => nav('/app/bookings')}>Gestisci prenotazioni →</button>
        </div>
        {activityData.length === 0 ? (
          <div className="empty">
            <div className="emoji">🏋️</div>
            <h4>Nessuna attività registrata</h4>
            <p>Le statistiche compariranno appena registrerai le prime prenotazioni.</p>
            <button className="btn-sm primary" onClick={() => nav('/app/bookings')}>Crea prenotazione</button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={activityData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#8a8a93" fontSize={12} />
              <YAxis stroke="#8a8a93" fontSize={12} />
              <Tooltip contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="v" fill="#F97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
