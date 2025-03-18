import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "../../../supabase/supabase";
import { toast } from "@/components/ui/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreateDefaultUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCreateDefaultUsers = async () => {
    try {
      setIsLoading(true);
      setResult(null);

      const users = [
        {
          email: "josebaez@albroksa.com",
          password: "Jbfjbf1982@#",
          fullName: "José Báez",
          role: "superadmin",
        },
        {
          email: "aheras@albroksa.com",
          password: "0904Aher%",
          fullName: "Alba Heras",
          role: "admin",
        },
        {
          email: "mchaves@albroksa.com",
          password: "0904Mcha%",
          fullName: "Marcos Chaves",
          role: "admin",
        },
      ];

      const results = [];

      // Crear cada usuario individualmente usando el Edge Function
      for (const user of users) {
        try {
          console.log(`Creando usuario: ${user.email} usando Edge Function`);

          // Verificar si el usuario ya existe
          const { data: existingUsers } = await supabase
            .from("users")
            .select("email")
            .eq("email", user.email);

          if (existingUsers && existingUsers.length > 0) {
            console.log(`Usuario ya existe: ${user.email}`);
            results.push({
              email: user.email,
              status: "skipped",
              message: "Usuario ya existe",
            });
            continue;
          }

          // Usar el Edge Function para crear el usuario
          const { data, error } = await supabase.functions.invoke(
            "create-user-admin",
            {
              body: {
                email: user.email,
                password: user.password,
                full_name: user.fullName,
                role: user.role,
              },
            },
          );

          console.log(`Respuesta del Edge Function para ${user.email}:`, data);

          if (error) {
            console.error(
              `Error al invocar Edge Function para ${user.email}:`,
              error,
            );
            results.push({
              email: user.email,
              status: "error",
              message: error.message || "Error al invocar Edge Function",
            });
            continue;
          }

          if (!data || !data.success) {
            console.error(
              `Error en respuesta del Edge Function para ${user.email}:`,
              data?.error || "Respuesta inválida",
            );
            results.push({
              email: user.email,
              status: "error",
              message: data?.error || "Error en la creación del usuario",
            });
            continue;
          }

          console.log(
            `Usuario creado correctamente: ${user.email} con ID: ${data.userId}`,
          );
          results.push({
            email: user.email,
            status: "success",
            message: "Usuario creado correctamente",
            userId: data.userId,
          });
        } catch (userError) {
          console.error(
            `Error inesperado al crear usuario ${user.email}:`,
            userError,
          );
          results.push({
            email: user.email,
            status: "error",
            message:
              userError instanceof Error
                ? userError.message
                : "Error inesperado",
          });
        }
      }

      setResult({ results });

      // Mostrar mensaje de resultado
      const successCount = results.filter((r) => r.status === "success").length;
      const skippedCount = results.filter((r) => r.status === "skipped").length;
      const errorCount = results.filter((r) => r.status === "error").length;

      if (successCount > 0) {
        toast({
          title: "Usuarios creados",
          description: `${successCount} usuarios creados correctamente. ${skippedCount} ya existían. ${errorCount} errores.`,
          variant: errorCount > 0 ? "destructive" : "default",
        });
      } else if (skippedCount > 0 && errorCount === 0) {
        toast({
          title: "Usuarios ya existentes",
          description: "Todos los usuarios ya estaban creados en el sistema.",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron crear los usuarios solicitados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al crear usuarios:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudieron crear los usuarios solicitados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crear Usuarios</CardTitle>
        <CardDescription>
          Crea los usuarios del sistema con roles asignados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Esta acción creará los siguientes usuarios con sus respectivas
          contraseñas:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>
            <strong>José Báez</strong> (josebaez@albroksa.com) - Rol:
            Superadministrador
          </li>
          <li>
            <strong>Alba Heras</strong> (aheras@albroksa.com) - Rol:
            Administrador
          </li>
          <li>
            <strong>Marcos Chaves</strong> (mchaves@albroksa.com) - Rol:
            Administrador
          </li>
        </ul>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="font-medium">Resultado:</h3>
            <pre className="text-xs mt-2 whitespace-pre-wrap overflow-auto max-h-40">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleCreateDefaultUsers}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando usuarios...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Crear Usuarios
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
