import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "../ui/use-toast";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Loader2,
  User,
  Calendar,
  Phone,
  Mail,
  Info,
  AlertCircle,
  Lock,
  Unlock,
  GitBranch,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  created_at: string;
  status: string;
  lead_details: {
    interest_level: number;
    score: number;
    investment_capacity: string;
    source_channel: string;
  }[];
};

type LeadsByStage = {
  [key: string]: Lead[];
};

export default function LeadPipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsByStage, setLeadsByStage] = useState<LeadsByStage>({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  const stages = [
    { id: "new_contact", name: "Nuevo Contacto", color: "#3b82f6" },
    { id: "first_contact", name: "Primer Contacto", color: "#8b5cf6" },
    { id: "info_sent", name: "Información Enviada", color: "#6366f1" },
    {
      id: "interview_scheduled",
      name: "Entrevista Programada",
      color: "#eab308",
    },
    {
      id: "interview_completed",
      name: "Entrevista Completada",
      color: "#f97316",
    },
    { id: "proposal_sent", name: "Propuesta Enviada", color: "#ec4899" },
    { id: "negotiation", name: "Negociación", color: "#ef4444" },
    { id: "contract_signed", name: "Contrato Firmado", color: "#22c55e" },
  ];

  useEffect(() => {
    async function checkUserRole() {
      try {
        const { data, error } = await supabase.rpc("get_current_user_role");

        if (error) {
          console.error("Error checking user role:", error);
          return;
        }

        setUserRole(data);
        setIsAuthorized(data === "superadmin" || data === "admin");
      } catch (error) {
        console.error("Error in checkUserRole:", error);
      }
    }

    checkUserRole();
    fetchLeads();
  }, []);

  useEffect(() => {
    if (leads.length > 0) {
      organizeLeadsByStage();
    }
  }, [leads]);

  // Make sure the droppable areas are ready before rendering
  const [isDroppableEnabled, setIsDroppableEnabled] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready for react-beautiful-dnd
    const timer = setTimeout(() => {
      setIsDroppableEnabled(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  async function fetchLeads() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("leads")
        .select(
          `
          *,
          lead_details(*),
          lead_status_history(status, created_at)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Process leads to get current status
      const processedLeads = data?.map((lead) => {
        // Get the most recent status from lead_status_history
        const statusHistory = lead.lead_status_history || [];
        const sortedHistory = [...statusHistory].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        const currentStatus =
          sortedHistory.length > 0 ? sortedHistory[0].status : "new_contact";

        return {
          ...lead,
          status: currentStatus,
        };
      });

      setLeads(processedLeads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los candidatos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function organizeLeadsByStage() {
    const organized: LeadsByStage = {};

    // Initialize all stages with empty arrays
    stages.forEach((stage) => {
      organized[stage.id] = [];
    });

    // Populate stages with leads
    leads.forEach((lead) => {
      const stageId = lead.status || "new_contact";
      if (organized[stageId]) {
        organized[stageId].push(lead);
      } else {
        // If stage doesn't exist, put in new_contact as fallback
        organized["new_contact"].push(lead);
      }
    });

    setLeadsByStage(organized);
  }

  async function handleDragEnd(result: any) {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Check if user is authorized to move leads
    if (!isAuthorized) {
      toast({
        title: "Permiso denegado",
        description: "No tienes permisos para mover leads en el pipeline",
        variant: "destructive",
      });
      return;
    }

    // Find the lead that was dragged
    const leadId = draggableId;
    const newStatus = destination.droppableId;

    try {
      // First update the UI immediately for better user experience
      // Find the lead to move
      const leadToMove = leads.find((lead) => lead.id === leadId);
      if (!leadToMove) return;

      // Create a copy of the current state
      const updatedLeadsByStage = { ...leadsByStage };

      // Remove from source
      updatedLeadsByStage[source.droppableId] = updatedLeadsByStage[
        source.droppableId
      ].filter((lead) => lead.id !== leadId);

      // Add to destination with updated status
      const updatedLead = { ...leadToMove, status: newStatus };
      updatedLeadsByStage[newStatus] = [
        ...updatedLeadsByStage[newStatus],
        updatedLead,
      ];

      // Update the state immediately
      setLeadsByStage(updatedLeadsByStage);

      // Also update the main leads array
      const updatedLeads = leads.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead,
      );
      setLeads(updatedLeads);

      // Get the current user ID
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      const userId = currentUser?.id;

      // Update the lead status in the database
      const { error } = await supabase.from("lead_status_history").insert({
        lead_id: leadId,
        status: newStatus,
        notes: `Lead movido a la etapa ${getStageNameById(newStatus)}`,
        created_by: userId,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `Lead movido a ${getStageNameById(newStatus)}`,
      });
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del lead",
        variant: "destructive",
      });
      // Refresh the data to ensure UI is in sync with database
      fetchLeads();
    }
  }

  function getStageNameById(stageId: string): string {
    const stage = stages.find((s) => s.id === stageId);
    return stage ? stage.name : stageId;
  }

  function getStageColorById(stageId: string): string {
    const stage = stages.find((s) => s.id === stageId);
    return stage ? stage.color : "#64748b";
  }

  function getInterestLevelColor(level: number): string {
    switch (level) {
      case 1:
        return "bg-red-100 text-red-800";
      case 2:
        return "bg-orange-100 text-orange-800";
      case 3:
        return "bg-yellow-100 text-yellow-800";
      case 4:
        return "bg-green-100 text-green-800";
      case 5:
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getSourceChannelLabel(source: string | undefined) {
    if (!source || source === "" || source === null) return "Desconocido";

    switch (source) {
      case "website":
        return "Sitio Web";
      case "referral":
        return "Referencia";
      case "social_media":
        return "Redes Sociales";
      case "event":
        return "Evento";
      case "advertisement":
        return "Publicidad";
      case "other":
        return "Otro";
      default:
        return source;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="ml-2 dark:text-white">Cargando pipeline...</span>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-[#1e2836]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1e2836] border-l-4 border-l-red-600 px-4 sm:px-8 py-6 flex items-start gap-3 sm:gap-4">
        <div className="bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 rounded-lg">
          <GitBranch className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Pipeline de Leads</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                {leads.length} leads en total
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowHelp(!showHelp)}
                      className="rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                    <p>Mostrar/ocultar ayuda</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="cursor-default rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                      {isAuthorized ? (
                        <Unlock className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-amber-600" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                    <p>
                      {isAuthorized
                        ? "Tienes permisos para mover leads"
                        : "Modo de solo lectura - No puedes mover leads"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      {showHelp && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-8 py-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300">
                Cómo usar el Pipeline
              </h3>
              <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>
                  • Cada columna representa una etapa en el proceso de ventas
                </li>
                <li>
                  • Haz clic en una tarjeta para ver los detalles completos del
                  lead
                </li>
                {isAuthorized ? (
                  <li>
                    • Arrastra y suelta las tarjetas para mover leads entre
                    etapas
                  </li>
                ) : (
                  <li>
                    • Solo los administradores pueden mover leads entre
                    etapas
                  </li>
                )}
                <li>
                  • Los colores de las etiquetas indican el nivel de interés del
                  lead
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {isDroppableEnabled ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto h-[calc(100vh-200px)] p-6">
            <div className="flex space-x-4" style={{ minWidth: "1400px" }}>
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex flex-col bg-gray-100 dark:bg-gray-800 rounded-xl"
                  style={{ width: "280px", minWidth: "280px" }}
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e2836] rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {stage.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                      >
                        {leadsByStage[stage.id]?.length || 0}
                      </Badge>
                    </div>
                  </div>

                  <Droppable droppableId={stage.id} key={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`p-3 flex-1 overflow-y-auto rounded-b-xl transition-colors ${
                          snapshot.isDraggingOver ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-800"
                        }`}
                        style={{ minHeight: "500px" }}
                      >
                        {leadsByStage[stage.id]?.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-24 text-center p-4 text-sm text-gray-400 dark:text-gray-500">
                            <p>No hay leads</p>
                          </div>
                        )}

                        {leadsByStage[stage.id] &&
                          leadsByStage[stage.id].map((lead, index) => (
                            <Draggable
                              key={lead.id}
                              draggableId={lead.id}
                              index={index}
                              isDragDisabled={!isAuthorized}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-3 ${isAuthorized ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"} hover:shadow-lg transition-all border-0 dark:bg-[#1e2836] dark:border-gray-700 ${snapshot.isDragging ? "shadow-2xl rotate-2" : "shadow-sm"}`}
                                  onClick={() => navigate(`/leads/${lead.id}`)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center flex-1">
                                        <Avatar className="h-8 w-8 mr-2">
                                          <AvatarImage
                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.full_name}`}
                                          />
                                          <AvatarFallback className="bg-red-100 text-red-600 dark:bg-red-900/30 text-xs">
                                            {lead.full_name.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                                          {lead.full_name}
                                        </h4>
                                      </div>
                                      {lead.lead_details?.[0]
                                        ?.interest_level && (
                                        <Badge
                                          className={`${getInterestLevelColor(
                                            lead.lead_details[0].interest_level,
                                          )} ml-2 text-xs rounded-full`}
                                        >
                                          {lead.lead_details[0].interest_level}
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
                                      <div className="flex items-center">
                                        <Mail className="h-3.5 w-3.5 mr-2 text-gray-400 dark:text-gray-500" />
                                        <span className="truncate">
                                          {lead.email}
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <Phone className="h-3.5 w-3.5 mr-2 text-gray-400 dark:text-gray-500" />
                                        <span>{lead.phone}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <User className="h-3.5 w-3.5 mr-2 text-gray-400 dark:text-gray-500" />
                                        <span>{lead.location}</span>
                                      </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {getSourceChannelLabel(
                                          lead.lead_details?.[0]
                                            ?.source_channel,
                                        )}
                                      </span>

                                      {lead.lead_details?.[0]?.score && (
                                        <div className="flex items-center">
                                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-2">
                                            {lead.lead_details[0].score}
                                          </span>
                                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                            <div
                                              className="h-1.5 rounded-full bg-red-600"
                                              style={{
                                                width: `${Math.min(
                                                  (lead.lead_details[0].score /
                                                    100) *
                                                    100,
                                                  100,
                                                )}%`,
                                              }}
                                            ></div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
      ) : (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <span className="ml-2 dark:text-white">Preparando pipeline...</span>
        </div>
      )}
    </div>
  );
}