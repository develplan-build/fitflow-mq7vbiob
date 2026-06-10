import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'

const TITLES: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/users': 'Utenti',
  '/app/crm': 'CRM',
  '/app/bookings': 'Prenotazioni',
  '/app/calendar': 'Calendario',
  '/app/invoices': 'Fatture',
  '/app/shifts': 'Turni',
  '/app/timesheets': 'Timesheets',
  '/app/notifications': 'Notifiche',
  '/app/reports': 'Report',
}

export default function AppLayout() {
  const location = useLocation()
  const title = TITLES[location.pathname] || 'FitFlow'

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="logo">FitFlow</div>
        <ul className="nav-list">
          <li><NavLink to="/app" end>Dashboard</NavLink></li>
          <li><NavLink to="/app/users">Utenti</NavLink></li>
          <li><NavLink to="/app/crm">CRM</NavLink></li>
          <li><NavLink to="/app/bookings">Prenotazioni</NavLink></li>
          <li><NavLink to="/app/calendar">Calendario</NavLink></li>
          <li><NavLink to="/app/invoices">Fatture</NavLink></li>
          <li><NavLink to="/app/shifts">Turni</NavLink></li>
          <li><NavLink to="/app/timesheets">Timesheets</NavLink></li>
          <li><NavLink to="/app/notifications">Notifiche</NavLink></li>
          <li><NavLink to="/app/reports">Report</NavLink></li>
        </ul>
      </nav>
      <main className="main">
        <header className="page-header">
          <h1>{title}</h1>
        </header>
        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}