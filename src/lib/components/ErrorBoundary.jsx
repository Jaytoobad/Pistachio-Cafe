import React from 'react';

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
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="sf-error" role="alert">
          <h3>Something went wrong</h3>
          <p>We encountered an unexpected error. Please try again.</p>
          {this.state.error && (
            <p style={{ fontSize: '0.85rem', marginTop: 8, color: 'var(--color-muted)' }}>
              {String(this.state.error.message || this.state.error).slice(0, 200)}
            </p>
          )}
          <button
            className="sf-btn sf-btn-primary"
            style={{ marginTop: 12 }}
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
