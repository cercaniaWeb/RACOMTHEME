import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import notificationService from './services/notificationService'

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Initialize notification service
      await notificationService.initialize();
      
      // Register service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      console.log('Service Worker registered with scope:', registration.scope);
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
