import React, { useState, useMemo } from 'react'
import { useStore } from '../store'

const MONTHS = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']
const DAYS = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom']

export default function Calendar() {
  const { data } = useStore()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const cells = useMemo(() => {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const offset = (first.getDay() + 6) % 7
    const arr: { date: string; day: number; muted: boolean }[] = []
    for (let i = 0; i < offset; i++) {
      const d = new Date(year, month, -offset + i + 1)
      arr.push({ date: d.toISOString().slice(0, 10), day: d.getDate(), muted: true })
    }
    for (let d = 1; d <= last.getDate(); d++) {
      const dt = new Date(year, month, d)
      arr.push({ date: dt.toISOString().slice(0, 10), day: d, muted: false })
    }
    while (arr.length % 7) {
      const d = new Date(year, month + 1, arr.length - offset - last.getDate() + 1)
      arr.push({ date: d.toISOString().slice(0, 10), day: d.getDate(), muted: true })
    }
    return arr
  }, [year, month])

  function eventsOn(date: string) {
    const bks = data.bookings.filter(b => b.date === date)
    const shf = data.shifts.filter(s => s.date === date)
    return { bookings: bks, shifts: shf, total: bks.length + shf.length }
  }

  function prev() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function next() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }
  function todayBtn() { setYear(today.getFullYear()); setMonth(today.getMonth()) }

  const todayIso = today.toISOString().slice(0, 10)
  const sel = selected ? eventsOn(selected) : null

  return (
    <div>
      <div className="page-title">
        <div><h2>Calendario</h2><div className="sub">Vista mensile prenotazioni e turni</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-sm ghost" onClick={prev}>← Prec</button>
          <button className="btn-sm ghost" onClick={todayBtn}>Oggi</button>
          <button className="btn-sm ghost" onClick={next}>Succ →</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>{MONTHS[month]} {year}</h3></div>
        <div className="cal-grid">
          {DAYS.map(d => <div key={d} className="cal-head">{d}</div>)}
          {cells.map((c, i) => {
            const ev = eventsOn(c.date)
            const isToday = c.date === todayIso
            return (
              <div key={i}
                className={'cal-cell' + (c.muted ? ' muted' : '') + (isToday ? ' today' : '')}
                onClick={() => setSelected(c.date)}>
                <div className="day">{c.day}</div>
                {ev.bookings.slice(0, 2).map(b => <div key={b.id} className="dot">🎟 {b.time} {b.activity}</div>)}
                {ev.shifts.slice(0, 1).map(s => <div key={s.id} className="dot">⏰ {s.userName}</div>)}
                {ev.total > 3 && <div className="dot">+{ev.total - 3} altri</div>}
              </div>
            )
          })}
        </div>
      </div>

      {selected && sel && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <h3>Eventi del {selected}</h3>
            <button className="btn-sm ghost" onClick={() => setSelected(null)}>Chiudi</button>
          </div>
          {sel.total === 0 ? (
            <div className="empty"><div className="emoji">🗓️</div><h4>Nessun evento</h4><p>Non ci sono prenotazioni né turni in questa data.</p></div>
          ) : (
            <div>
              {sel.bookings.length > 0 && <>
                <h4 style={{ margin: '8px 0 12px', fontSize: 14, color: 'var(--muted)' }}>Prenotazioni</h4>
                <table className="tbl"><thead><tr><th>Orario</th><th>Cliente</th><th>Attività</th><th>Stato</th></tr></thead>
                  <tbody>{sel.bookings.map(b => <tr key={b.id}><td>{b.time}</td><td>{b.memberName}</td><td>{b.activity}</td><td><span className={'badge ' + (b.status === 'confirmed' ? 'ok' : 'warn')}>{b.status}</span></td></tr>)}</tbody>
                </table>
              </>}
              {sel.shifts.length > 0 && <>
                <h4 style={{ margin: '16px 0 12px', fontSize: 14, color: 'var(--muted)' }}>Turni</h4>
                <table className="tbl"><thead><tr><th>Ora</th><th>Membro staff</th><th>Mansione</th></tr></thead>
                  <tbody>{sel.shifts.map(s => <tr key={s.id}><td>{s.start} - {s.end}</td><td>{s.userName}</td><td>{s.role}</td></tr>)}</tbody>
                </table>
              </>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
