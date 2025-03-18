import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
  full_name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  role: z.string().min(1, { message: "Debes seleccionar un rol" }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddUserDirectFormProps {
  onSuccess: () => void;
}

export default function AddUserDirectForm({
  onSuccess,
}: AddUserDirectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      role: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      console.log("Creating user using edge function:", values.email);

      console.log("Attempting to create user with:", {
        email: values.email,
        password: "[REDACTED]",
        full_name: values.full_name,
        role: values.role,
      });

      // Use the edge function to create the user with admin privileges
      const { data, error } = await supabase.functions.invoke(
        "create-user-admin",
        {
          body: {
            email: values.email,
            password: values.password,
            full_name: values.full_name,
            role: values.role,
          },
        },
      );

      console.log("Edge function response:", { data, error });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Error al crear el usuario");
      }

      if (!data || !data.success) {
        throw new Error(
          data?.error || "No se pudo crear el usuario en el sistema",
        );
      }

      console.log("User created successfully:", data);

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente",
      });

      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo crear el usuario",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="usuario@ejemplo.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input placeholder="Contraseña" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="superadmin">Superadministrador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear Usuario"
          )}
        </Button>
      </form>
    </Form>
  );
}
