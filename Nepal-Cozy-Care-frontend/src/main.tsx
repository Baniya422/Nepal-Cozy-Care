import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { FeatureFlagsProvider } from './context/FeatureFlagsContext.tsx'
import { BrandingProvider } from './context/BrandingContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <FeatureFlagsProvider>
        <BrandingProvider>
          <App />
        </BrandingProvider>
      </FeatureFlagsProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
