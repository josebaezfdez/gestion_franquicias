import { useState } from "react";
import { useAuth } from "@/supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate("/leads/dashboard");
    } catch (error: any) {
      console.error("Error de inicio de sesión:", error);
      setError(error.message || "Correo electrónico o contraseña inválidos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-2xl border-0">
          <CardHeader className="space-y-4 pb-6 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-2">
              <img 
                src="https://albroksa.com/wp-content/uploads/2025/01/LOGO-SIN-DGS-1.png" 
                alt="Albroksa Logo" 
                className="h-16"
              />
            </div>
            
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Proyectos</h1>
              <p className="text-sm text-gray-500 mt-2">
                Ingresa tus credenciales para acceder
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="josebaez@albroksa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-blue-50 border-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-blue-50 border-blue-200"
                />
              </div>

              <div className="text-right">
                <Link to="#" className="text-sm text-red-600 hover:text-red-700 font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg" 
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 border-t pt-6 bg-gray-50 rounded-b-lg">
            <div className="text-xs text-center text-gray-500 w-full">
              <p>Aplicación privada</p>
              <p>Contacta con el administrador para obtener acceso</p>
            </div>
          </CardFooter>
        </Card>

        <div className="text-center text-xs text-gray-400 mt-6">
          <p>Albroknet 3.0 v1.0</p>
          <p>&copy; 2025 Albroksa</p>
        </div>
      </div>
    </div>
  );
}