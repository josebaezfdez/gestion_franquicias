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
    const { userId, fullName, email, password, role } = await req.json();

    console.log("Request data:", {
      userId,
      fullName,
      email,
      hasPassword: !!password,
      role,
    });

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

    // Check if user exists
    const { data: existingUser, error: checkError } =
      await supabase.auth.admin.getUserById(userId);

    if (checkError) {
      console.error("Error checking if user exists:", checkError);
      throw checkError;
    }

    if (!existingUser || !existingUser.user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update auth.users
    const updateData: any = {};

    if (password) {
      updateData.password = password;
    }

    if (email) {
      updateData.email = email;
    }

    if (fullName) {
      updateData.user_metadata = {
        ...existingUser.user.user_metadata,
        full_name: fullName,
      };
    }

    if (Object.keys(updateData).length > 0) {
      console.log("Updating user in auth.users:", userId);
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        updateData,
      );

      if (authError) {
        console.error("Error updating auth.users:", authError);
        throw authError;
      }
    }

    // Update public.users
    const updateUserData: any = {};

    if (fullName) {
      updateUserData.full_name = fullName;
    }

    if (email) {
      updateUserData.email = email;
    }

    if (role) {
      updateUserData.role = role;
    }

    if (Object.keys(updateUserData).length > 0) {
      updateUserData.updated_at = new Date().toISOString();

      console.log("Updating user in public.users:", userId);
      const { error: userError } = await supabase
        .from("users")
        .update(updateUserData)
        .eq("id", userId);

      if (userError) {
        console.error("Error updating public.users:", userError);
        throw userError;
      }
    }

    console.log("User updated successfully:", userId);

    return new Response(
      JSON.stringify({ success: true, message: "User updated successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error updating user:", error);
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
