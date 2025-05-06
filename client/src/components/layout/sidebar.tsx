import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import {
  Home,
  Link as LinkIcon,
  File,
  Image as ImageIcon,
  History,
  User,
  Bell,
  Settings,
  LogOut,
  ShieldCheck
} from "lucide-react";

export function Sidebar() {
  // Mock user data for demo purposes
  const user = {
    id: 1,
    username: "demo",
    subscriptionTier: "free",
    scansUsed: 1
  };
  const [location] = useLocation();
  const isMobile = useMobile();
  
  if (isMobile) {
    return null;
  }

  const isActiveRoute = (path: string) => {
    return location === path;
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "URL Scan", path: "/url-scan", icon: <LinkIcon className="h-5 w-5" /> },
    { name: "File Scan", path: "/file-scan", icon: <File className="h-5 w-5" /> },
    { name: "Image Scan", path: "/image-scan", icon: <ImageIcon className="h-5 w-5" /> },
    { name: "Scan History", path: "/history", icon: <History className="h-5 w-5" /> }
  ];

  const settingsLinks = [
    { name: "My Account", path: "/account", icon: <User className="h-5 w-5" /> },
    { name: "Notifications", path: "/notifications", icon: <Bell className="h-5 w-5" /> },
    { name: "Settings", path: "/settings", icon: <Settings className="h-5 w-5" /> }
  ];

  return (
    <div className="flex flex-col w-64 bg-[#111827] text-white">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
        <Link href="/dashboard">
          <a className="flex items-center">
            <ShieldCheck className="h-6 w-6 text-blue-500 mr-2" />
            <span className="text-xl font-semibold">ScamBane</span>
          </a>
        </Link>
        <span className="ml-1 text-xs bg-primary px-2 py-0.5 rounded-full">Beta</span>
      </div>
      
      <div className="flex flex-col flex-grow overflow-y-auto scrollbar-thin">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path}>
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActiveRoute(link.path)
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-700"
              )}>
                {link.icon}
                <span className="ml-3">{link.name}</span>
              </a>
            </Link>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-700">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Settings
            </h3>
            
            {settingsLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a className={cn(
                  "flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-md",
                  isActiveRoute(link.path)
                    ? "bg-primary text-white"
                    : "text-gray-300 hover:bg-gray-700"
                )}>
                  {link.icon}
                  <span className="ml-3">{link.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </nav>
      </div>
      
      <div className="flex items-center justify-between p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <User className="h-6 w-6 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-white">{user?.username || 'Guest'}</p>
            <p className="text-xs text-gray-400">
              {user?.subscriptionTier === 'free' ? 'Free Trial' : user?.subscriptionTier?.charAt(0).toUpperCase() + user?.subscriptionTier?.slice(1) || ''}
            </p>
          </div>
        </div>
        <Link href="/auth">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-700"
          >
            <LogOut className="h-5 w-5 text-gray-400" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
