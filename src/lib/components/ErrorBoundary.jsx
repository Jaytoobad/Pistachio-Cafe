import React from 'react';
import { useNavigate } from 'react-router-dom';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Always log the real error to the console for debugging.
    // Customers never see this text — only the friendly message below.
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback
        error={this.state.error}
        onRetry={() => this.setState({ hasError: false, error: null, errorInfo: null })}
      />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onRetry }) {
  const navigate = useNavigate();

  // The real error text is logged to the console by componentDidCatch.
  // Only surface a friendly message to customers; in dev we also log it
  // once here so it's visible next to the UI.
  if (import.meta.env.DEV && error) {
    console.warn('ErrorBoundary UI — error.message:', error.message);
  }

  return (
    <div className="sf-error" role="alert">
      <h3>Something went wrong</h3>
      <p>We encountered an unexpected error. Please try again.</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button
          className="sf-btn sf-btn-primary"
          onClick={onRetry}
        >
          Try again
        </button>
        <button
          className="sf-btn sf-btn-outline"
          onClick={() => navigate('/')}
        >
          Go to home
        </button>
      </div>
    </div>
  );
}

export default ErrorBoundary;