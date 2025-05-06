import { Loader2, AlertCircle } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function ProtectedRoute({
  path,
  component: Component,
  requireAdmin = false,
}: {
  path: string;
  component: () => React.JSX.Element;
  requireAdmin?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check for admin access if required
  if (requireAdmin && user.role !== 'admin') {
    // Show toast only when directly accessing the page
    if (location === path) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this area.",
        variant: "destructive"
      });
    }
    
    return (
      <Route path={path}>
        <Redirect to="/dashboard" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
