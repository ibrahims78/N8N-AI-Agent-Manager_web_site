import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-destructive">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">حدث خطأ غير متوقع</h2>
          <p className="text-sm text-muted-foreground mb-1">Something went wrong</p>
          {this.state.error && (
            <pre className="text-xs text-destructive bg-destructive/5 rounded-lg p-3 max-w-lg overflow-auto mb-4 text-start">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors"
          >
            حاول مجدداً / Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
