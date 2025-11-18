import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

const formSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un email válido." }),
  phone: z
    .string()
    .min(6, { message: "Por favor, introduce un teléfono válido." }),
  location: z.string().min(2, { message: "La ubicación es obligatoria." }),
  previous_experience: z.string().optional(),
  investment_capacity: z
    .string()
    .min(1, { message: "La disponibilidad de local es obligatoria." }),
  source_channel: z
    .string()
    .min(1, { message: "El canal de origen es obligatorio." }),
  interest_level: z
    .string()
    .min(1, { message: "El nivel de interés es obligatorio." }),
  additional_comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LeadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LeadForm({ onSuccess, onCancel }: LeadFormProps = {}) {
  let navigate: any;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Not in router context, use callbacks instead
    navigate = null;
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

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
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      previous_experience: "",
      investment_capacity: "",
      source_channel: "",
      interest_level: "",
      additional_comments: "",
    },
  });

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-[#1e2836] rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Acceso Restringido</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No tienes permisos para crear nuevos candidatos. Contacta con un
          administrador si necesitas acceso.
        </p>
        <Button variant="outline" onClick={() => {
          if (navigate) navigate("/leads/list");
          else if (onCancel) onCancel();
        }} className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
          Volver a la lista de candidatos
        </Button>
      </div>
    );
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      console.log("Form values:", values);

      // Insert into leads table
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .insert({
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
          location: values.location,
        })
        .select()
        .single();

      if (leadError) {
        console.error("Error inserting lead:", leadError);
        throw leadError;
      }

      console.log("Lead inserted:", leadData);

      // Insert into lead_details table
      const { data: detailsData, error: detailsError } = await supabase
        .from("lead_details")
        .insert({
          lead_id: leadData.id,
          previous_experience:
            values.previous_experience !== undefined
              ? values.previous_experience
              : "",
          investment_capacity:
            values.investment_capacity !== undefined &&
            values.investment_capacity !== ""
              ? values.investment_capacity
              : "no",
          source_channel:
            values.source_channel !== undefined && values.source_channel !== ""
              ? values.source_channel
              : "website",
          interest_level:
            values.interest_level !== undefined
              ? parseInt(values.interest_level)
              : 3,
          additional_comments:
            values.additional_comments !== undefined
              ? values.additional_comments
              : "",
          // Calculate a basic score based on interest level and investment capacity
          score: calculateLeadScore(values),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      console.log("Lead details inserted with values:", {
        previous_experience:
          values.previous_experience !== undefined
            ? values.previous_experience
            : "",
        investment_capacity:
          values.investment_capacity !== undefined &&
          values.investment_capacity !== ""
            ? values.investment_capacity
            : "no",
        source_channel:
          values.source_channel !== undefined && values.source_channel !== ""
            ? values.source_channel
            : "website",
        interest_level:
          values.interest_level !== undefined
            ? parseInt(values.interest_level)
            : 3,
        additional_comments:
          values.additional_comments !== undefined
            ? values.additional_comments
            : "",
      });

      if (detailsError) {
        console.error("Error inserting lead details:", detailsError);
        throw detailsError;
      }

      console.log("Lead details inserted:", detailsData);

      // Insert initial status
      const { data: statusData, error: statusError } = await supabase
        .from("lead_status_history")
        .insert({
          lead_id: leadData.id,
          status: "new_contact",
          notes: "Candidato creado",
        })
        .select();

      if (statusError) {
        console.error("Error inserting status history:", statusError);
        throw statusError;
      }

      console.log("Status history inserted:", statusData);

      toast({
        title: "Candidato creado correctamente",
        description: "El candidato ha sido añadido al sistema.",
      });

      form.reset();
      
      if (navigate) {
        navigate("/leads/list");
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error al crear el candidato",
        description:
          "Ha ocurrido un problema al crear el candidato. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Simple scoring function - can be expanded with more complex logic
  function calculateLeadScore(values: FormValues): number {
    let score = 0;

    // Interest level contributes up to 50 points
    score += parseInt(values.interest_level) * 10;

    // Local availability contributes up to 50 points
    switch (values.investment_capacity) {
      case "yes":
        score += 50;
        break;
      case "no":
        score += 10;
        break;
    }

    // Previous experience can add bonus points
    if (values.previous_experience && values.previous_experience.length > 0) {
      score += 10;
    }

    // Additional comments can add bonus points
    if (values.additional_comments && values.additional_comments.length > 0) {
      score += 5;
    }

    console.log("Calculated score:", score, "for values:", values);
    return score;
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-[#1e2836]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1e2836] border-l-4 border-l-red-600 px-4 sm:px-8 py-6 flex items-start gap-3 sm:gap-4">
        <div className="bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 rounded-lg">
          <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Registrar Nuevo Candidato</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete el formulario para añadir un nuevo lead al sistema
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#1e2836] rounded-lg shadow-md p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                          className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Número de Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Ubicación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ciudad, País" {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="previous_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Experiencia Previa</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describa cualquier experiencia relevante en el sector de seguros"
                          {...field}
                          className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investment_capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">¿Dispone de local?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                            <SelectValue placeholder="Seleccione una opción" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-[#1e2836] dark:border-gray-700">
                          <SelectItem value="yes" className="dark:text-gray-300 dark:hover:bg-gray-700">Sí</SelectItem>
                          <SelectItem value="no" className="dark:text-gray-300 dark:hover:bg-gray-700">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source_channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Canal de Origen</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                            <SelectValue placeholder="Seleccione canal de origen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-[#1e2836] dark:border-gray-700">
                          <SelectItem value="website" className="dark:text-gray-300 dark:hover:bg-gray-700">Sitio Web</SelectItem>
                          <SelectItem value="referral" className="dark:text-gray-300 dark:hover:bg-gray-700">Referencia</SelectItem>
                          <SelectItem value="social_media" className="dark:text-gray-300 dark:hover:bg-gray-700">
                            Redes Sociales
                          </SelectItem>
                          <SelectItem value="event" className="dark:text-gray-300 dark:hover:bg-gray-700">Evento</SelectItem>
                          <SelectItem value="advertisement" className="dark:text-gray-300 dark:hover:bg-gray-700">Publicidad</SelectItem>
                          <SelectItem value="other" className="dark:text-gray-300 dark:hover:bg-gray-700">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interest_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Nivel de Interés</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                            <SelectValue placeholder="Seleccione nivel de interés" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-[#1e2836] dark:border-gray-700">
                          <SelectItem value="1" className="dark:text-gray-300 dark:hover:bg-gray-700">1 - Muy Bajo</SelectItem>
                          <SelectItem value="2" className="dark:text-gray-300 dark:hover:bg-gray-700">2 - Bajo</SelectItem>
                          <SelectItem value="3" className="dark:text-gray-300 dark:hover:bg-gray-700">3 - Medio</SelectItem>
                          <SelectItem value="4" className="dark:text-gray-300 dark:hover:bg-gray-700">4 - Alto</SelectItem>
                          <SelectItem value="5" className="dark:text-gray-300 dark:hover:bg-gray-700">5 - Muy Alto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="additional_comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-300">Comentarios Adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Cualquier información adicional sobre el candidato"
                        {...field}
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Registrar Candidato"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}