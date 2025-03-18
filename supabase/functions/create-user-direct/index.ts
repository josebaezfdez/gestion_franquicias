import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Get request body
    const { email, password, full_name, role } = await req.json();
    console.log("Received request to create user:", { email, full_name, role });

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      throw new Error("Missing required fields");
    }

    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      throw new Error("Server configuration error");
    }

    console.log("Creating admin client with URL:", supabaseUrl);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already exists
    console.log("Checking if user already exists:", email);
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("email", email);

    if (checkError) {
      console.error("Error checking existing user:", checkError);
      throw new Error(`Error checking existing user: ${checkError.message}`);
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log("User already exists:", email);
      throw new Error("Este email ya está registrado en el sistema");
    }

    // Create user in auth.users
    console.log("Creating user in auth system:", email);
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
        },
      });

    if (authError) {
      console.error("Auth error:", authError);
      throw new Error(`Error creating auth user: ${authError.message}`);
    }

    if (!authData || !authData.user) {
      console.error("No user data returned from auth");
      throw new Error(
        "No se pudo crear el usuario en el sistema de autenticación",
      );
    }

    // Create user in public.users table with role
    console.log("Creating user in public.users table:", email);
    const { error: userError } = await supabaseAdmin.from("users").insert({
      id: authData.user.id,
      email,
      full_name,
      role,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      created_at: new Date().toISOString(),
    });

    if (userError) {
      console.error("User table error:", userError);
      throw new Error(`Error creating user record: ${userError.message}`);
    }

    console.log("User created successfully:", authData.user.id);
    return new Response(
      JSON.stringify({
        success: true,
        userId: authData.user.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
