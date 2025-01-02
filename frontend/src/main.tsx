import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Disable error overlay
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (e) => {
    e.preventDefault();
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    e.preventDefault();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
