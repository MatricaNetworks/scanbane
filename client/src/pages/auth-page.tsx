import { useState } from "react";
import { useLocation } from "wouter";
import { ShieldCheck } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

export default function AuthPage() {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      phoneNumber: "",
    },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    setIsLoggingIn(true);
    console.log("Login attempted with:", data);
    
    // Demo login (username: demo, password: demo123)
    setTimeout(() => {
      if (data.username === "demo" && data.password === "demo123") {
        navigate("/");
      } else {
        alert("Invalid credentials. Try using demo/demo123");
        setIsLoggingIn(false);
      }
    }, 1500);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    setIsRegistering(true);
    console.log("Registration attempted with:", data);
    
    // Simulate registration
    setTimeout(() => {
      alert("Registration functionality is under development. Please use the demo account: demo/demo123");
      setIsRegistering(false);
      setActiveTab("login");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 flex">
      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">ScamBane</h2>
            <p className="mt-2 text-sm text-gray-600">
              Advanced cybersecurity protection for all your devices
            </p>
          </div>

          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Account Login</CardTitle>
                  <CardDescription>
                    Login with your ScamBane account (demo/demo123)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="demo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="demo123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab("register")}
                  >
                    Don't have an account? Register
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Register for a new ScamBane account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (123) 456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isRegistering}
                      >
                        {isRegistering ? "Registering..." : "Register"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab("login")}
                  >
                    Already have an account? Login
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="hidden lg:flex flex-1 bg-primary text-white p-12 flex-col justify-center">
        <div className="max-w-xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">
            Proactive Cybersecurity for Everyone
          </h1>
          <p className="text-lg mb-8 opacity-90">
            ScamBane offers real-time protection against phishing, malware, and other cyber threats. 
            Protect all your devices with our comprehensive security solution.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-semibold">URL Protection</h3>
              <p className="opacity-80">Intercepts and analyzes suspicious links before you click them.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-semibold">File Scanning</h3>
              <p className="opacity-80">Detect malware in files before they harm your device.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-semibold">Image Analysis</h3>
              <p className="opacity-80">Find hidden malicious code using steganography detection.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-semibold">Cross Platform</h3>
              <p className="opacity-80">Works on Android, iOS, Windows, and macOS.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}