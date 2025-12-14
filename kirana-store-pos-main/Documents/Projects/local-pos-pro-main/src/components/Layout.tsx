import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Search, Bell, User, LogOut, LogIn, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogout } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const logout = useLogout();
  const navigate=useNavigate();
 
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-6">
            <SidebarTrigger />
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products, customers..."
                  className="pl-9"
                />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
                </Button>
                <Button variant="ghost" size="icon" className="relative" onClick={()=>navigate("/login")}>
                  <Home className="h-5 w-5">
                      
                  </Home>
                </Button>
                <Button variant="ghost" size="icon" className="relative" onClick={() => logout.mutate()}>
                  <LogOut className="h-5 w-5"/>
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 bg-secondary/30 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
