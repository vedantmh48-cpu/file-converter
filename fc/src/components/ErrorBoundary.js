import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md text-center">
          <AlertTriangle className="w-10 h-10 mx-auto text-amber-500" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">Something went wrong</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">The app hit an unexpected error. Reload to continue.</p>
          <button className="btn-primary mt-6 gap-2" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4" /> Reload app
          </button>
        </div>
      </main>
    );
  }
}
