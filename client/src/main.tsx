*(già corretto, ma lo ripropongo per completezza)*
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './store'

// Import globale dei CSS
import './app.css'          // layout
import './App.css'          // variabili e reset
import './components.css'   // componenti UI

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