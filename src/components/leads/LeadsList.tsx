import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MassEmailDialog from "../email/MassEmailDialog";

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
  lead_status_history: {
    status: string;
  }[];
};

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMassEmailDialog, setShowMassEmailDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUserRole() {
      try {
        const { data, error } = await supabase.rpc("get_current_user_role");

        if (error) {
          console.error("Error checking user role:", error);
          return;
        }

        setUserRole(data);
      } catch (error) {
        console.error("Error in checkUserRole:", error);
      }
    }

    checkUserRole();
  }, []);

  useEffect(() => {
    fetchLeads();
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

      // Process the data to get the latest status for each lead
      const processedLeads = data.map((lead) => {
        // Sort status history by created_at in descending order
        const sortedStatusHistory = lead.lead_status_history.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        return {
          ...lead,
          lead_status_history: sortedStatusHistory,
        };
      });

      setLeads(processedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLeads = leads.filter(
    (lead) =>
      lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function getStatusColor(status: string) {
    switch (status) {
      case "new_contact":
        return "bg-blue-100 text-blue-800";
      case "first_contact":
        return "bg-purple-100 text-purple-800";
      case "info_sent":
        return "bg-indigo-100 text-indigo-800";
      case "interview_scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "interview_completed":
        return "bg-orange-100 text-orange-800";
      case "proposal_sent":
        return "bg-pink-100 text-pink-800";
      case "negotiation":
        return "bg-red-100 text-red-800";
      case "contract_signed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "new_contact":
        return "Nuevo Contacto";
      case "first_contact":
        return "Primer Contacto";
      case "info_sent":
        return "Información Enviada";
      case "interview_scheduled":
        return "Entrevista Programada";
      case "interview_completed":
        return "Entrevista Completada";
      case "proposal_sent":
        return "Propuesta Enviada";
      case "negotiation":
        return "Negociación";
      case "contract_signed":
        return "Contrato Firmado";
      case "rejected":
        return "Rechazado";
      default:
        return status;
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

  return (
    <div className="container mx-auto p-6" style={{ maxWidth: "1200px" }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Candidatos</h2>
        {(userRole === "superadmin" || userRole === "admin") && (
          <Button onClick={() => navigate("/leads/new")}>
            <Plus className="mr-2 h-4 w-4" /> Añadir Nuevo Candidato
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar candidatos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filtrar
        </Button>
        {(userRole === "superadmin" || userRole === "admin") && (
          <Button onClick={() => setShowMassEmailDialog(true)}>
            <Send className="mr-2 h-4 w-4" /> Email Masivo
          </Button>
        )}
      </div>

      {showMassEmailDialog && (
        <MassEmailDialog
          isOpen={showMassEmailDialog}
          onClose={() => setShowMassEmailDialog(false)}
        />
      )}

      {loading ? (
        <div className="text-center py-10">Cargando candidatos...</div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron candidatos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <Card
              key={lead.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/leads/${lead.id}`)}
            >
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg truncate">
                      {lead.full_name}
                    </h3>
                    <Badge
                      className={getStatusColor(
                        lead.lead_status_history[0]?.status || "new_contact",
                      )}
                    >
                      {getStatusLabel(
                        lead.lead_status_history[0]?.status || "new_contact",
                      )}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{lead.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Añadido el {formatDate(lead.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-500">Fuente:</span>
                    <Badge variant="outline" className="ml-2">
                      {getSourceChannelLabel(
                        Array.isArray(lead.lead_details) &&
                          lead.lead_details.length > 0
                          ? lead.lead_details[0].source_channel
                          : lead.lead_details?.source_channel || "unknown",
                      )}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Puntuación:</span>
                    <Badge
                      className={`ml-2 ${getScoreColor(
                        Array.isArray(lead.lead_details) &&
                          lead.lead_details.length > 0
                          ? lead.lead_details[0].score || 0
                          : lead.lead_details?.score || 0,
                      )}`}
                    >
                      {Array.isArray(lead.lead_details) &&
                      lead.lead_details.length > 0
                        ? lead.lead_details[0].score || 0
                        : lead.lead_details?.score || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
