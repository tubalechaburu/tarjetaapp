
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
        const redirect_to = searchParams.get('redirect_to') || '/';

        console.log('Confirming auth with:', { token_hash, token, type, redirect_to });

        let result;

        if (token_hash) {
          // Use token_hash for newer email confirmations
          result = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          });
        } else if (token) {
          // Use token for older email confirmations
          result = await supabase.auth.verifyOtp({
            token,
            type: type as any
          });
        } else {
          throw new Error('No hay token de confirmación válido');
        }

        if (result.error) {
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
        setMessage(error.message || 'Ha ocurrido un error al confirmar tu cuenta');
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
              <Button onClick={() => navigate('/')} className="w-full">
                Ir a la aplicación
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button onClick={() => navigate('/auth')} className="w-full">
                Volver al login
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
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
