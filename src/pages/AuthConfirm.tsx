
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
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
        const redirect_to = searchParams.get('redirect_to') || '/dashboard';

        console.log('Confirming auth with:', { token_hash, token, type, redirect_to });

        let result;

        if (token_hash && type) {
          // Use token_hash for newer email confirmations
          console.log('Using token_hash verification method');
          result = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          });
        } else if (token) {
          // Use token for older email confirmations
          console.log('Using token verification method');
          const email = searchParams.get('email');
          if (!email) {
            throw new Error('Email requerido para verificación con token');
          }
          result = await supabase.auth.verifyOtp({
            email,
            token,
            type: type as any
          });
        } else {
          // Try to handle the confirmation automatically if no explicit tokens
          console.log('No tokens found, checking current session...');
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
          throw new Error('No hay token de confirmación válido');
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
        
        if (error.message?.includes('Token has expired')) {
          errorMessage = 'El enlace de confirmación ha expirado. Por favor, solicita un nuevo enlace de confirmación.';
        } else if (error.message?.includes('Invalid token')) {
          errorMessage = 'El enlace de confirmación no es válido. Verifica que hayas copiado la URL completa.';
        } else if (error.message?.includes('User not found')) {
          errorMessage = 'No se encontró el usuario. Por favor, regístrate nuevamente.';
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
