import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  DollarSign,
  Activity,
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Loader2,
  Pencil,
  MoreVertical,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import EditLeadForm from "./EditLeadForm";
import DeleteLeadDialog from "./DeleteLeadDialog";
import AddTaskDialog from "./AddTaskDialog";
import AddCommunicationDialog from "./AddCommunicationDialog";
import EditCommunicationDialog from "./EditCommunicationDialog";
import UpdateLeadStatusDialog from "./UpdateLeadStatusDialog";
import TasksList from "./TasksList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { User as UserIcon } from "lucide-react";
import { getStatusColor, getStatusLabel, getScoreColor, getSourceChannelLabel } from "@/utils/leadHelpers";
import { useLead } from "@/hooks/useQueries";
import { useRole } from "@/contexts/RoleContext";
import { supabase } from "@/lib/supabase";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  created_at: string;
  lead_details: {
    previous_experience: string;
    investment_capacity: string;
    source_channel: string;
    interest_level: number;
    additional_comments: string;
    score: number;
  };
  lead_status_history: {
    id: string;
    status: string;
    notes: string;
    created_at: string;
    created_by: string;
    users: {
      full_name: string;
      avatar_url: string;
    } | null;
  }[];
  communications: {
    id: string;
    type: string;
    content: string;
    created_at: string;
    created_by: string;
    users: {
      full_name: string;
      avatar_url: string;
    } | null;
  }[];
};

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lead, isLoading: loading, refetch } = useLead(id || "");
  const { role: userRole } = useRole();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showAddCommunicationDialog, setShowAddCommunicationDialog] =
    useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const [showEditCommunicationDialog, setShowEditCommunicationDialog] =
    useState(false);
  const [communicationToEdit, setCommunicationToEdit] = useState<string | null>(
    null,
  );
  const [showDeleteCommunicationDialog, setShowDeleteCommunicationDialog] =
    useState(false);
  const [communicationToDelete, setCommunicationToDelete] = useState<
    string | null
  >(null);
  const [isDeletingCommunication, setIsDeletingCommunication] = useState(false);
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false);

  function handleLeadUpdated() {
    setShowEditForm(false);
    refetch();
  }

  function handleTaskAdded() {
    setShowAddTaskDialog(false);
    refetch();
  }

  function handleCommunicationAdded() {
    setShowAddCommunicationDialog(false);
    refetch();
    setActiveTab("communications");
  }

  async function handleDeleteCommunication() {
    try {
      setIsDeletingCommunication(true);
      const { error } = await supabase
        .from("communications")
        .delete()
        .eq("id", communicationToDelete);

      if (error) throw error;

      toast({
        title: "Comunicación eliminada",
        description: "La comunicación ha sido eliminada correctamente.",
      });

      refetch();
      setShowDeleteCommunicationDialog(false);
      setCommunicationToDelete(null);
    } catch (error) {
      console.error("Error deleting communication:", error);
      toast({
        title: "Error al eliminar la comunicación",
        description:
          "Ha ocurrido un problema al eliminar la comunicación. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingCommunication(false);
    }
  }

  function handleLeadDeleted() {
    navigate("/leads/list");
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getCommunicationTypeLabel(type: string) {
    const labels: Record<string, string> = {
      email: "Email",
      phone: "Teléfono",
      meeting: "Reunión",
      note: "Nota",
    };
    return labels[type] || type;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="ml-2 dark:text-white">Cargando detalles del proyecto...</span>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="dark:text-white">Proyecto no encontrado</p>
        <Button onClick={() => navigate("/leads")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Proyectos
        </Button>
      </div>
    );
  }

  if (showEditForm) {
    return (
      <div className="h-full bg-gray-50 dark:bg-[#1e2836]">
        <div className="bg-white dark:bg-[#1e2836] border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => setShowEditForm(false)}
            className="dark:text-white dark:hover:bg-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Detalles
          </Button>
        </div>
        <div className="p-8">
          <EditLeadForm
            leadId={lead.id}
            onSuccess={handleLeadUpdated}
            onCancel={() => setShowEditForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-[#1e2836]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1e2836] border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/leads/list")} className="dark:text-white dark:hover:bg-gray-700">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lead.full_name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Añadido el {formatDate(lead.created_at)}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {(userRole === "superadmin" || userRole === "admin") && (
              <>
                <Button variant="outline" onClick={() => setShowEditForm(true)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        {showDeleteDialog && (
          <DeleteLeadDialog
            leadId={lead.id}
            leadName={lead.full_name}
            isOpen={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
            onDeleted={handleLeadDeleted}
          />
        )}

        {showUpdateStatusDialog && (
          <UpdateLeadStatusDialog
            leadId={lead.id}
            currentStatus={lead.lead_status_history[0]?.status || "new_contact"}
            isOpen={showUpdateStatusDialog}
            onClose={() => setShowUpdateStatusDialog(false)}
            onSuccess={() => refetch()}
          />
        )}

        {showAddTaskDialog && (
          <AddTaskDialog
            leadId={lead.id}
            isOpen={showAddTaskDialog}
            onClose={() => setShowAddTaskDialog(false)}
            onSuccess={handleTaskAdded}
          />
        )}

        {showAddCommunicationDialog && (
          <AddCommunicationDialog
            leadId={lead.id}
            isOpen={showAddCommunicationDialog}
            onClose={() => setShowAddCommunicationDialog(false)}
            onSuccess={handleCommunicationAdded}
          />
        )}

        {communicationToEdit && (
          <EditCommunicationDialog
            communicationId={communicationToEdit}
            isOpen={showEditCommunicationDialog}
            onClose={() => {
              setShowEditCommunicationDialog(false);
              setCommunicationToEdit(null);
            }}
            onSuccess={() => {
              refetch();
              setActiveTab("communications");
            }}
          />
        )}

        <AlertDialog
          open={showDeleteCommunicationDialog}
          onOpenChange={setShowDeleteCommunicationDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará permanentemente la comunicación. Esta acción
                no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingCommunication}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  if (communicationToDelete) {
                    handleDeleteCommunication();
                  }
                }}
                disabled={isDeletingCommunication}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeletingCommunication ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm dark:bg-[#1e2836] dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
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
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="dark:text-gray-300">{lead.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="dark:text-gray-300">{lead.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="dark:text-gray-300">{lead.location}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="dark:text-gray-300">
                        Nivel de Interés: {lead.lead_details?.interest_level || 0}
                        /5
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="dark:text-gray-300">
                        ¿Dispone de local?:{" "}
                        {lead.lead_details?.investment_capacity === "yes"
                          ? "Sí"
                          : lead.lead_details?.investment_capacity === "no"
                            ? "No"
                            : "No especificado"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="dark:text-gray-300">Puntuación: </span>
                      <Badge
                        className={`ml-2 ${getScoreColor(lead.lead_details?.score || 0)}`}
                      >
                        {lead.lead_details?.score || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-2">
                      <span className="text-sm dark:text-gray-300">
                        Canal de Origen:{" "}
                        {lead.lead_details?.source_channel || "No especificado"}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4 dark:bg-gray-700" />

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2 dark:text-white">Experiencia Previa</h3>
                    <p className="text-muted-foreground dark:text-gray-400">
                      {lead.lead_details?.previous_experience !== null &&
                      lead.lead_details?.previous_experience !== ""
                        ? lead.lead_details.previous_experience
                        : "No se proporcionó información"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 dark:text-white">Comentarios Adicionales</h3>
                    <p className="text-muted-foreground dark:text-gray-400">
                      {lead.lead_details?.additional_comments !== null &&
                      lead.lead_details?.additional_comments !== ""
                        ? lead.lead_details.additional_comments
                        : "No se proporcionaron comentarios"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-3 dark:bg-gray-800">
                <TabsTrigger value="history" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Historial de Estado</TabsTrigger>
                <TabsTrigger value="communications" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Comunicaciones</TabsTrigger>
                <TabsTrigger value="tasks" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Tareas</TabsTrigger>
              </TabsList>
              <TabsContent value="history" className="mt-4">
                <Card className="dark:bg-[#1e2836] dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Historial de Estado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {lead.lead_status_history.map((status) => (
                        <div
                          key={status.id}
                          className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge className={getStatusColor(status.status)}>
                                {getStatusLabel(status.status)}
                              </Badge>
                              <p className="mt-2 dark:text-gray-300">{status.notes}</p>
                            </div>
                            <div className="text-sm text-muted-foreground dark:text-gray-400">
                              {formatDateTime(status.created_at)}
                            </div>
                          </div>
                          {status.users && (
                            <div className="flex items-center mt-2">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage
                                  src={status.users.avatar_url || undefined}
                                />
                                <AvatarFallback>
                                  {status.users.full_name?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm dark:text-gray-300">
                                {status.users.full_name || "System"}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="communications" className="mt-4">
                <Card className="dark:bg-[#1e2836] dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="dark:text-white">Comunicaciones</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => setShowAddCommunicationDialog(true)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Añadir
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {lead.communications.length === 0 ? (
                      <p className="text-center text-muted-foreground dark:text-gray-400 py-4">
                        No hay comunicaciones registradas aún
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {lead.communications.map((comm) => (
                          <div
                            key={comm.id}
                            className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-2"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 mr-2">
                                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  {getCommunicationTypeLabel(comm.type)}
                                </Badge>
                                <p className="mt-2 whitespace-pre-line dark:text-gray-300">
                                  {comm.content}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <div className="text-sm text-muted-foreground dark:text-gray-400 mr-2">
                                  {formatDateTime(comm.created_at)}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 dark:hover:bg-gray-700"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="dark:bg-[#1e2836] dark:border-gray-700">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setCommunicationToEdit(comm.id);
                                        setShowEditCommunicationDialog(true);
                                      }}
                                      className="dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setCommunicationToDelete(comm.id);
                                        setShowDeleteCommunicationDialog(true);
                                      }}
                                      className="text-red-600 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            {comm.users && (
                              <div className="flex items-center mt-2">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage
                                    src={comm.users.avatar_url || undefined}
                                  />
                                  <AvatarFallback>
                                    {comm.users.full_name?.[0] || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm dark:text-gray-300">
                                  {comm.users.full_name || "System"}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tasks" className="mt-4">
                <Card className="dark:bg-[#1e2836] dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="dark:text-white">Tareas</CardTitle>
                    <Button size="sm" onClick={() => setShowAddTaskDialog(true)} className="bg-red-600 hover:bg-red-700">
                      <Plus className="h-4 w-4 mr-1" /> Añadir
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <TasksList
                      leadId={lead.id}
                      onTasksChange={() => refetch()}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card className="dark:bg-[#1e2836] dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userRole === "superadmin" || userRole === "admin" ? (
                  <>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={() => setShowUpdateStatusDialog(true)}
                    >
                      Actualizar Estado
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                      onClick={() => setShowAddCommunicationDialog(true)}
                    >
                      Añadir Comunicación
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                      onClick={() => setShowAddTaskDialog(true)}
                    >
                      Programar Tarea
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                      onClick={() =>
                        window.open(`mailto:${lead.email}`, "_blank")
                      }
                    >
                      <Mail className="mr-2 h-4 w-4" /> Enviar Email
                    </Button>
                  </>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
                    <p className="text-muted-foreground dark:text-gray-400">Modo de solo lectura</p>
                    <p className="text-xs mt-1 dark:text-gray-500">
                      No tienes permisos para realizar acciones
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6 dark:bg-[#1e2836] dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Cronología</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...lead.lead_status_history, ...lead.communications]
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                    )
                    .slice(0, 5)
                    .map((item) => (
                      <div key={item.id} className="flex items-start space-x-3">
                        <div className="bg-primary/10 dark:bg-red-900/30 p-2 rounded-full">
                          {"status" in item ? (
                            <Activity className="h-4 w-4 text-primary dark:text-red-400" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-primary dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium dark:text-white">
                            {"status" in item ? (
                              <>Estado cambiado a {getStatusLabel(item.status)}</>
                            ) : (
                              <>
                                Comunicación de{" "}
                                {getCommunicationTypeLabel(item.type)}
                              </>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground dark:text-gray-400">
                            {formatDateTime(item.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}