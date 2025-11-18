import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../supabase/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, MapPin, BarChart, Activity, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

type DashboardStats = {
  totalLeads: number;
  newLeadsThisMonth: number;
  conversionRate: number;
  averageScore: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  leadsByLocation: Record<string, number>;
  recentLeads: Array<{
    id: string;
    full_name: string;
    created_at: string;
    status: string;
    score: number;
  }>;
};

export default function LeadDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!fetchingRef.current) {
      fetchDashboardStats();
    }
  }, []);

  async function fetchDashboardStats() {
    if (fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      // Get all leads with their details and latest status
      const { data: leadsData, error: leadsError } = await supabase.from(
        "leads",
      ).select(`
          *,
          lead_details(*),
          lead_status_history(status, created_at)
        `);

      if (leadsError) {
        console.error("Error fetching dashboard stats:", leadsError);
        setError("No se pudieron cargar los datos del dashboard");
        // Set empty stats instead of failing
        setStats({
          totalLeads: 0,
          newLeadsThisMonth: 0,
          conversionRate: 0,
          averageScore: 0,
          leadsByStatus: {},
          leadsBySource: {},
          leadsByLocation: {},
          recentLeads: [],
        });
        setLoading(false);
        return;
      }

      // Handle empty data
      if (!leadsData || leadsData.length === 0) {
        setStats({
          totalLeads: 0,
          newLeadsThisMonth: 0,
          conversionRate: 0,
          averageScore: 0,
          leadsByStatus: {},
          leadsBySource: {},
          leadsByLocation: {},
          recentLeads: [],
        });
        setLoading(false);
        return;
      }

      // Process the data
      const processedLeads = leadsData.map((lead) => {
        // Sort status history by created_at in descending order to get the latest
        const sortedStatusHistory = lead.lead_status_history.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        return {
          ...lead,
          latestStatus: sortedStatusHistory[0]?.status || "new_contact",
        };
      });

      // Calculate stats
      const totalLeads = processedLeads.length;

      // New leads this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newLeadsThisMonth = processedLeads.filter(
        (lead) => new Date(lead.created_at) >= startOfMonth,
      ).length;

      // Conversion rate (leads with status "contract_signed" / total leads)
      const convertedLeads = processedLeads.filter(
        (lead) => lead.latestStatus === "contract_signed",
      ).length;
      const conversionRate =
        totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      // Average score
      const totalScore = processedLeads.reduce((sum, lead) => {
        // Check if lead_details is an array and get the first element's score
        if (Array.isArray(lead.lead_details) && lead.lead_details.length > 0) {
          return sum + (lead.lead_details[0].score || 0);
        }
        return sum + (lead.lead_details?.score || 0);
      }, 0);
      const averageScore = totalLeads > 0 ? totalScore / totalLeads : 0;

      // Leads by status
      const leadsByStatus = processedLeads.reduce(
        (acc, lead) => {
          const status = lead.latestStatus;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Leads by source
      const leadsBySource = processedLeads.reduce(
        (acc, lead) => {
          let source;
          // Check if lead_details is an array and get the first element's source_channel
          if (
            Array.isArray(lead.lead_details) &&
            lead.lead_details.length > 0
          ) {
            source = lead.lead_details[0].source_channel || "unknown";
          } else {
            source = lead.lead_details?.source_channel || "unknown";
          }

          // Normalize empty strings to "unknown"
          if (source === "" || source === null || source === undefined)
            source = "unknown";

          acc[source] = (acc[source] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      console.log("Fuentes de candidatos procesadas:", leadsBySource);

      // Leads by location
      const leadsByLocation = processedLeads.reduce(
        (acc, lead) => {
          const location = lead.location;
          acc[location] = (acc[location] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Recent leads
      const recentLeads = processedLeads
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5)
        .map((lead) => {
          let score = 0;
          if (
            Array.isArray(lead.lead_details) &&
            lead.lead_details.length > 0
          ) {
            score = lead.lead_details[0].score || 0;
          } else {
            score = lead.lead_details?.score || 0;
          }

          return {
            id: lead.id,
            full_name: lead.full_name,
            created_at: lead.created_at,
            status: lead.latestStatus,
            score: score,
          };
        });

      setStats({
        totalLeads,
        newLeadsThisMonth,
        conversionRate,
        averageScore,
        leadsByStatus,
        leadsBySource,
        leadsByLocation,
        recentLeads,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError("Error de conexión. Por favor, verifica tu conexión a internet.");
      // Set empty stats on error
      setStats({
        totalLeads: 0,
        newLeadsThisMonth: 0,
        conversionRate: 0,
        averageScore: 0,
        leadsByStatus: {},
        leadsBySource: {},
        leadsByLocation: {},
        recentLeads: [],
      });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }

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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="ml-2 dark:text-white">Cargando panel...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gray-50 dark:bg-[#1e2836]">
        <div className="bg-white dark:bg-[#1e2836] border-l-4 border-l-red-600 px-4 sm:px-8 py-6 flex items-start gap-3 sm:gap-4">
          <div className="bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 rounded-lg">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard - Resumen Ejecutivo</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visualización de KPIs principales y rankings por dimensión
            </p>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
            <button 
              onClick={fetchDashboardStats}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6 text-center dark:text-white">
        Error al cargar los datos del panel
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-[#1e2836]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1e2836] border-l-4 border-l-red-600 px-4 sm:px-8 py-6 flex items-start gap-3 sm:gap-4">
        <div className="bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 rounded-lg">
          <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard - Resumen Ejecutivo</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualización de KPIs principales y rankings por dimensión
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow dark:bg-[#1e2836] dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total de Proyectos
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalLeads}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.newLeadsThisMonth} nuevos este mes
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow dark:bg-[#1e2836] dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Tasa de Conversión
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.conversionRate.toFixed(1)}%
              </div>
              <Progress value={stats.conversionRate} className="h-2 mt-3 bg-gray-200 dark:bg-gray-700" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow dark:bg-[#1e2836] dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Puntuación Media
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.averageScore.toFixed(1)}
              </div>
              <Progress
                value={(stats.averageScore / 100) * 100}
                className="h-2 mt-3 bg-gray-200 dark:bg-gray-700"
                indicatorClassName={
                  stats.averageScore >= 80
                    ? "bg-green-500"
                    : stats.averageScore >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow dark:bg-[#1e2836] dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Ubicaciones
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 mt-2">
                {Object.entries(stats.leadsByLocation)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([location, count], index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="truncate text-gray-700 dark:text-gray-300">{location}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline and Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-[#1e2836] dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Resumen del Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.leadsByStatus).map(([status, count]) => (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge className={`${getStatusColor(status)} rounded-full`}>
                          {getStatusLabel(status)}
                        </Badge>
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{count} proyectos</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {((count / stats.totalLeads) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={(count / stats.totalLeads) * 100}
                      className="h-2 bg-gray-200 dark:bg-gray-700"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm dark:bg-[#1e2836] dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Fuentes de Proyectos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.leadsBySource)
                  .sort((a, b) => b[1] - a[1])
                  .map(([source, count]) => (
                    <div key={source} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {getSourceChannelLabel(source || "unknown")}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {count} ({((count / stats.totalLeads) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <Progress
                        value={(count / stats.totalLeads) * 100}
                        className="h-2 bg-gray-200 dark:bg-gray-700"
                      />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card className="border-0 shadow-sm dark:bg-[#1e2836] dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Proyectos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.full_name}`}
                      />
                      <AvatarFallback className="bg-red-100 text-red-600 dark:bg-red-900/30">
                        {lead.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{lead.full_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(lead.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(lead.status)} rounded-full`}>
                      {getStatusLabel(lead.status)}
                    </Badge>
                    <Badge className={`${getScoreColor(lead.score)} rounded-full`}>
                      {lead.score}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}