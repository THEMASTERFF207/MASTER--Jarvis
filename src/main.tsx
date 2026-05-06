import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite WebSocket errors and unhandled rejections that clutter the preview
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (
      event.reason.message?.includes('WebSocket') || 
      event.reason.message?.includes('vite') ||
      event.reason.stack?.includes('vite')
    )) {
      event.preventDefault();
      console.warn('Benign system error suppressed:', event.reason.message || event.reason);
    }
  });

  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && (args[0].includes('[vite]') || args[0].includes('WebSocket'))) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
