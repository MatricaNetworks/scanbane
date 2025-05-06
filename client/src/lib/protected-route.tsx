import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

// Simplified ProtectedRoute that doesn't rely on AuthContext
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // For demo purposes, assume user is always authenticated for now
  // In a production environment, this would check authentication status
  const isAuthenticated = true; // Hard-coded for demo
  
  if (!isAuthenticated) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
