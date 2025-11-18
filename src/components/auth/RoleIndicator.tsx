import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoleIndicatorProps {
  showLabel?: boolean;
  className?: string;
}

export default function RoleIndicator({
  showLabel = true,
  className = "",
}: RoleIndicatorProps) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkUserRole() {
      if (!user?.id) {
        if (isMounted) {
          setLoading(false);
          setUserRole(null);
        }
        return;
      }

      try {
        const { data, error } = await supabase.rpc("get_current_user_role");

        if (error) {
          console.error("Error checking user role:", error);
          if (isMounted) {
            setUserRole(null);
          }
        } else {
          if (isMounted) {
            setUserRole(data);
          }
        }
      } catch (error) {
        console.error("Error in checkUserRole:", error);
        if (isMounted) {
          setUserRole(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkUserRole();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  if (loading || !userRole) {
    return null;
  }

  function getRoleBadgeVariant(role: string) {
    switch (role) {
      case "superadmin":
        return "destructive";
      case "admin":
        return "default";
      case "user":
        return "secondary";
      default:
        return "outline";
    }
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case "superadmin":
        return "Superadministrador";
      case "admin":
        return "Administrador";
      case "user":
        return "Usuario";
      default:
        return role;
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Badge
              variant={getRoleBadgeVariant(userRole)}
              className={className}
            >
              {showLabel
                ? getRoleLabel(userRole)
                : userRole.charAt(0).toUpperCase()}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tu rol: {getRoleLabel(userRole)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}