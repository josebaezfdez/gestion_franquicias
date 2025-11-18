import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AccountSettings from "./AccountSettings";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { useAuth } from "@/supabase/auth";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabase";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function getUserRole() {
      if (!user) return;

      try {
        const { data, error } = await supabase.rpc("get_current_user_role");

        if (error) {
          console.error("Error fetching user role:", error);
        } else {
          setUserRole(data || null);
        }
      } catch (error) {
        console.error("Error in getUserRole:", error);
      }
    }

    getUserRole();
  }, [user]);

  return (
    <div className="h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona tu cuenta y preferencias
            </p>
          </div>
          {(userRole === "superadmin" || userRole === "admin") && (
            <Button onClick={() => navigate("/settings/users")}>
              <Users className="mr-2 h-4 w-4" /> Gestionar Usuarios
            </Button>
          )}
        </div>
      </div>

      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm">
          <AccountSettings />
        </div>
      </div>
    </div>
  );
}