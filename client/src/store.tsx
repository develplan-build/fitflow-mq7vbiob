import React, { createContext, useContext, useState, useCallback } from 'react'

export type Member = { id: string; name: string; email: string; phone: string; plan: 'Basic' | 'Pro'; status: 'active' | 'suspended' | 'expired'; joined: string }
export type User = { id: string; name: string; email: string; role: 'admin' | 'staff' | 'trainer'; active: boolean }
export type Booking = { id: string; memberId: string; memberName: string; activity: string; date: string; time: string; status: 'confirmed' | 'pending' | 'cancelled' }
export type Invoice = { id: string; memberId: string; memberName: string; amount: number; status: 'paid' | 'pending' | 'overdue'; date: string; plan: string }
export type Shift = { id: string; userId: string; userName: string; date: string; start: string; end: string; role: string }
export type Timesheet = { id: string; userId: string; userName: string; date: string; hours: number; note: string }
export type Notification = { id: string; title: string; body: string; type: 'info' | 'success' | 'warning' | 'error'; read: boolean; date: string }

type Data = {
  users: User[]
  members: Member[]
  bookings: Booking[]
  invoices: Invoice[]
  shifts: Shift[]
  timesheets: Timesheet[]
  notifications: Notification[]
}

const EMPTY: Data = { users: [], members: [], bookings: [], invoices: [], shifts: [], timesheets: [], notifications: [] }

function demoData(): Data {
  return {
    users: [
      { id: 'u1', name: 'Marco Bianchi', email: 'marco@fitflow.app', role: 'admin', active: true },
      { id: 'u2', name: 'Giulia Rossi', email: 'giulia@fitflow.app', role: 'staff', active: true },
      { id: 'u3', name: 'Luca Verdi', email: 'luca@fitflow.app', role: 'trainer', active: true },
      { id: 'u4', name: 'Anna Neri', email: 'anna@fitflow.app', role: 'trainer', active: false }
    ],
    members: [
      { id: 'm1', name: 'Paolo Ferri', email: 'paolo.f@mail.it', phone: '+39 333 111 2222', plan: 'Pro', status: 'active', joined: '2024-09-12' },
      { id: 'm2', name: 'Sara Conti', email: 'sara.c@mail.it', phone: '+39 333 222 3333', plan: 'Basic', status: 'active', joined: '2024-10-03' },
      { id: 'm3', name: 'Davide Galli', email: 'davide.g@mail.it', phone: '+39 333 333 4444', plan: 'Pro', status: 'active', joined: '2024-11-22' },
      { id: 'm4', name: 'Elena Marini', email: 'elena.m@mail.it', phone: '+39 333 444 5555', plan: 'Basic', status: 'expired', joined: '2024-05-10' },
      { id: 'm5', name: 'Matteo Russo', email: 'matteo.r@mail.it', phone: '+39 333 555 6666', plan: 'Pro', status: 'suspended', joined: '2024-08-01' }
    ],
    bookings: [
      { id: 'b1', memberId: 'm1', memberName: 'Paolo Ferri', activity: 'Spinning', date: '2025-01-15', time: '18:00', status: 'confirmed' },
      { id: 'b2', memberId: 'm2', memberName: 'Sara Conti', activity: 'Yoga', date: '2025-01-15', time: '19:30', status: 'confirmed' },
      { id: 'b3', memberId: 'm3', memberName: 'Davide Galli', activity: 'CrossFit', date: '2025-01-16', time: '07:00', status: 'pending' },
      { id: 'b4', memberId: 'm1', memberName: 'Paolo Ferri', activity: 'Pilates', date: '2025-01-17', time: '10:00', status: 'confirmed' }
    ],
    invoices: [
      { id: 'inv1', memberId: 'm1', memberName: 'Paolo Ferri', amount: 39, status: 'paid', date: '2025-01-01', plan: 'Pro mensile' },
      { id: 'inv2', memberId: 'm2', memberName: 'Sara Conti', amount: 25, status: 'paid', date: '2025-01-01', plan: 'Basic mensile' },
      { id: 'inv3', memberId: 'm3', memberName: 'Davide Galli', amount: 39, status: 'pending', date: '2025-01-10', plan: 'Pro mensile' },
      { id: 'inv4', memberId: 'm4', memberName: 'Elena Marini', amount: 25, status: 'overdue', date: '2024-12-15', plan: 'Basic mensile' }
    ],
    shifts: [
      { id: 's1', userId: 'u2', userName: 'Giulia Rossi', date: '2025-01-15', start: '08:00', end: '14:00', role: 'Reception' },
      { id: 's2', userId: 'u3', userName: 'Luca Verdi', date: '2025-01-15', start: '17:00', end: '21:00', role: 'Trainer Sala' },
      { id: 's3', userId: 'u2', userName: 'Giulia Rossi', date: '2025-01-16', start: '14:00', end: '20:00', role: 'Reception' }
    ],
    timesheets: [
      { id: 't1', userId: 'u2', userName: 'Giulia Rossi', date: '2025-01-14', hours: 6, note: 'Reception mattutina' },
      { id: 't2', userId: 'u3', userName: 'Luca Verdi', date: '2025-01-14', hours: 4, note: 'Corso CrossFit + Spinning' }
    ],
    notifications: [
      { id: 'n1', title: 'Nuovo iscritto', body: 'Paolo Ferri si è iscritto al piano Pro', type: 'success', read: false, date: '2025-01-15' },
      { id: 'n2', title: 'Fattura scaduta', body: 'Elena Marini ha una fattura scaduta da 30 giorni', type: 'warning', read: false, date: '2025-01-14' },
      { id: 'n3', title: 'Backup completato', body: 'Backup giornaliero eseguito con successo', type: 'info', read: true, date: '2025-01-14' }
    ]
  }
}

type Ctx = {
  data: Data
  demoMode: boolean
  toggleDemo: () => void
  resetAll: () => void
  addMember: (m: Omit<Member, 'id'>) => void
  updateMember: (id: string, m: Partial<Member>) => void
  deleteMember: (id: string) => void
  addUser: (u: Omit<User, 'id'>) => void
  updateUser: (id: string, u: Partial<User>) => void
  deleteUser: (id: string) => void
  addBooking: (b: Omit<Booking, 'id'>) => void
  updateBooking: (id: string, b: Partial<Booking>) => void
  deleteBooking: (id: string) => void
  addInvoice: (i: Omit<Invoice, 'id'>) => void
  updateInvoice: (id: string, i: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  addShift: (s: Omit<Shift, 'id'>) => void
  deleteShift: (id: string) => void
  addTimesheet: (t: Omit<Timesheet, 'id'>) => void
  deleteTimesheet: (id: string) => void
  addNotification: (n: Omit<Notification, 'id'>) => void
  markRead: (id: string) => void
  clearNotifications: () => void
  toast: (msg: string, type?: 'info' | 'success' | 'error') => void
  toasts: { id: string; msg: string; type: string }[]
}

const StoreCtx = createContext<Ctx | null>(null)

const uid = () => Math.random().toString(36).slice(2, 10)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>(EMPTY)
  const [demoMode, setDemoMode] = useState(false)
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: string }[]>([])

  const toast = useCallback((msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = uid()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  const toggleDemo = useCallback(() => {
    setDemoMode(d => {
      const next = !d
      setData(next ? demoData() : EMPTY)
      return next
    })
    toast('Modalità demo aggiornata', 'success')
  }, [toast])

  const resetAll = useCallback(() => {
    setData(EMPTY)
    setDemoMode(false)
    toast('Tutti i dati sono stati azzerati', 'success')
  }, [toast])

  const value: Ctx = {
    data, demoMode, toggleDemo, resetAll, toast, toasts,
    addMember: m => { setData(d => ({ ...d, members: [...d.members, { ...m, id: uid() }] })); toast('Cliente aggiunto', 'success') },
    updateMember: (id, m) => setData(d => ({ ...d, members: d.members.map(x => x.id === id ? { ...x, ...m } : x) })),
    deleteMember: id => { setData(d => ({ ...d, members: d.members.filter(x => x.id !== id) })); toast('Cliente eliminato', 'success') },
    addUser: u => { setData(d => ({ ...d, users: [...d.users, { ...u, id: uid() }] })); toast('Utente creato', 'success') },
    updateUser: (id, u) => setData(d => ({ ...d, users: d.users.map(x => x.id === id ? { ...x, ...u } : x) })),
    deleteUser: id => { setData(d => ({ ...d, users: d.users.filter(x => x.id !== id) })); toast('Utente rimosso', 'success') },
    addBooking: b => { setData(d => ({ ...d, bookings: [...d.bookings, { ...b, id: uid() }] })); toast('Prenotazione creata', 'success') },
    updateBooking: (id, b) => setData(d => ({ ...d, bookings: d.bookings.map(x => x.id === id ? { ...x, ...b } : x) })),
    deleteBooking: id => { setData(d => ({ ...d, bookings: d.bookings.filter(x => x.id !== id) })); toast('Prenotazione rimossa', 'success') },
    addInvoice: i => { setData(d => ({ ...d, invoices: [...d.invoices, { ...i, id: uid() }] })); toast('Fattura creata', 'success') },
    updateInvoice: (id, i) => setData(d => ({ ...d, invoices: d.invoices.map(x => x.id === id ? { ...x, ...i } : x) })),
    deleteInvoice: id => { setData(d => ({ ...d, invoices: d.invoices.filter(x => x.id !== id) })); toast('Fattura eliminata', 'success') },
    addShift: s => { setData(d => ({ ...d, shifts: [...d.shifts, { ...s, id: uid() }] })); toast('Turno aggiunto', 'success') },
    deleteShift: id => { setData(d => ({ ...d, shifts: d.shifts.filter(x => x.id !== id) })); toast('Turno rimosso', 'success') },
    addTimesheet: t => { setData(d => ({ ...d, timesheets: [...d.timesheets, { ...t, id: uid() }] })); toast('Ore registrate', 'success') },
    deleteTimesheet: id => { setData(d => ({ ...d, timesheets: d.timesheets.filter(x => x.id !== id) })); toast('Riga rimossa', 'success') },
    addNotification: n => setData(d => ({ ...d, notifications: [{ ...n, id: uid() }, ...d.notifications] })),
    markRead: id => setData(d => ({ ...d, notifications: d.notifications.map(x => x.id === id ? { ...x, read: true } : x) })),
    clearNotifications: () => { setData(d => ({ ...d, notifications: [] })); toast('Notifiche svuotate', 'success') }
  }

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore deve essere usato dentro StoreProvider')
  return ctx
}
