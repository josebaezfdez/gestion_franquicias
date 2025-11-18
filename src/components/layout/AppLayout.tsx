import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  LogOut,
  LayoutDashboard,
  ListTodo,
  Users,
  Building,
  Search,
  Bell,
  Moon,
  Sun,
  GitBranch,
  Menu,
  X,
} from "lucide-react";
import RoleIndicator from "../auth/RoleIndicator";
import { useTheme } from "@/lib/theme-provider";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;

    const fetchUserRole = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) {
          if (isMounted) {
            setUserRole('user');
          }
          return;
        }
        if (isMounted && data) {
          setUserRole(data.role);
        }
      } catch (error) {
        if (isMounted) {
          setUserRole('user');
        }
      }
    };

    fetchUserRole();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    return <>{children}</>;
  }

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1e2836] flex">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside className={`bg-white dark:bg-[#1e2836] border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between fixed inset-y-0 left-0 z-30 w-64 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Logo */}
          <div className="flex items-center justify-center p-4 mb-6">
            <img 
              src="https://albroksa.com/wp-content/uploads/2025/01/LOGO-SIN-DGS-1.png" 
              alt="Albroksa Logo" 
              className="h-10"
            />
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link
              to="/leads/dashboard"
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive("/leads/dashboard")
                  ? "bg-red-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="ml-4">Dashboard</span>
            </Link>

            <Link
              to="/leads/list"
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive("/leads/list") && !isActive("/leads/tasks") && !isActive("/leads/pipeline")
                  ? "bg-red-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Building className="w-5 h-5" />
              <span className="ml-4">Leads</span>
            </Link>

            <Link
              to="/leads/pipeline"
              className={`hidden xl:flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive("/leads/pipeline")
                  ? "bg-red-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <GitBranch className="w-5 h-5" />
              <span className="ml-4">Pipeline</span>
            </Link>

            <Link
              to="/leads/tasks"
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive("/leads/tasks")
                  ? "bg-red-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ListTodo className="w-5 h-5" />
              <span className="ml-4">Mis Tareas</span>
            </Link>

            {(userRole === "superadmin" || userRole === "admin") && (
              <Link
                to="/settings/users"
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive("/settings/users")
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users className="w-5 h-5" />
                <span className="ml-4">Usuarios</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="font-medium">Gestión de Franquiciados v.1</p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="bg-white dark:bg-[#1e2836] border-b border-gray-200 dark:border-gray-700 px-4 sm:px-8 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="pl-10 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 dark:bg-[#1e2836] dark:border-gray-700">
                  <DropdownMenuLabel className="dark:text-white">Notificaciones</DropdownMenuLabel>
                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                  <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No hay notificaciones nuevas
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 sm:gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback className="bg-red-100 text-red-600">
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <RoleIndicator />
                      </div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 dark:bg-[#1e2836] dark:border-gray-700">
                  <DropdownMenuLabel className="dark:text-white">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="dark:bg-gray-700" />
                  <DropdownMenuItem onClick={() => navigate("/settings/account")} className="dark:text-gray-300 dark:hover:bg-gray-700">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="dark:text-gray-300 dark:hover:bg-gray-700">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}