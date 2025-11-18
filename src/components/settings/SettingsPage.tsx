import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountSettings from "./AccountSettings";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/supabase/auth";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabase";
import { PageHeader } from "@/components/ui/page-header";

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
    <div className="h-full bg-gray-50 dark:bg-[#1e2836]">
      <PageHeader
        icon={SettingsIcon}
        title="Configuración"
        description="Gestiona tu cuenta y preferencias"
        actions={
          (userRole === "superadmin" || userRole === "admin") && (
            <Button onClick={() => navigate("/settings/users")} className="bg-red-600 hover:bg-red-700">
              <Users className="mr-2 h-4 w-4" /> Gestionar Usuarios
            </Button>
          )
        }
      />

      <div className="p-8">
        <div className="bg-white dark:bg-[#1e2836] rounded-lg shadow-sm dark:border dark:border-gray-700 p-6">
          <AccountSettings />
        </div>
      </div>
    </div>
  );
}