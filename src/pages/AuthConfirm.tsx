
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

const AuthConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmAuth = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const token = searchParams.get('token');
        const type = searchParams.get('type') || 'signup';
        const email = searchParams.get('email');
        const redirect_to = searchParams.get('redirect_to') || '/dashboard';

        console.log('Auth confirmation parameters:', { 
          token_hash: token_hash ? 'present' : 'missing',
          token: token ? 'present' : 'missing',
          type, 
          email,
          redirect_to 
        });

        let result;

        if (token_hash && type) {
          // Modern token_hash method (preferred)
          console.log('Using token_hash verification method');
          result = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          });
        } else if (token && email) {
          // Legacy token method with email
          console.log('Using legacy token verification method');
          result = await supabase.auth.verifyOtp({
            email,
            token,
            type: type as any
          });
        } else if (token && type === 'signup') {
          // Try token without email for signup
          console.log('Using token verification without email');
          result = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });
        } else {
          // Check if user is already authenticated
          console.log('No valid tokens found, checking current session...');
          const { data: session } = await supabase.auth.getSession();
          if (session.session) {
            console.log('User already has active session');
            setStatus('success');
            setMessage('Tu cuenta ya está activada. Redirigiendo...');
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 2000);
            return;
          }
          throw new Error('No se encontró un token de confirmación válido. Verifica que hayas usado el enlace completo del email.');
        }

        if (result.error) {
          console.error('Verification error:', result.error);
          throw result.error;
        }

        console.log('Auth confirmation successful:', result);

        setStatus('success');
        
        if (type === 'signup') {
          setMessage('¡Tu cuenta ha sido confirmada exitosamente! Ya puedes usar TarjetaApp.');
          toast.success('Cuenta confirmada correctamente');
        } else if (type === 'recovery') {
          setMessage('Email confirmado. Ya puedes establecer tu nueva contraseña.');
          toast.success('Email confirmado');
        } else if (type === 'email_change') {
          setMessage('Tu nueva dirección de email ha sido confirmada.');
          toast.success('Email actualizado');
        }

        // Redirect after a short delay
        setTimeout(() => {
          navigate(redirect_to, { replace: true });
        }, 3000);

      } catch (error: any) {
        console.error('Error confirming auth:', error);
        setStatus('error');
        
        let errorMessage = 'Ha ocurrido un error al confirmar tu cuenta';
        
        if (error.message?.includes('Token has expired') || error.message?.includes('expired')) {
          errorMessage = 'El enlace de confirmación ha expirado. Por favor, solicita un nuevo enlace de confirmación.';
        } else if (error.message?.includes('Invalid token') || error.message?.includes('invalid')) {
          errorMessage = 'El enlace de confirmación no es válido. Verifica que hayas copiado la URL completa del email.';
        } else if (error.message?.includes('User not found')) {
          errorMessage = 'No se encontró el usuario. Por favor, regístrate nuevamente.';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'El email no pudo ser confirmado. Intenta con el enlace del email nuevamente.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setMessage(errorMessage);
        toast.error('Error al confirmar la cuenta');
      }
    };

    confirmAuth();
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Confirmando tu cuenta...';
      case 'success':
        return '¡Confirmación exitosa!';
      case 'error':
        return 'Error en la confirmación';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>
          
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Serás redirigido automáticamente en unos segundos...
              </p>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Ir al dashboard
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 text-blue-700 mb-2">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">¿No recibiste el email?</span>
                </div>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Revisa tu carpeta de spam o correo no deseado</li>
                  <li>• Verifica que la dirección de email sea correcta</li>
                  <li>• El email puede tardar unos minutos en llegar</li>
                  <li>• Intenta registrarte nuevamente si el problema persiste</li>
                </ul>
              </div>
              
              <Button onClick={() => navigate('/auth')} className="w-full">
                Volver al login
              </Button>
              <Button variant="outline" onClick={() => navigate('/landing')} className="w-full">
                Ir al inicio
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthConfirm;
