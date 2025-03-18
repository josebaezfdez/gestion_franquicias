import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    console.log("Supabase URL:", supabaseUrl);
    console.log("Service Key available:", !!supabaseServiceKey);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the request body
    const { userId } = await req.json();

    console.log("Request data:", { userId });

    // Validate required fields
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing required userId field" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // First delete from public.users table
    console.log("Deleting user from public.users table:", userId);
    const { error: publicUserError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (publicUserError) {
      console.error("Error deleting from public.users:", publicUserError);
      // Continue anyway to try to delete from auth
    }

    // Then delete from auth.users
    console.log("Deleting user from auth.users:", userId);
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting from auth.users:", authError);
      throw authError;
    }

    console.log("User deleted successfully:", userId);

    return new Response(
      JSON.stringify({ success: true, message: "User deleted successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
