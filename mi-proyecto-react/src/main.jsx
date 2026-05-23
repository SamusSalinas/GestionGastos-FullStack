import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 👈 IMPORTA ESTO
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* 👈 ENVOLVEMOS LA APP */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)