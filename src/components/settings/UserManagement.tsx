import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, UserPlus, Edit, Trash2, LayoutGrid, List } from "lucide-react";
import AddUserDialog from "./AddUserDialog";
import EditUserDialog from "./EditUserDialog";
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

type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string;
  created_at: string;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("users").select("*");

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser) return;

    try {
      setIsDeleting(true);

      if (selectedUser.id === currentUser?.id) {
        throw new Error("No puedes eliminar tu propio usuario");
      }

      const { data, error } = await supabase.functions.invoke("delete-admin", {
        body: {
          userId: selectedUser.id,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Error al eliminar el usuario");
      }

      if (!data || !data.success) {
        throw new Error(data?.error || "Error al eliminar el usuario");
      }

      const { error: publicUserError } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedUser.id);

      if (publicUserError) {
        console.warn("Error deleting from public.users:", publicUserError);
      }

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado completamente del sistema",
      });

      fetchUsers();
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  function getRoleBadgeColor(role: string) {
    switch (role) {
      case "superadmin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "user":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
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

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Gestión de Usuarios</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View Toggle - Only on Desktop */}
          <div className="hidden xl:flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className={viewMode === "cards" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={viewMode === "table" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-none">
            <UserPlus className="mr-2 h-4 w-4" /> Añadir Usuario
          </Button>
        </div>
      </div>

      <Card className="dark:bg-[#1e2836] dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Usuarios del Sistema</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Gestiona los usuarios y sus roles en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-red-600 mr-2" />
              <span className="dark:text-white">Cargando usuarios...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground dark:text-gray-400">
              No hay usuarios registrados
            </div>
          ) : (
            <>
              {/* Cards View - Mobile/Tablet Default, Desktop Optional */}
              {(viewMode === "cards" || !isDesktop) && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <Card key={user.id} className="dark:bg-gray-800 dark:border-gray-700">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-red-100 text-red-600 text-xl">
                              {user.full_name?.[0] || user.email?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 w-full">
                            <h3 className="font-semibold text-lg dark:text-white">{user.full_name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 break-all">{user.email}</p>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Creado: {user.created_at ? formatDate(user.created_at) : "N/A"}
                          </div>
                          <div className="flex gap-2 w-full">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteDialog(true);
                              }}
                              disabled={user.id === currentUser?.id}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Table View - Desktop Only */}
              {viewMode === "table" && isDesktop && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="dark:border-gray-700">
                        <TableHead className="dark:text-gray-300">Usuario</TableHead>
                        <TableHead className="dark:text-gray-300">Email</TableHead>
                        <TableHead className="dark:text-gray-300">Rol</TableHead>
                        <TableHead className="dark:text-gray-300">Fecha de Creación</TableHead>
                        <TableHead className="text-right dark:text-gray-300">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="dark:border-gray-700">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-red-100 text-red-600">
                                  {user.full_name?.[0] || user.email?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium dark:text-white">{user.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="dark:text-gray-300">{user.email}</TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {user.created_at ? formatDate(user.created_at) : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="dark:hover:bg-gray-700"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteDialog(true);
                                }}
                                disabled={user.id === currentUser?.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {showAddDialog && (
        <AddUserDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => {
            fetchUsers();
            setShowAddDialog(false);
          }}
        />
      )}

      {showEditDialog && selectedUser && (
        <EditUserDialog
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            fetchUsers();
            setShowEditDialog(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="dark:bg-[#1e2836] dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Esta acción eliminará permanentemente al usuario{" "}
              {selectedUser?.full_name || selectedUser?.email}. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteUser();
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