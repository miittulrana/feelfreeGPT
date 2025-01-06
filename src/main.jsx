import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Clear any existing auth state on app load
localStorage.clear();
sessionStorage.clear();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);