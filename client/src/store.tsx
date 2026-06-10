import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

// --- Tipi ---
export interface Member {
  id: string
  name: string
  email: string
  phone?: string
  plan: string
  status: 'active' | 'paused' | 'cancelled'
  joinedAt: string
}

export interface Booking {
  id: string
  memberId: string
  memberName: string
  className: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

export interface Shift {
  id: string
  staffName: string
  date: string
  start: string
  end: string
  role: string
}

export interface Timesheet {
  id: string
  staffName: string
  date: string
  hours: number
  notes?: string
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
  message: string
  date: string
  read: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff' | 'member'
}

// --- Stato ---
interface State {
  members: Member[]
  bookings: Booking[]
  shifts: Shift[]
  timesheets: Timesheet[]
  invoices: Invoice[]
  notifications: AppNotification[]
  users: User[]
}

interface StoreCtx extends State {
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>
  setTimesheets: React.Dispatch<React.SetStateAction<Timesheet[]>>
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  resetAll: () => void
}

// --- Dati iniziali (demo) ---
const seed: State = {
  members: [
    { id: 'm1', name: 'Marco Rossi', email: 'marco@example.com', phone: '3331234567', plan: 'Pro', status: 'active', joinedAt: '2024-01-15' },
    { id: 'm2', name: 'Giulia Bianchi', email: 'giulia@example.com', phone: '3339876543', plan: 'Base', status: 'active', joinedAt: '2024-03-20' },
    { id: 'm3', name: 'Luca Verdi', email: 'luca@example.com', phone: '3335551122', plan: 'Pro Annuale', status: 'paused', joinedAt: '2023-11-10' },
  ],
  bookings: [
    { id: 'b1', memberId: 'm1', memberName: 'Marco Rossi', className: 'Yoga', date: '2025-01-20', time: '10:00', status: 'confirmed' },
    { id: 'b2', memberId: 'm2', memberName: 'Giulia Bianchi', className: 'Pilates', date: '2025-01-20', time: '18:00', status: 'pending' },
  ],
  shifts: [
    { id: 's1', staffName: 'Anna Trainer', date: '2025-01-20', start: '09:00', end: '13:00', role: 'Istruttore' },
  ],
  timesheets: [
    { id: 't1', staffName: 'Anna Trainer', date: '2025-01-19', hours: 6, notes: 'Lezioni mattutine' },
  ],
  invoices: [
    { id: 'i1', memberName: 'Marco Rossi', plan: 'Pro', amount: 39, date: '2025-01-01', status: 'paid' },
    { id: 'i2', memberName: 'Giulia Bianchi', plan: 'Base', amount: 25, date: '2025-01-01', status: 'pending' },
  ],
  notifications: [
    { id: 'n1', type: 'info', title: 'Benvenuto', message: 'FitFlow è pronto all\'uso', date: '2025-01-20', read: false },
  ],
  users: [
    { id: 'u1', name: 'Admin Demo', email: 'admin@fitflow.it', role: 'admin' },
  ],
}

// --- Persistenza ---
const STORAGE_KEY = 'fitflow-store-v1'

function loadState(): State {
  if (typeof window === 'undefined') return seed
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed
    const parsed = JSON.parse(raw)
    return { ...seed, ...parsed }
  } catch {
    return seed
  }
}

function saveState(s: State) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* quota o privacy mode: ignora */
  }
}

// --- Context ---
const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(() => loadState(), [])

  const [members, setMembers] = useState<Member[]>(initial.members)
  const [bookings, setBookings] = useState<Booking[]>(initial.bookings)
  const [shifts, setShifts] = useState<Shift[]>(initial.shifts)
  const [timesheets, setTimesheets] = useState<Timesheet[]>(initial.timesheets)
  const [invoices, setInvoices] = useState<Invoice[]>(initial.invoices)
  const [notifications, setNotifications] = useState<AppNotification[]>(initial.notifications)
  const [users, setUsers] = useState<User[]>(initial.users)

  // Salva su localStorage a ogni cambio
  useEffect(() => {
    saveState({ members, bookings, shifts, timesheets, invoices, notifications, users })
  }, [members, bookings, shifts, timesheets, invoices, notifications, users])

  const resetAll = () => {
    setMembers(seed.members)
    setBookings(seed.bookings)
    setShifts(seed.shifts)
    setTimesheets(seed.timesheets)
    setInvoices(seed.invoices)
    setNotifications(seed.notifications)
    setUsers(seed.users)
  }

  const value = useMemo<StoreCtx>(
    () => ({
      members, bookings, shifts, timesheets, invoices, notifications, users,
      setMembers, setBookings, setShifts, setTimesheets, setInvoices, setNotifications, setUsers,
      resetAll,
    }),
    [members, bookings, shifts, timesheets, invoices, notifications, users]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore deve essere usato dentro <StoreProvider>')
  return ctx
}