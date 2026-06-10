import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config'
import { signInWithGoogle, isSupabaseConfigured } from '../lib/supabase'

export default function Landing() {
  const nav = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [contactSent, setContactSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function checkout(plan: 'basic' | 'pro') {
    setToast('Avvio checkout...')
    try {
      const r = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })
      const data = await r.json()
      if (data.url) { window.location.href = data.url; return }
      setToast(data.error || 'Stripe non configurato — apri l\'app demo per provare FitFlow')
      setTimeout(() => setToast(null), 3500)
    } catch (e: any) {
      setToast('Errore di rete: ' + e.message)
      setTimeout(() => setToast(null), 3500)
    }
  }

  async function handleGoogle() {
    if (!isSupabaseConfigured) {
      setToast('Login Google non configurato — aggiungi VITE_SUPABASE_URL/ANON_KEY. Per ora apri la demo.')
      setTimeout(() => setToast(null), 3500)
      return
    }
    await signInWithGoogle()
  }

  function submitContact(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setContactSent(true)
    setForm({ name: '', email: '', message: '' })
    setTimeout(() => setContactSent(false), 4000)
  }

  return (
    <div className="landing">
      <nav className="nav">
        <div className="brand">
          <div className="logo">⚡</div>
          FitFlow
        </div>
        <div className="links">
          <button onClick={() => scrollTo('features')}>Funzionalità</button>
          <button onClick={() => scrollTo('risultati')}>Risultati</button>
          <button onClick={() => scrollTo('prezzi')}>Prezzi</button>
          <button onClick={() => scrollTo('contatti')}>Contatti</button>
          <button onClick={handleGoogle}>Accedi</button>
        </div>
        <button className="cta" onClick={() => nav('/app')}>Apri app →</button>
      </nav>

      <section className="hero">
        <div className="badge">● Nuova versione 2.0 disponibile</div>
        <h1>Il gestionale che fa <span className="grad">crescere</span> la tua palestra</h1>
        <p>FitFlow digitalizza iscritti, abbonamenti, prenotazioni e pagamenti. Riduci il lavoro amministrativo del 60% e dedica più tempo ai tuoi clienti.</p>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => nav('/app')}>Apri la dashboard →</button>
          <button className="btn btn-ghost" onClick={() => scrollTo('features')}>Scopri le funzionalità</button>
          <button className="btn-google" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Accedi con Google
          </button>
        </div>
      </section>

      <section id="features" className="section">
        <h2>Tutto ciò che serve a una palestra moderna</h2>
        <p className="sub">Una piattaforma integrata per gestire ogni aspetto del tuo centro fitness.</p>
        <div className="features-grid">
          {[
            { i: '👥', t: 'Gestione iscritti', d: 'CRM completo con profili, abbonamenti e storico presenze.' },
            { i: '📅', t: 'Prenotazioni online', d: 'I clienti prenotano corsi e sale in autonomia, 24/7.' },
            { i: '💳', t: 'Pagamenti ricorrenti', d: 'Stripe integrato per addebiti automatici e ricevute fiscali.' },
            { i: '📊', t: 'Analytics avanzate', d: 'Dashboard in tempo reale su iscritti, ricavi e occupazione.' },
            { i: '🔔', t: 'Notifiche automatiche', d: 'Email e SMS via Resend e Twilio per promemoria e scadenze.' },
            { i: '⏱️', t: 'Turni e timesheet', d: 'Pianifica i turni dello staff e traccia le ore lavorate.' }
          ].map((f, k) => (
            <div className="feature-card" key={k}>
              <div className="icon">{f.i}</div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="risultati" className="section">
        <h2>Risultati misurabili</h2>
        <p className="sub">I numeri delle palestre che usano FitFlow ogni giorno.</p>
        <div className="results-grid">
          <div className="result-card"><div className="num">+38%</div><div className="lbl">Rinnovi abbonamento</div></div>
          <div className="result-card"><div className="num">-60%</div><div className="lbl">Tempo amministrativo</div></div>
          <div className="result-card"><div className="num">+25%</div><div className="lbl">Tasso occupazione corsi</div></div>
          <div className="result-card"><div className="num">99.9%</div><div className="lbl">Uptime garantito</div></div>
        </div>
      </section>

      <section id="prezzi" className="section">
        <h2>Piani semplici e trasparenti</h2>
        <p className="sub">Scegli il piano adatto alla tua palestra. Senza costi nascosti.</p>
        <div className="pricing-grid">
          <div className="price-card">
            <h3>Basic</h3>
            <div className="price">25€<small>/mese</small></div>
            <p style={{color:'var(--muted)',fontSize:14}}>Per palestre singole fino a 200 iscritti.</p>
            <ul>
              <li>Fino a 200 iscritti</li>
              <li>Prenotazioni corsi illimitate</li>
              <li>Fatturazione automatica</li>
              <li>Email transazionali</li>
              <li>Supporto email</li>
            </ul>
            <button className="btn btn-ghost" onClick={() => checkout('basic')}>Inizia ora</button>
          </div>
          <div className="price-card featured">
            <h3>Pro</h3>
            <div className="price">39€<small>/mese</small></div>
            <p style={{color:'var(--muted)',fontSize:14}}>Per centri multi-sala con staff.</p>
            <ul>
              <li>Iscritti illimitati</li>
              <li>SMS automatici Twilio</li>
              <li>Turni e timesheet staff</li>
              <li>Report PDF avanzati</li>
              <li>Multi-sede e analytics</li>
              <li>Supporto prioritario 24/7</li>
            </ul>
            <button className="btn btn-primary" onClick={() => checkout('pro')}>Inizia ora</button>
          </div>
        </div>
      </section>

      <section id="contatti" className="section">
        <h2>Parla con il nostro team</h2>
        <p className="sub">Rispondiamo entro 24 ore. Demo gratuita disponibile.</p>
        <div className="contact-grid">
          <div className="contact-info">
            <h3>Contatti diretti</h3>
            <p>✉ supporto@fitflow.app</p>
            <p>📞 +39 02 1234 5678</p>
            <p>📍 Via del Fitness 12, Milano</p>
            <p style={{marginTop:20, color:'var(--muted)', fontSize:13}}>Orari: Lun-Ven 9:00 - 18:00</p>
            <button className="btn-sm primary" style={{marginTop:18}} onClick={() => nav('/app')}>Prova la demo →</button>
          </div>
          <form className="contact-form" onSubmit={submitContact}>
            <input placeholder="Il tuo nome" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input type="email" placeholder="Email aziendale" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            <textarea placeholder="Come possiamo aiutarti?" value={form.message} onChange={e => setForm({...form, message: e.target.value})} required />
            <button type="submit" className="btn btn-primary" style={{width:'100%'}}>{contactSent ? '✓ Messaggio inviato!' : 'Invia messaggio'}</button>
          </form>
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} FitFlow — Il gestionale per palestre e centri fitness
      </footer>

      {toast && (
        <div className="toast-wrap">
          <div className="toast info">{toast}</div>
        </div>
      )}
    </div>
  )
}
