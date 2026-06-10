```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './store'

// Import di tutti i fogli di stile globali
import './app.css'          // layout generale (grid, sidebar, header, ecc.)
import './App.css'          // variabili CSS, reset, tipografia globale
import './components.css'  // componenti UI riutilizzabili (modal, toast, badge, bottoni)

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```