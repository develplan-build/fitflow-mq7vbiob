const twilio = require('twilio')

async function sendSms(to, body) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    throw new Error('Twilio non configurato')
  }
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  return await client.messages.create({ from: process.env.TWILIO_PHONE_NUMBER, to, body })
}

module.exports = { sendSms }
