import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  Edit,
  Trash2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  User,
  Building,
  Calendar,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../../../supabase/auth";

type Franchise = {
  id: string;
  name: string;
  contact_person: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  website: string;
  tesis_code: string;
  created_at: string;
  updated_at: string;
};

export default function FranchiseDetail() {
  const { id } = useParams<{ id: string }>();
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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
    fetchFranchiseData();
  }, [id]);

  async function fetchFranchiseData() {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("franchises")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFranchise(data);
    } catch (error) {
      console.error("Error fetching franchise data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de la franquicia",
        variant: "destructive",
      });
      navigate("/franchises");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!id || !isAuthorized) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase.from("franchises").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Franquicia eliminada",
        description: "La franquicia ha sido eliminada correctamente",
      });

      navigate("/franchises");
    } catch (error) {
      console.error("Error deleting franchise:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la franquicia",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 dark:text-white">Cargando datos de la franquicia...</span>
      </div>
    );
  }

  if (!franchise) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card className="dark:bg-[#1e2836] dark:border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="dark:text-white">No se encontró la franquicia solicitada</p>
            <Button
              variant="outline"
              className="mt-4 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              onClick={() => navigate("/franchises")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al listado
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-[#1e2836]">
      <div className="bg-white dark:bg-[#1e2836] border-b border-gray-200 dark:border-gray-700 px-4 sm:px-8 py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/franchises")}
            className="mr-4 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <h1 className="text-3xl font-bold flex-1 dark:text-white">{franchise.name}</h1>
          {isAuthorized && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/franchises/edit/${franchise.id}`)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="dark:bg-[#1e2836] dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Información de la Franquicia</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Detalles completos de la franquicia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                      Datos Principales
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <p className="font-medium dark:text-white">{franchise.name}</p>
                          {franchise.tesis_code && (
                            <Badge variant="outline" className="mt-1 dark:border-gray-600 dark:text-gray-300">
                              Código Tesis: {franchise.tesis_code}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        <span className="dark:text-gray-300">{franchise.contact_person}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                      Ubicación
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                        <div className="dark:text-gray-300">
                          <p>{franchise.address}</p>
                          <p>
                            {franchise.city}, {franchise.province}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                    Contacto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-primary" />
                      <span className="dark:text-gray-300">{franchise.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-primary" />
                      <a
                        href={`mailto:${franchise.email}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {franchise.email}
                      </a>
                    </div>
                    {franchise.website && (
                      <div className="flex items-center md:col-span-2">
                        <Globe className="h-4 w-4 mr-2 text-primary" />
                        <a
                          href={
                            franchise.website.startsWith("http")
                              ? franchise.website
                              : `https://${franchise.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {franchise.website.replace(/^https?:\/\//i, "")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-100 dark:border-gray-700 pt-4 text-sm text-muted-foreground dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Creado: {formatDate(franchise.created_at)}</span>
                  </div>
                  {franchise.updated_at && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Actualizado: {formatDate(franchise.updated_at)}</span>
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card className="dark:bg-[#1e2836] dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Acciones</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Operaciones disponibles para esta franquicia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full bg-red-600 hover:bg-red-700"
                  variant="outline"
                  onClick={() =>
                    window.open(`mailto:${franchise.email}`, "_blank")
                  }
                >
                  <Mail className="mr-2 h-4 w-4" /> Enviar Email
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `tel:${franchise.phone}`)
                  }
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  <Phone className="mr-2 h-4 w-4" /> Llamar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="dark:bg-[#1e2836] dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Esta acción eliminará permanentemente la franquicia{" "}
              <strong>{franchise.name}</strong>. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
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
    </div>
  );
}