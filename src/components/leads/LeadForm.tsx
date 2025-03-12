import { useState } from "react";
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

const formSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(6, { message: "Please enter a valid phone number." }),
  location: z.string().min(2, { message: "Location is required." }),
  previous_experience: z.string().optional(),
  investment_capacity: z
    .string()
    .min(1, { message: "Investment capacity is required." }),
  source_channel: z.string().min(1, { message: "Source channel is required." }),
  interest_level: z.string().min(1, { message: "Interest level is required." }),
  additional_comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
          previous_experience: values.previous_experience || "",
          investment_capacity: values.investment_capacity,
          source_channel: values.source_channel,
          interest_level: parseInt(values.interest_level),
          additional_comments: values.additional_comments || "",
          // Calculate a basic score based on interest level and investment capacity
          score: calculateLeadScore(values),
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
          notes: "Lead created",
        })
        .select();

      if (statusError) {
        console.error("Error inserting status history:", statusError);
        throw statusError;
      }

      console.log("Status history inserted:", statusData);

      toast({
        title: "Lead creado correctamente",
        description: "El lead ha sido añadido al sistema.",
      });

      form.reset();
      navigate("/leads/list");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error al crear el lead",
        description:
          "Ha ocurrido un problema al crear el lead. Por favor, inténtalo de nuevo.",
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

    return score;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Registrar Nuevo Lead</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
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
                  <FormLabel>Número de Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
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
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="City, Country" {...field} />
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
                  <FormLabel>Experiencia Previa</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa cualquier experiencia relevante en el sector de seguros"
                      {...field}
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
                  <FormLabel>¿Dispone de local?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una opción" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
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
                  <FormLabel>Canal de Origen</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione canal de origen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="website">Sitio Web</SelectItem>
                      <SelectItem value="referral">Referencia</SelectItem>
                      <SelectItem value="social_media">
                        Redes Sociales
                      </SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                      <SelectItem value="advertisement">Publicidad</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
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
                  <FormLabel>Nivel de Interés</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione nivel de interés" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 - Muy Bajo</SelectItem>
                      <SelectItem value="2">2 - Bajo</SelectItem>
                      <SelectItem value="3">3 - Medio</SelectItem>
                      <SelectItem value="4">4 - Alto</SelectItem>
                      <SelectItem value="5">5 - Muy Alto</SelectItem>
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
                <FormLabel>Comentarios Adicionales</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Cualquier información adicional sobre el lead"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Registrar Lead"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
