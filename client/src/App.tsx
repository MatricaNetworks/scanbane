import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import UrlScanPage from "@/pages/url-scan-page";
import FileScanPage from "@/pages/file-scan-page";
import ImageScanPage from "@/pages/image-scan-page";
import HistoryPage from "@/pages/history-page";
import DownloadPage from "@/pages/download-page";
import LandingPage from "@/pages/landing-page";
import AdminDashboard from "@/pages/admin-dashboard";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "./lib/theme-provider";
import { Toaster } from "@/components/ui/toaster";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <ProtectedRoute path="/dashboard" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/url-scan" component={UrlScanPage} />
      <ProtectedRoute path="/file-scan" component={FileScanPage} />
      <ProtectedRoute path="/image-scan" component={ImageScanPage} />
      <ProtectedRoute path="/history" component={HistoryPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <Route path="/download" component={DownloadPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Router />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
