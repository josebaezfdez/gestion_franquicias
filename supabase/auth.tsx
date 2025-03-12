import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;

      // Verificar si el usuario se creó correctamente
      if (data.user) {
        console.log("Usuario creado exitosamente:", data.user.id);

        // Asegurarse de que el usuario también se crea en la tabla public.users
        const { error: userError } = await supabase.from("users").upsert({
          id: data.user.id,
          full_name: fullName,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: "user",
        });

        if (userError) {
          console.error("Error al crear el perfil de usuario:", userError);
          throw userError;
        }
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Respuesta de autenticación:", { data, error });

      if (error) throw error;

      // Verificar si el usuario existe en la tabla public.users
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (userError || !userData) {
          console.log(
            "Usuario no encontrado en la tabla public.users, creándolo ahora",
          );

          // Si no existe, crearlo
          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            full_name:
              data.user.user_metadata?.full_name || email.split("@")[0],
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            role: "user",
          });

          if (insertError) {
            console.error("Error al crear el perfil de usuario:", insertError);
          }
        }
      }
    } catch (error) {
      console.error("Error en signIn:", error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
