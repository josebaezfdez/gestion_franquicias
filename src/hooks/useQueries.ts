import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";

// Query Keys
export const QUERY_KEYS = {
  leads: ["leads"],
  lead: (id: string) => ["lead", id],
  leadDetails: (id: string) => ["leadDetails", id],
  tasks: ["tasks"],
  communications: (leadId: string) => ["communications", leadId],
  franchises: ["franchises"],
  franchise: (id: string) => ["franchise", id],
  users: ["users"],
  userRole: ["userRole"],
} as const;

// User Role Hook
export function useUserRole() {
  return useQuery({
    queryKey: QUERY_KEYS.userRole,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_current_user_role");
      if (error) throw error;
      return data as string | null;
    },
  });
}

// Leads Hooks
export function useLeads() {
  return useQuery({
    queryKey: QUERY_KEYS.leads,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          lead_details (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.lead(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          lead_details (*),
          communications (*),
          tasks (*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (leadData: any) => {
      const { data, error } = await supabase
        .from("leads")
        .insert([leadData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads });
      toast({
        title: "Lead creado",
        description: "El lead ha sido creado exitosamente",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Error al crear el lead";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: result, error } = await supabase
        .from("leads")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lead(variables.id) });
      toast({
        title: "Lead actualizado",
        description: "El lead ha sido actualizado exitosamente",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar el lead";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads });
      toast({
        title: "Lead eliminado",
        description: "El lead ha sido eliminado exitosamente",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar el lead";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

// Franchises Hooks
export function useFranchises() {
  return useQuery({
    queryKey: QUERY_KEYS.franchises,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("franchises")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useFranchise(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.franchise(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("franchises")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// Tasks Hooks
export function useTasks() {
  return useQuery({
    queryKey: QUERY_KEYS.tasks,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          leads (
            full_name,
            email
          )
        `)
        .eq("assigned_to", user.id)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}
