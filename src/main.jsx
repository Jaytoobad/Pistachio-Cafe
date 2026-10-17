import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/index.css'
import ErrorBoundary from './lib/components/ErrorBoundary'
import DemoBadge from './lib/components/DemoBadge'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <DemoBadge />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
