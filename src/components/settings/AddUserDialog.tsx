import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserDialog({
  isOpen,
  onClose,
  onSuccess,
}: AddUserDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-user-direct",
        {
          body: {
            email,
            password,
            full_name: fullName,
            role,
          },
        }
      );

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });

      setEmail("");
      setPassword("");
      setFullName("");
      setRole("user");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] dark:bg-[#1e2836] dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Añadir Nuevo Usuario</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Crea un nuevo usuario para el sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="dark:text-gray-300">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="dark:text-gray-300">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="dark:text-gray-300">Nombre Completo</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="dark:text-gray-300">Rol</Label>
            <Select value={role} onValueChange={(value: "user" | "admin") => setRole(value)}>
              <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-[#1e2836] dark:border-gray-700">
                <SelectItem value="user" className="dark:text-gray-300">Usuario</SelectItem>
                <SelectItem value="admin" className="dark:text-gray-300">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose} className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}