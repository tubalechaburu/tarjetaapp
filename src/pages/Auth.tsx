
import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthContext";
import { ArrowLeft } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { AuthFormValues } from "@/types";

const Auth = () => {
  const { signIn, signUp, resetPassword, user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [forgotPassword, setForgotPassword] = useState(false);

  console.log("Auth page - user:", user, "isLoading:", isLoading);

  // Si el usuario ya está autenticado, redirigir al dashboard
  if (user && !isLoading) {
    console.log("User authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  const handleLoginSubmit = async (data: AuthFormValues) => {
    console.log("Attempting login with:", data.email);
    try {
      await signIn(data.email, data.password);
      console.log("Login successful");
      // La redirección se maneja automáticamente arriba cuando user cambia
    } catch (error) {
      console.error("Login failed:", error);
      // El error se maneja en el componente LoginForm
    }
  };

  const handleRegisterSubmit = async (data: AuthFormValues) => {
    console.log("Attempting register with:", data.email);
    try {
      await signUp(data.email, data.password, {
        full_name: data.fullName
      });
      // Cambiar a tab de login después del registro exitoso
      setActiveTab("login");
    } catch (error) {
      console.error("Registration failed:", error);
      // El error se maneja en el componente RegisterForm
    }
  };

  const handleForgotPasswordSubmit = async (email: string) => {
    console.log("Sending password reset to:", email);
    try {
      await resetPassword(email);
      setForgotPassword(false);
      setActiveTab("login");
    } catch (error) {
      console.error("Password reset failed:", error);
    }
  };

  // Mostrar loading mientras se verifica autenticación
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center py-20">
          <p className="text-lg">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Link to="/landing">
        <Button variant="ghost" className="mb-4 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </Link>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {forgotPassword ? "Recuperar contraseña" : "Acceso a tu cuenta"}
          </CardTitle>
          <CardDescription className="text-center">
            {forgotPassword 
              ? "Introduce tu correo electrónico para recuperar tu contraseña" 
              : activeTab === "login" 
                ? "Ingresa tus credenciales para acceder" 
                : "Crea una nueva cuenta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forgotPassword ? (
            <ForgotPasswordForm 
              onSubmit={handleForgotPasswordSubmit}
              onCancel={() => setForgotPassword(false)}
            />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm 
                  onSubmit={handleLoginSubmit}
                  onForgotPassword={() => setForgotPassword(true)}
                />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm 
                  onSubmit={handleRegisterSubmit}
                  onSuccess={() => setActiveTab("login")}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
