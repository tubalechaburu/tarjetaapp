
// Custom email templates for authentication emails
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // This will be called by Supabase Auth when a new user signs up
    // You can customize the HTML for the email here
    const { type, email } = await req.json();

    if (type !== "signup") {
      return new Response(
        JSON.stringify({ error: "Only signup emails are supported" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a Supabase client for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Example: Customize the email template based on type
    const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirma tu cuenta en TarjetaApp</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }
        .logo {
          max-width: 150px;
        }
        .content {
          padding: 20px 0;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          border-top: 1px solid #eee;
          padding-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>¡Bienvenido a TarjetaApp!</h1>
      </div>
      <div class="content">
        <p>Hola,</p>
        <p>Gracias por registrarte en TarjetaApp. Para activar tu cuenta, por favor confirma tu dirección de correo electrónico haciendo clic en el botón de abajo:</p>
        <p style="text-align: center;">
          <a href="{{.ConfirmationURL}}" class="button">Confirmar mi cuenta</a>
        </p>
        <p>O copia y pega el siguiente enlace en tu navegador:</p>
        <p>{{.ConfirmationURL}}</p>
        <p>Si no te registraste en TarjetaApp, puedes ignorar este mensaje.</p>
      </div>
      <div class="footer">
        <p>&copy; 2025 TarjetaApp - Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
    `;

    // Log that we received this request - for debugging
    console.log(`Custom email template generated for ${email}`);

    return new Response(
      JSON.stringify({ template }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error handling request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
