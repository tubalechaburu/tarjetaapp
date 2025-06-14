
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

    // Use the custom domain tarjetavisita.app
    const baseUrl = "https://tarjetavisita.app";
    
    // Create confirmation URL with the correct domain
    const confirmationUrl = token_hash 
      ? `${baseUrl}/auth/confirm?token_hash=${token_hash}&type=${type}&redirect_to=${redirect_to || '/'}`
      : `${baseUrl}/auth/confirm?token=${token}&type=${type}&redirect_to=${redirect_to || '/'}`;

    // Get email subject and content based on type
    let subject = "";
    let greeting = "";
    let mainMessage = "";
    let buttonText = "";

    switch (type) {
      case "signup":
        subject = "¡Bienvenido a TarjetaVisita! Confirma tu cuenta";
        greeting = "¡Bienvenido a TarjetaVisita!";
        mainMessage = "Gracias por registrarte en TarjetaVisita, la plataforma líder para crear tarjetas de presentación digitales profesionales. Para comenzar a crear tus tarjetas personalizadas, por favor confirma tu dirección de correo electrónico haciendo clic en el botón de abajo:";
        buttonText = "Confirmar mi cuenta y empezar";
        break;
      case "recovery":
        subject = "Restablecer contraseña - TarjetaVisita";
        greeting = "Restablece tu contraseña";
        mainMessage = "Hemos recibido una solicitud para restablecer tu contraseña de TarjetaVisita. Haz clic en el botón de abajo para crear una nueva contraseña:";
        buttonText = "Restablecer contraseña";
        break;
      case "email_change":
        subject = "Confirmar cambio de email - TarjetaVisita";
        greeting = "Confirma tu nuevo email";
        mainMessage = "Por favor, confirma tu nueva dirección de correo electrónico para continuar usando TarjetaVisita:";
        buttonText = "Confirmar nuevo email";
        break;
    }

    // Enhanced email template with TarjetaVisita branding and real logo
    const template = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f6f9fc;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
          color: white;
          text-align: center;
          padding: 40px 20px;
        }
        .logo-section {
          margin-bottom: 20px;
        }
        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 15px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .logo img {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        .brand-name {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .subtitle {
          opacity: 0.9;
          font-size: 16px;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .greeting {
          font-size: 24px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #4a5568;
          margin-bottom: 30px;
          line-height: 1.7;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
          color: white;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: transform 0.2s ease;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .link-section {
          background-color: #f7fafc;
          padding: 20px;
          margin: 30px 0;
          border-radius: 8px;
          border-left: 4px solid #8B5CF6;
        }
        .link-text {
          font-size: 14px;
          color: #718096;
          margin-bottom: 10px;
        }
        .copy-link {
          font-size: 12px;
          color: #8B5CF6;
          word-break: break-all;
          background-color: #edf2f7;
          padding: 10px;
          border-radius: 4px;
        }
        .features {
          background-color: #faf5ff;
          padding: 25px;
          margin: 25px 0;
          border-radius: 8px;
          border: 1px solid #e9d5ff;
        }
        .features-title {
          font-size: 18px;
          font-weight: 600;
          color: #553c9a;
          margin-bottom: 15px;
          text-align: center;
        }
        .features-list {
          list-style: none;
          padding: 0;
        }
        .features-list li {
          font-size: 14px;
          color: #553c9a;
          padding: 5px 0;
          padding-left: 20px;
          position: relative;
        }
        .features-list li:before {
          content: "✨";
          position: absolute;
          left: 0;
        }
        .footer {
          background-color: #f7fafc;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .footer-text {
          font-size: 14px;
          color: #718096;
          margin-bottom: 10px;
        }
        .footer-link {
          color: #8B5CF6;
          text-decoration: none;
        }
        .security-note {
          background-color: #fef5e7;
          border: 1px solid #f6e05e;
          border-radius: 6px;
          padding: 15px;
          margin-top: 20px;
          text-align: left;
        }
        .security-note-title {
          font-weight: 600;
          color: #744210;
          margin-bottom: 5px;
        }
        .security-note-text {
          font-size: 14px;
          color: #744210;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .content {
            padding: 30px 20px;
          }
          .header {
            padding: 30px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-section">
            <div class="logo">
              <img src="https://tarjetavisita.app/tarjetavisita-logo.png" alt="TarjetaVisita Logo" />
            </div>
          </div>
          <div class="brand-name">TarjetaVisita</div>
          <div class="subtitle">Tu tarjeta de presentación digital profesional</div>
        </div>
        
        <div class="content">
          <h1 class="greeting">${greeting}</h1>
          <p class="message">${mainMessage}</p>
          
          <a href="${confirmationUrl}" class="button">${buttonText}</a>
          
          ${type === 'signup' ? `
          <div class="features">
            <div class="features-title">¿Qué puedes hacer con TarjetaVisita?</div>
            <ul class="features-list">
              <li>Crear tarjetas digitales profesionales</li>
              <li>Compartir tus contactos con códigos QR</li>
              <li>Personalizar diseños y colores</li>
              <li>Gestionar múltiples tarjetas</li>
              <li>Acceso desde cualquier dispositivo</li>
            </ul>
          </div>
          ` : ''}
          
          <div class="link-section">
            <p class="link-text">O copia y pega el siguiente enlace en tu navegador:</p>
            <div class="copy-link">${confirmationUrl}</div>
          </div>
          
          <div class="security-note">
            <div class="security-note-title">🔒 Nota de seguridad</div>
            <div class="security-note-text">
              Si no realizaste esta acción, puedes ignorar este mensaje de forma segura. 
              Este enlace expirará en 24 horas por motivos de seguridad.
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">
            Este correo fue enviado por <strong>TarjetaVisita</strong><br>
            La plataforma líder en tarjetas de presentación digitales
          </p>
          <p class="footer-text">
            <a href="mailto:soporte@tarjetavisita.app" class="footer-link">¿Necesitas ayuda?</a> • 
            <a href="https://tarjetavisita.app" class="footer-link">Visitar TarjetaVisita</a>
          </p>
          <p class="footer-text" style="margin-top: 15px; font-size: 12px;">
            &copy; 2025 TarjetaVisita - Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    console.log(`Custom email template generated for ${email} (type: ${type})`);
    console.log("Using domain:", baseUrl);

    return new Response(
      JSON.stringify({ 
        subject,
        template,
        success: true 
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
