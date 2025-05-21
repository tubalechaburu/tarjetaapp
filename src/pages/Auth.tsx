
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

interface AuthFormValues {
  email: string;
  password: string;
  fullName?: string;
  acceptTerms?: boolean;
  rememberMe?: boolean;
}

const Auth = () => {
  const { signIn, signUp, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("login");
  const [forgotPassword, setForgotPassword] = useState(false);

  const loginForm = useForm<AuthFormValues>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  const registerForm = useForm<AuthFormValues>({
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      acceptTerms: false
    }
  });

  const forgotPasswordForm = useForm<Pick<AuthFormValues, "email">>({
    defaultValues: {
      email: ""
    }
  });

  // Si el usuario ya está autenticado, redirigir a la página principal
  if (user && !isLoading) {
    return <Navigate to="/" />;
  }

  const handleLoginSubmit = async (data: AuthFormValues) => {
    try {
      await signIn(data.email, data.password);
      navigate("/");
    } catch (error) {
      console.error("Error en login:", error);
    }
  };

  const handleRegisterSubmit = async (data: AuthFormValues) => {
    if (!data.acceptTerms) {
      registerForm.setError("acceptTerms", {
        type: "manual",
        message: "Debes aceptar los términos y condiciones"
      });
      return;
    }

    try {
      await signUp(data.email, data.password, {
        full_name: data.fullName
      });
      setActiveTab("login");
    } catch (error) {
      console.error("Error en registro:", error);
    }
  };

  const handleForgotPasswordSubmit = async (data: Pick<AuthFormValues, "email">) => {
    try {
      // Aquí iría la lógica para enviar el correo de recuperación
      console.log("Enviar recuperación a:", data.email);
      setForgotPassword(false);
      setActiveTab("login");
    } catch (error) {
      console.error("Error al solicitar recuperación:", error);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Link to="/">
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
            <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...forgotPasswordForm.register("email", {
                    required: "El correo electrónico es obligatorio",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Dirección de correo inválida"
                    }
                  })}
                />
                {forgotPasswordForm.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {forgotPasswordForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <Button type="submit" disabled={forgotPasswordForm.formState.isSubmitting}>
                  {forgotPasswordForm.formState.isSubmitting 
                    ? "Enviando..." 
                    : "Enviar instrucciones"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setForgotPassword(false)}
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            </form>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo electrónico</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      {...loginForm.register("email", {
                        required: "El correo electrónico es obligatorio",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Dirección de correo inválida"
                        }
                      })}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <Button 
                        type="button"
                        variant="link" 
                        className="p-0 h-auto text-xs"
                        onClick={() => setForgotPassword(true)}
                      >
                        ¿Olvidaste tu contraseña?
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...loginForm.register("password", {
                          required: "La contraseña es obligatoria",
                          minLength: {
                            value: 6,
                            message: "La contraseña debe tener al menos 6 caracteres"
                          }
                        })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      {...loginForm.register("rememberMe")} 
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Recordar en este dispositivo
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginForm.formState.isSubmitting}
                  >
                    {loginForm.formState.isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nombre completo</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Tu nombre"
                      {...registerForm.register("fullName", {
                        required: "El nombre es obligatorio"
                      })}
                    />
                    {registerForm.formState.errors.fullName && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo electrónico</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      {...registerForm.register("email", {
                        required: "El correo electrónico es obligatorio",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Dirección de correo inválida"
                        }
                      })}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...registerForm.register("password", {
                          required: "La contraseña es obligatoria",
                          minLength: {
                            value: 6,
                            message: "La contraseña debe tener al menos 6 caracteres"
                          }
                        })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      {...registerForm.register("acceptTerms")}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Acepto los{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        términos y condiciones
                      </Link>
                      {" "}y la{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        política de privacidad
                      </Link>
                    </label>
                  </div>
                  {registerForm.formState.errors.acceptTerms && (
                    <p className="text-sm text-red-500">
                      {registerForm.formState.errors.acceptTerms.message}
                    </p>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={registerForm.formState.isSubmitting}
                  >
                    {registerForm.formState.isSubmitting ? "Registrando..." : "Registrarse"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
