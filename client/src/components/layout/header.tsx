import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { 
  Menu, 
  Bell, 
  User,
  Home,
  Link as LinkIcon,
  File,
  Image as ImageIcon,
  History,
  Settings,
  ShieldCheck,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  // Mock user data for demo purposes
  const user = {
    id: 1,
    username: "demo",
    subscriptionTier: "free",
    scansUsed: 1
  };
  const isMobile = useMobile();
  const [location] = useLocation();

  const isActiveRoute = (path: string) => {
    return location === path;
  };

  const navLinks = [
    { name: "Dashboard", path: "/", icon: <Home className="h-5 w-5" /> },
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
    <header className="bg-white shadow">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        {isMobile ? (
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6 text-gray-500" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#111827] text-white p-0 w-64">
                <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
                  <ShieldCheck className="h-6 w-6 text-blue-500 mr-2" />
                  <span className="text-xl font-semibold">ScamBane</span>
                  <span className="ml-1 text-xs bg-primary px-2 py-0.5 rounded-full">Beta</span>
                </div>
                
                <div className="py-4 px-2">
                  <nav className="space-y-1">
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
                    
                    <div className="pt-4 mt-4 border-t border-gray-700">
                      <Link href="/auth">
                        <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700">
                          <LogOut className="h-5 w-5" />
                          <span className="ml-3">Logout</span>
                        </a>
                      </Link>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/">
              <a className="ml-2 text-lg font-semibold text-gray-800">ScamBane</a>
            </Link>
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </Button>
          
          {isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.username || 'Guest'}</span>
                    <span className="text-xs text-gray-500">
                      {user?.subscriptionTier === 'free' ? 'Free Trial' : user?.subscriptionTier?.charAt(0).toUpperCase() + user?.subscriptionTier?.slice(1) || ''}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <a className="flex cursor-pointer items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Account</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <a className="flex cursor-pointer items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/auth">
                    <a className="flex cursor-pointer items-center text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
