const express = require('express')
const cors = require('cors')
require('dotenv').config()

const email = require('./email')
const sms = require('./sms')
const stripe = require('./stripe')

const app = express()

// --- Middleware ---
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map(s => s.trim())

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
        return cb(null, true)
      }
      return cb(new Error('CORS: origin non consentito'))
    },
    credentials: true,
  })
)

// Stripe webhook richiede raw body: registrato PRIMA del json parser
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripe.webhook)

app.use(express.json({ limit: '1mb' }))

// --- Health ---
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'fitflow-api', ts: Date.now() })
})

// --- Helpers di validazione ---
function requireFields(body, fields) {
  const missing = fields.filter(f => !body || body[f] == null || body[f] === '')
  return missing.length ? `Campi mancanti: ${missing.join(', ')}` : null
}

function isEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

// --- Email ---
app.post('/api/email/send', async (req, res, next) => {
  try {
    const err = requireFields(req.body, ['to', 'subject', 'html'])
    if (err) return res.status(400).json({ error: err })
    if (!isEmail(req.body.to)) return res.status(400).json({ error: 'Email destinatario non valida' })

    const result = await email.send(req.body)
    res.json({ ok: true, result })
  } catch (e) {
    next(e)
  }
})

// --- SMS ---
app.post('/api/sms/send', async (req, res, next) => {
  try {
    const err = requireFields(req.body, ['to', 'body'])
    if (err) return res.status(400).json({ error: err })

    const result = await sms.send(req.body)
    res.json({ ok: true, result })
  } catch (e) {
    next(e)
  }
})

// --- Stripe checkout ---
app.post('/api/checkout', async (req, res, next) => {
  try {
    const err = requireFields(req.body, ['priceId'])
    if (err) return res.status(400).json({ error: err })

    const session = await stripe.createCheckout(req.body)
    res.json({ url: session.url, id: session.id })
  } catch (e) {
    next(e)
  }
})

// --- Reports PDF (stub: in attesa di implementazione completa) ---
app.post('/api/reports/pdf', async (req, res) => {
  // TODO: integrare libreria PDF (pdfkit / puppeteer) lato server
  res.status(501).json({
    error: 'Generazione PDF non ancora implementata sul server',
    hint: 'Usare la generazione PDF lato client o implementare con pdfkit',
  })
})

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato', path: req.path })
})

// --- Error handler globale ---
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err)
  const status = err.status || 500
  res.status(status).json({
    error: err.message || 'Errore interno del server',
  })
})

// --- Avvio ---
const PORT = parseInt(process.env.PORT || '3001', 10)
app.listen(PORT, () => {
  console.log(`✅ FitFlow API in ascolto su porta ${PORT}`)
})