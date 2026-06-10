import React, {
  createContext, useContext, useEffect,
  useMemo, useState, useCallback,
} from 'react'

// ============================================================
// TIPI — allineati a ciò che usano le pagine
// ============================================================
export interface Member {
  id: string
  name: string
  email: string
  phone: string
  plan: 'Basic' | 'Pro' | string
  status: 'active' | 'suspended' | 'expired'
  joined: string
}

export interface Booking {
  id: string
  memberId: string
  memberName: string
  activity: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

export interface Shift {
  id: string
  userId: string
  userName: string
  date: string
  start: string
  end: string
  role: string
}

export interface Timesheet {
  id: string
  userId: string
  userName: string
  date: string
  hours: number
  note: string
}

export interface Invoice {
  id: string
  memberName: string
  plan: string
  amount: number
  date: string
  status: 'paid' | 'pending' | 'overdue'
}

export interface AppNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  body: string
  date: string
  read: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff' | 'trainer'
  active: boolean
}

export interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

// ============================================================
// STATO AGGREGATO (oggetto "data" usato dalle pagine)
// ============================================================
interface DataState {
  members: Member[]
  bookings: Booking[]
  shifts: Shift[]
  timesheets: Timesheet[]
  invoices: Invoice[]
  notifications: AppNotification[]
  users: User[]
}

// ============================================================
// CONTEXT
// ============================================================
interface StoreCtx {
  data: DataState
  demoMode: boolean
  setDemoMode: (v: boolean) => void
  toasts: Toast[]

  // Members
  addMember: (m: Omit<Member, 'id'>) => void
  updateMember: (id: string, patch: Partial<Member>) => void
  deleteMember: (id: string) => void

  // Bookings
  addBooking: (b: Omit<Booking, 'id'>) => void
  updateBooking: (id: string, patch: Partial<Booking>) => void
  deleteBooking: (id: string) => void

  // Shifts
  addShift: (s: Omit<Shift, 'id'>) => void
  deleteShift: (id: string) => void

  // Timesheets
  addTimesheet: (t: Omit<Timesheet, 'id'>) => void
  deleteTimesheet: (id: string) => void

  // Invoices
  addInvoice: (i: Omit<Invoice, 'id'>) => void
  updateInvoice: (id: string, patch: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void

  // Users
  addUser: (u: Omit<User, 'id'>) => void
  updateUser: (id: string, patch: Partial<User>) => void
  deleteUser: (id: string) => void

  // Notifications
  addNotification: (n: Omit<AppNotification, 'id'>) => void
  markRead: (id: string) => void
  clearNotifications: () => void

  // Toast
  toast: (message: string, type?: Toast['type']) => void
  dismissToast: (id: string) => void

  resetAll: () => void
}

// ============================================================
// SEED — dati demo iniziali
// ============================================================
const SEED: DataState = {
  members: [
    { id: 'm1', name: 'Marco Rossi', email: 'marco@example.com', phone: '3331234567', plan: 'Pro', status: 'active', joined: '2024-01-15' },
    { id: 'm2', name: 'Giulia Bianchi', email: 'giulia@example.com', phone: '3339876543', plan: 'Basic', status: 'active', joined: '2024-03-20' },
    { id: 'm3', name: 'Luca Verdi', email: 'luca@example.com', phone: '3335551122', plan: 'Pro', status: 'suspended', joined: '2023-11-10' },
  ],
  bookings: [
    { id: 'b1', memberId: 'm1', memberName: 'Marco Rossi', activity: 'Spinning', date: '2025-01-20', time: '10:00', status: 'confirmed' },
    { id: 'b2', memberId: 'm2', memberName: 'Giulia Bianchi', activity: 'Yoga', date: '2025-01-20', time: '18:00', status: 'pending' },
  ],
  shifts: [
    { id: 's1', userId: 'u1', userName: 'Admin Demo', date: '2025-01-20', start: '09:00', end: '13:00', role: 'Reception' },
  ],
  timesheets: [
    { id: 't1', userId: 'u1', userName: 'Admin Demo', date: '2025-01-19', hours: 6, note: 'Lezioni mattutine' },
  ],
  invoices: [
    { id: 'i1', memberName: 'Marco Rossi', plan: 'Pro', amount: 39, date: '2025-01-01', status: 'paid' },
    { id: 'i2', memberName: 'Giulia Bianchi', plan: 'Basic', amount: 25, date: '2025-01-01', status: 'pending' },
  ],
  notifications: [
    { id: 'n1', type: 'info', title: 'Benvenuto in FitFlow', body: "Il tuo gestionale è pronto all'uso", date: '2025-01-20', read: false },
  ],
  users: [
    { id: 'u1', name: 'Admin Demo', email: 'admin@fitflow.it', role: 'admin', active: true },
  ],
}

// ============================================================
// PERSISTENZA
// ============================================================
const KEY = 'fitflow-v2'

function load(): DataState {
  if (typeof window === 'undefined') return SEED
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return SEED
    const p = JSON.parse(raw)
    // merge con seed per garantire tutte le chiavi
    return {
      members: p.members ?? SEED.members,
      bookings: p.bookings ?? SEED.bookings,
      shifts: p.shifts ?? SEED.shifts,
      timesheets: p.timesheets ?? SEED.timesheets,
      invoices: p.invoices ?? SEED.invoices,
      notifications: p.notifications ?? SEED.notifications,
      users: p.users ?? SEED.users,
    }
  } catch { return SEED }
}

function save(d: DataState) {
  try { localStorage.setItem(KEY, JSON.stringify(d)) } catch { /* ignore */ }
}

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

// ============================================================
// PROVIDER
// ============================================================
const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(() => load(), [])

  const [members, setMembers] = useState<Member[]>(initial.members)
  const [bookings, setBookings] = useState<Booking[]>(initial.bookings)
  const [shifts, setShifts] = useState<Shift[]>(initial.shifts)
  const [timesheets, setTimesheets] = useState<Timesheet[]>(initial.timesheets)
  const [invoices, setInvoices] = useState<Invoice[]>(initial.invoices)
  const [notifications, setNotifications] = useState<AppNotification[]>(initial.notifications)
  const [users, setUsers] = useState<User[]>(initial.users)
  const [demoMode, setDemoMode] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Salva su localStorage
  useEffect(() => {
    save({ members, bookings, shifts, timesheets, invoices, notifications, users })
  }, [members, bookings, shifts, timesheets, invoices, notifications, users])

  // Toast auto-dismiss dopo 4s
  useEffect(() => {
    if (!toasts.length) return
    const t = setTimeout(() => setToasts(p => p.slice(1)), 4000)
    return () => clearTimeout(t)
  }, [toasts])

  // --- Members ---
  const addMember = useCallback((m: Omit<Member, 'id'>) =>
    setMembers(p => [{ ...m, id: uid() }, ...p]), [])
  const updateMember = useCallback((id: string, patch: Partial<Member>) =>
    setMembers(p => p.map(x => x.id === id ? { ...x, ...patch } : x)), [])
  const deleteMember = useCallback((id: string) =>
    setMembers(p => p.filter(x => x.id !== id)), [])

  // --- Bookings ---
  const addBooking = useCallback((b: Omit<Booking, 'id'>) =>
    setBookings(p => [{ ...b, id: uid() }, ...p]), [])
  const updateBooking = useCallback((id: string, patch: Partial<Booking>) =>
    setBookings(p => p.map(x => x.id === id ? { ...x, ...patch } : x)), [])
  const deleteBooking = useCallback((id: string) =>
    setBookings(p => p.filter(x => x.id !== id)), [])

  // --- Shifts ---
  const addShift = useCallback((s: Omit<Shift, 'id'>) =>
    setShifts(p => [{ ...s, id: uid() }, ...p]), [])
  const deleteShift = useCallback((id: string) =>
    setShifts(p => p.filter(x => x.id !== id)), [])

  // --- Timesheets ---
  const addTimesheet = useCallback((t: Omit<Timesheet, 'id'>) =>
    setTimesheets(p => [{ ...t, id: uid() }, ...p]), [])
  const deleteTimesheet = useCallback((id: string) =>
    setTimesheets(p => p.filter(x => x.id !== id)), [])

  // --- Invoices ---
  const addInvoice = useCallback((i: Omit<Invoice, 'id'>) =>
    setInvoices(p => [{ ...i, id: uid() }, ...p]), [])
  const updateInvoice = useCallback((id: string, patch: Partial<Invoice>) =>
    setInvoices(p => p.map(x => x.id === id ? { ...x, ...patch } : x)), [])
  const deleteInvoice = useCallback((id: string) =>
    setInvoices(p => p.filter(x => x.id !== id)), [])

  // --- Users ---
  const addUser = useCallback((u: Omit<User, 'id'>) =>
    setUsers(p => [{ ...u, id: uid() }, ...p]), [])
  const updateUser = useCallback((id: string, patch: Partial<User>) =>
    setUsers(p => p.map(x => x.id === id ? { ...x, ...patch } : x)), [])
  const deleteUser = useCallback((id: string) =>
    setUsers(p => p.filter(x => x.id !== id)), [])

  // --- Notifications ---
  const addNotification = useCallback((n: Omit<AppNotification, 'id'>) =>
    setNotifications(p => [{ ...n, id: uid() }, ...p]), [])
  const markRead = useCallback((id: string) =>
    setNotifications(p => p.map(x => x.id === id ? { ...x, read: true } : x)), [])
  const clearNotifications = useCallback(() => setNotifications([]), [])

  // --- Toast ---
  const toast = useCallback((message: string, type: Toast['type'] = 'info') =>
    setToasts(p => [...p, { id: uid(), message, type }]), [])
  const dismissToast = useCallback((id: string) =>
    setToasts(p => p.filter(x => x.id !== id)), [])

  // --- Reset ---
  const resetAll = useCallback(() => {
    setMembers(SEED.members)
    setBookings(SEED.bookings)
    setShifts(SEED.shifts)
    setTimesheets(SEED.timesheets)
    setInvoices(SEED.invoices)
    setNotifications(SEED.notifications)
    setUsers(SEED.users)
  }, [])

  // Oggetto data compatto
  const data = useMemo<DataState>(() => ({
    members, bookings, shifts, timesheets, invoices, notifications, users,
  }), [members, bookings, shifts, timesheets, invoices, notifications, users])

  const value = useMemo<StoreCtx>(() => ({
    data, demoMode, setDemoMode, toasts,
    addMember, updateMember, deleteMember,
    addBooking, updateBooking, deleteBooking,
    addShift, deleteShift,
    addTimesheet, deleteTimesheet,
    addInvoice, updateInvoice, deleteInvoice,
    addUser, updateUser, deleteUser,
    addNotification, markRead, clearNotifications,
    toast, dismissToast,
    resetAll,
  }), [data, demoMode, toasts])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>')
  return ctx
}