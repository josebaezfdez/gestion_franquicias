import { ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings,
  User,
  LogOut,
  Menu,
  X,
  BarChart2,
  Users,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar toggle */}
        <div className="fixed top-20 left-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-full"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold">CRM Franquicias de Seguros</h1>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              <Link
                to="/leads/dashboard"
                className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                onClick={() => setSidebarOpen(false)}
              >
                <Users className="h-5 w-5 mr-2" />
                Leads
              </Link>
              <Link
                to="/leads/tasks"
                className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                onClick={() => setSidebarOpen(false)}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Tareas
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="h-5 w-5 mr-2" />
                Configuración
              </Link>
            </nav>

            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                      alt={user.email || ""}
                    />
                    <AvatarFallback>
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {user.email}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div
          className={`flex-1 transition-all duration-200 ${sidebarOpen ? "ml-64" : "ml-0"}`}
        >
          <main
            className="min-h-screen pt-4 mx-auto"
            style={{ maxWidth: "1200px" }}
          >
            {children}
          </main>
        </div>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
