
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Custom email function called with method:", req.method);
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Request body:", body);
    
    const { type, email, token, token_hash, redirect_to, site_url } = body;

    // Support multiple email types
    if (!["signup", "recovery", "email_change"].includes(type)) {
      console.log("Unsupported email type:", type);
      return new Response(
        JSON.stringify({ error: `Email type '${type}' is not supported` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the current domain from the request
    const origin = req.headers.get('origin') || "https://tarjetavisita.app";
    const baseUrl = origin;
    
    console.log("Using base URL:", baseUrl);
    
    // Create confirmation URL - prioritize token_hash for newer auth flows
    let confirmationUrl;
    if (token_hash) {
      confirmationUrl = `${baseUrl}/auth/confirm?token_hash=${encodeURIComponent(token_hash)}&type=${type}`;
      if (redirect_to) {
        confirmationUrl += `&redirect_to=${encodeURIComponent(redirect_to)}`;
      }
    } else if (token) {
      confirmationUrl = `${baseUrl}/auth/confirm?token=${encodeURIComponent(token)}&type=${type}&email=${encodeURIComponent(email)}`;
      if (redirect_to) {
        confirmationUrl += `&redirect_to=${encodeURIComponent(redirect_to)}`;
      }
    } else {
      throw new Error("No token or token_hash provided");
    }

    console.log("Generated confirmation URL:", confirmationUrl);

    // Get email subject and content based on type
    let subject = "";
    let greeting = "";
    let mainMessage = "";
    let buttonText = "";

    switch (type) {
      case "signup":
        subject = "¡Confirma tu cuenta en TarjetaVisita!";
        greeting = "¡Bienvenido a TarjetaVisita!";
        mainMessage = "Gracias por registrarte. Para activar tu cuenta y comenzar a crear tus tarjetas de presentación digitales, confirma tu email haciendo clic en el botón:";
        buttonText = "Confirmar mi cuenta";
        break;
      case "recovery":
        subject = "Restablecer contraseña - TarjetaVisita";
        greeting = "Restablece tu contraseña";
        mainMessage = "Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el botón para crear una nueva contraseña:";
        buttonText = "Restablecer contraseña";
        break;
      case "email_change":
        subject = "Confirmar cambio de email - TarjetaVisita";
        greeting = "Confirma tu nuevo email";
        mainMessage = "Confirma tu nueva dirección de correo electrónico:";
        buttonText = "Confirmar nuevo email";
        break;
    }

    // Simplified but effective email template
    const template = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #8B5CF6; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 14px; }
        .content { text-align: center; }
        .greeting { font-size: 20px; color: #333; margin-bottom: 20px; }
        .message { color: #555; line-height: 1.6; margin-bottom: 30px; }
        .button { display: inline-block; background: #8B5CF6; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #7C3AED; }
        .link-section { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .copy-link { font-size: 12px; color: #666; word-break: break-all; background: #eee; padding: 10px; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TarjetaVisita</div>
          <div class="subtitle">Tu tarjeta de presentación digital</div>
        </div>
        
        <div class="content">
          <h1 class="greeting">${greeting}</h1>
          <p class="message">${mainMessage}</p>
          
          <a href="${confirmationUrl}" class="button">${buttonText}</a>
          
          <div class="link-section">
            <p style="margin-bottom: 10px; color: #666;">O copia y pega este enlace:</p>
            <div class="copy-link">${confirmationUrl}</div>
          </div>
          
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            Si no solicitaste esto, puedes ignorar este email de forma segura.
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 TarjetaVisita - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
    `;

    console.log(`Email template generated for ${email} (type: ${type})`);
    console.log("Using confirmation URL:", confirmationUrl);

    return new Response(
      JSON.stringify({ 
        subject,
        template,
        success: true,
        confirmation_url: confirmationUrl
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error handling custom email request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Error interno del servidor al generar el email personalizado"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
