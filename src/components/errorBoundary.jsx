// ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div id="error-boundary">
          <div id="error-content">
            <h2 id="error-title">
              Oops! Something went wrong
            </h2>
            <p id="error-message">
              Please try refreshing the page
            </p>
            <button
              onClick={() => window.location.reload()}
              id="error-refresh-button"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;