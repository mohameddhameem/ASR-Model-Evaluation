export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center gap-4">
      <div className="text-6xl font-bold text-muted-foreground/20">404</div>
      <h2 className="text-xl font-semibold text-foreground">Page Not Found</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        The page you are looking for does not exist or has been moved.
      </p>
    </div>
  );
}
