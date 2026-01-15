
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  /**
   * The children components that might throw errors.
   */
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * A standard React Error Boundary component to catch rendering errors in children.
 */
export class ErrorBoundary extends Component<Props, State> {
  // Explicitly initializing state as a class property.
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  // componentDidCatch implementation to log runtime errors from child components.
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render(): ReactNode {
    // Accessing 'this.state' which is correctly inherited from the Component base class.
    const { hasError, error } = this.state;
    // Fix: Accessing 'props' from 'this' which is standard for React class components.
    // Using an explicit type assertion to satisfy the TypeScript compiler if inheritance is obscured.
    const { children } = (this as Component<Props, State>).props;

    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 p-6 text-center animate-fadeIn">
          <div className="bg-white p-6 rounded-full shadow-xl mb-6">
            <AlertTriangle size={64} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">Ui da! Có lỗi xảy ra.</h1>
          <p className="text-gray-600 mb-8 text-lg">Thầy Rùa bị vấp ngã rồi. Bé hãy giúp thầy đứng dậy nhé!</p>
          
          <div className="bg-white p-4 rounded-xl shadow-inner border border-red-100 text-left text-xs text-gray-400 font-mono mb-8 max-w-sm w-full overflow-auto max-h-32">
            {error?.toString() || "Unknown Error"}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-red-200 hover:scale-105 transition-all active:scale-95"
          >
            <RefreshCcw size={24} /> Thử lại ngay
          </button>
        </div>
      );
    }

    return children;
  }
}
