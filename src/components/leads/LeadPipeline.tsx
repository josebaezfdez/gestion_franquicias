import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  created_at: string;
  lead_details: {
    interest_level: number;
    source_channel: string;
    score: number;
  };
  status: string;
};

type PipelineStage = {
  id: string;
  name: string;
  color: string;
  leads: Lead[];
};

export default function LeadPipeline() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState<PipelineStage[]>([
    { id: "new_contact", name: "Nuevo Contacto", color: "bg-blue-100", leads: [] },
    { id: "first_contact", name: "Primer Contacto", color: "bg-purple-100", leads: [] },
    { id: "info_sent", name: "Información Enviada", color: "bg-indigo-100", leads: [] },
    { id: "interview_scheduled", name: "Entrevista Programada", color: "bg-yellow-100", leads: [] },
    { id: "interview_completed", name: "Entrevista Completada", color: "bg-orange-100", leads: [] },
    { id: "proposal_sent", name: "Propuesta Enviada", color: "bg-pink-100", leads: [] },
    { id: "negotiation", name: "Negociación", color: "bg-red-100", leads: [] },
    { id: "contract_signed", name: "Contrato Firmado", color: "bg-green-100", leads: [] },
    { id: "rejected", name: "Rechazado", color: "bg-gray-100", leads: [] },
  ]);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          lead_details(*),
          lead_status_history(status, created_at)
        `);

      if (error) throw error;

      // Process the data to get the latest status for each lead
      const processedLeads = data.map((lead) => {
        // Sort status history by created_at in descending order
        const sortedStatusHistory = lead.lead_status_history.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        return {
          ...lead,
          status: sortedStatusHistory[0]?.status || "new_contact",
        };
      });

      // Group leads by status
      const updatedStages = [...stages];
      updatedStages.forEach((stage) => {
        stage.leads = processedLeads.filter((lead) => lead.status === stage.id);
      });

      setStages(updatedStages);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDragStart(e: React.DragEvent, leadId: string, currentStage: string) {
    e.dataTransfer.setData("leadId", leadId);
    e.dataTransfer.setData("currentStage", currentStage);
  }

  async function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function handleDrop(e: React.DragEvent, newStage: string) {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    const currentStage = e.dataTransfer.getData("currentStage");

    if (currentStage === newStage) return;

    try {
      // Add new status to lead_status_history
      const { error } = await supabase.from("lead_status_history").insert({
        lead_id: leadId,
        status: newStage,
        notes: `Moved from ${currentStage} to ${newStage}`,
      });

      if (error) throw error;

      // Update the UI
      const updatedStages = [...stages];
      const leadToMove = updatedStages
        .find((stage) => stage.id === currentStage)?
        .leads.find((lead) => lead.id === leadId);

      if (leadToMove) {
        // Remove from current stage
        updatedStages.forEach((stage) => {
          if (stage.id === currentStage) {
            stage.leads = stage.leads.filter((lead) => lead.id !== leadId);
          }
        });

        // Add to new stage
        updatedStages.forEach((stage) => {
          if (stage.id === newStage) {
            stage.leads.push({ ...leadToMove, status: newStage });
          }
        });

        setStages(updatedStages);
      }
    } catch (error) {
      console.error("Error updating lead status:", error);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  }

  if (loading) {
    return <div className="container mx-auto p-6 text-center">Cargando pipeline...</div>;
  }

  return (
    <div className="container mx-auto p-4 h-full" style={{ maxWidth: "1200px" }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Pipeline de Leads</h2>
        <Button onClick={() => navigate("/leads/new")}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Lead
        </Button>
      </div>

      <div className="flex overflow-x-auto pb-4 space-x-4 h-[calc(100vh-180px)]">
        {stages.map((stage) => (
          <div 
            key={stage.id}
            className="flex-shrink-0 w-[calc(100%/9-16px)] min-w-[250px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <Card className={`${stage.color} border-t-4 h-full`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                  <Badge variant="outline">{stage.leads.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 h-[calc(100vh-280px)] overflow-y-auto">
                {stage.leads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No hay leads en esta etapa
                  </div>
                ) : (
                  stage.leads.map((lead) => (
                    <Card 
                      key={lead.id}
                      className="bg-white cursor-pointer hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e as any, lead.id, stage.id)}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium truncate">{lead.full_name}</h3>
                          <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2 truncate">
                          {lead.email}
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {lead.lead_details?.source_channel || "Desconocido"}
                          </Badge>
                          <Badge className={`text-xs ${getScoreColor(lead.lead_details?.score || 0)}`}>
                            {lead.lead_details?.score || 0}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
