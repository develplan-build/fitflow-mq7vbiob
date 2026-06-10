const { Resend } = require('resend')

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Resend non configurato: aggiungi RESEND_API_KEY')
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.EMAIL_FROM || 'no-reply@fitflow.app'
  return await resend.emails.send({ from, to, subject, html })
}

module.exports = { sendEmail }
