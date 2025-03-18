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
    return new Response("ok", { headers: corsHeaders, status: 200 });
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
    const { email, password, fullName, role } = await req.json();

    console.log("Request data:", {
      email,
      hasPassword: !!password,
      fullName,
      role,
    });

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if user already exists in auth.users
    console.log("Checking if user exists:", email);
    const { data: existingUsers, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (checkError) {
      console.error("Error checking if user exists:", checkError);
      throw checkError;
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log("User already exists:", email);
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create the user using admin API
    console.log("Creating user:", email);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (error) {
      console.error("Error creating user:", error);
      throw error;
    }

    // Verify user was created and has an ID
    if (!data || !data.user || !data.user.id) {
      console.error("User created but no ID returned");
      throw new Error("User created but no ID was returned");
    }

    // Create user in public.users with role
    console.log("Creating user in public.users:", email);
    const { error: userError } = await supabase.from("users").insert({
      id: data.user.id,
      email: email,
      full_name: fullName,
      role: role,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      created_at: new Date().toISOString(),
    });

    if (userError) {
      console.error("Error creating user in public.users:", userError);
      // If there was an error creating the user in the public.users table,
      // we should try to delete the auth user to maintain consistency
      try {
        await supabase.auth.admin.deleteUser(data.user.id);
      } catch (deleteError) {
        console.error(
          "Error deleting auth user after failed user creation:",
          deleteError,
        );
      }
      throw userError;
    }

    console.log("User created successfully with ID:", data.user.id);

    return new Response(
      JSON.stringify({ success: true, userId: data.user.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create user" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
