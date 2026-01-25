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
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 bg-white rounded shadow-md max-w-md">
             <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
             <p className="text-gray-600 mb-4">We couldn't load this part of the application.</p>
             <button 
                onClick={() => window.location.href = '/dashboard/student'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
             >
                Return to Dashboard
             </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;