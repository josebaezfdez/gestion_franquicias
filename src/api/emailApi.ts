import { supabase } from "../../supabase/supabase";
import { Tables } from "@/types/supabase";

type EmailSettings = Tables<"email_settings">;

export async function getEmailSettings(): Promise<EmailSettings | null> {
  try {
    const { data, error } = await supabase
      .from("email_settings")
      .select("*")
      .single();

    if (error) {
      if (error.code !== "PGRST116") {
        // PGRST116 is the error code for "no rows returned"
        console.error("Error fetching email settings:", error);
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching email settings:", error);
    return null;
  }
}

export async function saveEmailSettings(
  settings: Partial<EmailSettings>,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from("email_settings")
      .select("id")
      .single();

    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from("email_settings")
        .update(settings)
        .eq("id", existingSettings.id);

      if (error) throw error;
    } else {
      // Insert new settings
      const { error } = await supabase.from("email_settings").insert(settings);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving email settings:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error saving settings",
    };
  }
}

export async function logCommunication(
  leadId: string,
  subject: string,
  content: string,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("communications").insert({
      lead_id: leadId,
      type: "email",
      content: `Asunto: ${subject}\n\n${content}`,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error logging communication:", error);
    return false;
  }
}
