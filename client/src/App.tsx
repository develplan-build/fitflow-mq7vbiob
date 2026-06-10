import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { StoreProvider } from './store'
import Toasts from './components/Toasts'
import Landing from './pages/Landing'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import CRM from './pages/CRM'
import Bookings from './pages/Bookings'
import Calendar from './pages/Calendar'
import Invoices from './pages/Invoices'
import Shifts from './pages/Shifts'
import Timesheets from './pages/Timesheets'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="crm" element={<CRM />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="shifts" element={<Shifts />} />
          <Route path="timesheets" element={<Timesheets />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
      <Toasts />
    </StoreProvider>
  )
}
