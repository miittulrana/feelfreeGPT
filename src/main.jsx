import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from './components/errorBoundary';
import App from './App';
import './index.css';

// Performance monitoring
const reportWebVitals = (metric) => {
  // You can send metrics to your analytics service here
  console.log(metric);
};

// Error logging
const logError = (error, errorInfo) => {
  console.error('Application error:', error);
  console.error('Error info:', errorInfo);
  // You can send error reports to your error tracking service here
};

// Custom error boundary wrapper with error logging
const AppErrorBoundary = () => (
  <ErrorBoundary onError={logError}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ErrorBoundary>
);

// Mount application
const mountApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  root.render(<AppErrorBoundary />);

  // Report initial load performance
  reportWebVitals({
    type: 'TTFB',
    value: performance.now(),
  });
};

// Handle mounting errors
try {
  mountApp();
} catch (error) {
  console.error('Failed to mount application:', error);
  // You could render a fallback UI here
  document.getElementById('root').innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      color: #CCCCCC;
      background-color: #1C1C1C;
      padding: 20px;
      text-align: center;
    ">
      <h1 style="color: #FFAE84; margin-bottom: 16px;">Unable to Load Application</h1>
      <p>Please refresh the page or try again later.</p>
    </div>
  `;
}

// Optional: Remove loader if it exists
const loader = document.getElementById('loader');
if (loader) {
  loader.remove();
}