```tsx
import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../store'
import '../app.css'          // layout globale
import '../components.css'   // componenti UI (modal, toast, ecc.)

// Titoli per le route (usati solo a scopo dimostrativo)
const TITLES: Record<string, { title: string; sub?: string }> = {
  '/app': { title: 'Dashboard' },
  '/app/users': { title: 'Utenti' },
  '/app/crm': { title: 'CRM' },
  '/app/bookings': { title: 'Prenotazioni' },
  '/app/calendar': { title: 'Calendario' },
  '/app/invoices': { title: 'Fatture' },
  '/app/shifts': { title: 'Turni' },
  '/app/timesheets': { title: 'Timesheets' },
  '/app/notifications': { title: 'Notifiche' },
  '/app/reports': { title: 'Report' },
}

export default function AppLayout() {
  const location = useLocation()
  const meta = TITLES[location.pathname] || { title: 'FitFlow' }

  // (eventuale) stato globale, ad es. utente loggato
  const { users } = useStore()

  return (
    <div className="app-shell">
      {/* ---------- Sidebar ---------- */}
      <nav className="sidebar">
        <h2 className="logo">FitFlow</h2>
        <ul className="nav-list">
          <li>
            <NavLink to="/app" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/users" className={({ isActive }) => (isActive ? 'active' : '')}>
              Utenti
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/crm" className={({ isActive }) => (isActive ? 'active' : '')}>
              CRM
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/bookings" className={({ isActive }) => (isActive ? 'active' : '')}>
              Prenotazioni
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/calendar" className={({ isActive }) => (isActive ? 'active' : '')}>
              Calendario
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/invoices" className={({ isActive }) => (isActive ? 'active' : '')}>
              Fatture
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/shifts" className={({ isActive }) => (isActive ? 'active' : '')}>
              Turni
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/timesheets" className={({ isActive }) => (isActive ? 'active' : '')}>
              Timesheets
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
              Notifiche
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/reports" className={({ isActive }) => (isActive ? 'active' : '')}>
              Report
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* ---------- Main content ---------- */}
      <main className="main">
        <header className="page-header">
          <h1>{meta.title}</h1>
          {meta.sub && <p className="subtitle">{meta.sub}</p>}
        </header>

        {/* Qui viene renderizzata la pagina figlia (Dashboard, Users, …) */}
        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
```