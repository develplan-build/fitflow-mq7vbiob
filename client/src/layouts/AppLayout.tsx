import React from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store'

const NAV = [
  { to: '/app', label: 'Dashboard', ic: '📊', end: true },
  { to: '/app/users', label: 'Utenti & Ruoli', ic: '🛡️' },
  { to: '/app/crm', label: 'CRM Clienti', ic: '👥' },
  { to: '/app/bookings', label: 'Prenotazioni', ic: '🎟️' },
  { to: '/app/calendar', label: 'Calendario', ic: '📅' },
  { to: '/app/invoices', label: 'Fatturazione', ic: '💳' },
  { to: '/app/shifts', label: 'Turni Staff', ic: '⏰' },
  { to: '/app/timesheets', label: 'Timesheet', ic: '⏱️' },
  { to: '/app/notifications', label: 'Notifiche', ic: '🔔' },
  { to: '/app/reports', label: 'Report & Export', ic: '📈' }
]

const TITLES: Record<string, { title: string; sub: string }> = {
  '/app': { title: 'Dashboard', sub: 'Panoramica generale della tua palestra' },
  '/app/users': { title: 'Utenti & Ruoli', sub: 'Gestione account staff e permessi' },
  '/app/crm': { title: 'CRM Clienti', sub: 'Anagrafica iscritti e abbonamenti' },
  '/app/bookings': { title: 'Prenotazioni', sub: 'Booking corsi e sale' },
  '/app/calendar': { title: 'Calendario', sub: 'Agenda mensile prenotazioni e turni' },
  '/app/invoices': { title: 'Fatturazione', sub: 'Fatture e pagamenti ricorrenti' },
  '/app/shifts': { title: 'Turni Staff', sub: 'Pianificazione turni del personale' },
  '/app/timesheets': { title: 'Timesheet', sub: 'Time tracking ore lavorate' },
  '/app/notifications': { title: 'Notifiche', sub: 'Centro notifiche e avvisi' },
  '/app/reports': { title: 'Report & Export', sub: 'Statistiche e export PDF' }
}

export default function AppLayout() {
  const nav = useNavigate()
  const loc = useLocation()
  const { demoMode, toggleDemo, resetAll } = useStore()
  const meta = TITLES[loc.pathname] || { title: 'FitFlow', sub: '' }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand" onClick={() => nav('/')} style={{cursor:'pointer'}}>
          <div className="logo">⚡</div>
          FitFlow
        </div>
        <div className="nav-section">Principale</div>
        {NAV.slice(0, 1).map(n => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <span className="ic">{n.ic}</span>{n.label}
          </NavLink>
        ))}
        <div className="nav-section">Gestione</div>
        {NAV.slice(1, 6).map(n => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <span className="ic">{n.ic}</span>{n.label}
          </NavLink>
        ))}
        <div className="nav-section">Staff & Avvisi</div>
        {NAV.slice(6).map(n => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <span className="ic">{n.ic}</span>{n.label}
          </NavLink>
        ))}
        <div style={{flex:1}} />
        <button className="nav-item" onClick={() => nav('/')}>
          <span className="ic">←</span>Torna al sito
        </button>
      </aside>

      <div className="main">
        <header className="header">
          <div className="titles">
            <div className="crumb">FitFlow / {meta.title}</div>
            <h1>{meta.title}</h1>
          </div>
          <div className="actions">
            <button className={'toggle-demo' + (demoMode ? ' on' : '')} onClick={toggleDemo}>
              {demoMode ? '● Demo attiva' : 'Carica dati demo'}
            </button>
            <button className="btn-reset" onClick={resetAll}>Azzera dati</button>
            <div className="user-chip">
              <div className="avatar">A</div>
              <div className="name">Admin</div>
            </div>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
