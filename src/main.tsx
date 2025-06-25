// Import polyfills first
import './polyfills';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { validateConfig } from './config/environment'

// Validate configuration silently
if (!validateConfig()) {
  console.error('❌ Invalid configuration - check your .env file');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
