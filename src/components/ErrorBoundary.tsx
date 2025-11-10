import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and display React component errors (T078)
 * Provides graceful error handling with recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <div className="max-w-2xl w-full space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-destructive">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                An error occurred in the application. You can try reloading the
                page or resetting the editor state.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                <h2 className="font-semibold text-sm">Error Details:</h2>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto text-destructive">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Component Stack
                    </summary>
                    <pre className="mt-2 bg-muted p-3 rounded overflow-x-auto text-muted-foreground">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReload} variant="default">
                Reload Page
              </Button>
              <Button onClick={this.handleReset} variant="outline">
                Try Again
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              If this problem persists, please check the browser console for
              more details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
