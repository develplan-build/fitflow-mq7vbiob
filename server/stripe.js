const Stripe = require('stripe')

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
}

function registerStripeRoutes(app, express) {
  app.post('/api/checkout', express.json(), async (req, res) => {
    const stripe = getStripe()
    if (!stripe) return res.status(503).json({ error: 'Stripe non configurato: aggiungi STRIPE_SECRET_KEY' })
    try {
      const { priceId, plan } = req.body || {}
      const price = priceId || (plan === 'pro' ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_BASIC)
      if (!price) return res.status(400).json({ error: 'priceId mancante' })
      const origin = req.headers.origin || 'http://localhost:3000'
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price, quantity: 1 }],
        success_url: `${origin}/app?checkout=success`,
        cancel_url: `${origin}/?checkout=cancel`
      })
      res.json({ url: session.url, id: session.id })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const stripe = getStripe()
    if (!stripe) return res.status(503).json({ error: 'Stripe non configurato' })
    const sig = req.headers['stripe-signature']
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (!secret) return res.status(503).json({ error: 'STRIPE_WEBHOOK_SECRET mancante' })
    let event
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, secret)
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Checkout completato:', event.data.object.id)
        break
      case 'customer.subscription.deleted':
        console.log('Subscription cancellata:', event.data.object.id)
        break
      default:
        console.log('Evento non gestito:', event.type)
    }
    res.json({ received: true })
  })
}

module.exports = { registerStripeRoutes, getStripe }
