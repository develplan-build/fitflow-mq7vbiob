const express = require('express')
const cors = require('cors')
const { supabase } = require('./supabase')
const { sendEmail } = require('./email')
const { sendSms } = require('./sms')
const { registerStripeRoutes } = require('./stripe')

const app = express()
app.use(cors())

// Stripe routes (webhook DEVE essere registrato prima di express.json globale)
registerStripeRoutes(app, express)

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    services: {
      supabase: !!process.env.SUPABASE_URL,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      resend: !!process.env.RESEND_API_KEY,
      twilio: !!process.env.TWILIO_ACCOUNT_SID
    }
  })
})

// Helper per query Supabase con fallback vuoto
async function fetchTable(table) {
  if (!supabase) return []
  const { data, error } = await supabase.from(table).select('*').limit(500)
  if (error) { console.error(error); return [] }
  return data || []
}

// Entità reali — partono vuote se Supabase non configurato
app.get('/api/members', async (req, res) => res.json(await fetchTable('members')))
app.get('/api/bookings', async (req, res) => res.json(await fetchTable('bookings')))
app.get('/api/invoices', async (req, res) => res.json(await fetchTable('invoices')))
app.get('/api/shifts', async (req, res) => res.json(await fetchTable('shifts')))
app.get('/api/timesheets', async (req, res) => res.json(await fetchTable('timesheets')))
app.get('/api/notifications', async (req, res) => res.json(await fetchTable('notifications')))
app.get('/api/users', async (req, res) => res.json(await fetchTable('users')))

// Endpoint Email
app.post('/api/email/send', async (req, res) => {
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Resend non configurato: aggiungi RESEND_API_KEY' })
  try {
    const { to, subject, html } = req.body
    const result = await sendEmail(to, subject, html)
    res.json({ ok: true, result })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Endpoint SMS
app.post('/api/sms/send', async (req, res) => {
  if (!process.env.TWILIO_ACCOUNT_SID) return res.status(503).json({ error: 'Twilio non configurato' })
  try {
    const { to, body } = req.body
    const result = await sendSms(to, body)
    res.json({ ok: true, sid: result.sid })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// DEMO endpoints — dati di esempio per modalità demo locale
app.get('/api/demo/members', (req, res) => {
  res.json([
    { id: 1, name: 'Marco Rossi', email: 'marco@example.com', plan: 'Pro', status: 'active', joined: '2024-01-15' },
    { id: 2, name: 'Laura Bianchi', email: 'laura@example.com', plan: 'Basic', status: 'active', joined: '2024-02-08' },
    { id: 3, name: 'Giulia Verdi', email: 'giulia@example.com', plan: 'Pro', status: 'paused', joined: '2024-03-22' },
    { id: 4, name: 'Andrea Neri', email: 'andrea@example.com', plan: 'Basic', status: 'active', joined: '2024-04-10' }
  ])
})

app.listen(4000, '0.0.0.0', () => console.log('Server FitFlow su porta 4000'))
