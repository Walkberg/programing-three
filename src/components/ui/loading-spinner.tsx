/**
 * Loading spinner component for app initialization (T079)
 */
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-border rounded-full"></div>
          <div
            className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"
            style={{
              animationDuration: "0.8s",
            }}
          ></div>
        </div>
        <p className="text-sm text-muted-foreground">Loading Scene Editor...</p>
      </div>
    </div>
  );
}
