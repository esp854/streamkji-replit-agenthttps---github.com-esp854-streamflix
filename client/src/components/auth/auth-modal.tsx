import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  onLoginSuccess?: (redirectUrl?: string) => void;
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login", onLoginSuccess }: AuthModalProps) {
  const [currentTab, setCurrentTab] = useState<"login" | "register">(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté !",
      });
      onClose();
      loginForm.reset();
      
      // Handle redirect after successful login
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      
      if (onLoginSuccess) {
        onLoginSuccess(redirect || undefined);
      } else if (redirect) {
        window.location.href = redirect;
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register(data.username, data.email, data.password, data.confirmPassword);
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès !",
      });
      onClose();
      registerForm.reset();
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    loginForm.reset();
    registerForm.reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
    setCurrentTab("login");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-4 sm:mx-auto" aria-describedby="auth-dialog-description">
        <DialogHeader className="space-y-3 sm:space-y-4">
          <DialogTitle id="auth-dialog-title" className="text-center text-xl sm:text-2xl font-bold">
            Bienvenue sur StreamFlix
          </DialogTitle>
          <DialogDescription id="auth-dialog-description" className="text-center text-sm sm:text-base">
            {currentTab === "login"
              ? "Connectez-vous pour accéder à vos préférences"
              : "Créez votre compte pour personnaliser votre expérience"}
          </DialogDescription>
        </DialogHeader>
        
        {/* Subscription notice for login */}
        {currentTab === "login" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800">
            <p className="font-medium text-xs sm:text-sm">Accès premium requis</p>
            <p className="hidden sm:block">Vous devez être connecté pour vous abonner à un plan et accéder au contenu premium.</p>
            <p className="sm:hidden">Connexion requise pour l'abonnement premium.</p>
          </div>
        )}

        {/* Subscription notice for registration */}
        {currentTab === "register" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-green-800">
            <p className="font-medium text-xs sm:text-sm">Étapes d'abonnement :</p>
            <div className="hidden sm:block">
              <p>1. Créez votre compte</p>
              <p>2. Connectez-vous</p>
              <p>3. Choisissez un plan d'abonnement</p>
              <p>4. Procédez au paiement sécurisé</p>
            </div>
            <p className="sm:hidden">1. Créer compte → 2. Se connecter → 3. Choisir plan → 4. Payer</p>
          </div>
        )}

        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
            <TabsTrigger value="login" className="text-sm sm:text-base">Connexion</TabsTrigger>
            <TabsTrigger value="register" className="text-sm sm:text-base">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="votre@email.com"
                            className="pl-10 h-10 sm:h-11 text-base"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            className="pl-10 pr-10" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="register" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3 sm:space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'utilisateur</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Votre nom d'utilisateur" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="votre@email.com" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            className="pl-10 pr-10" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            className="pl-10 pr-10" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Inscription..." : "S'inscrire"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
          {currentTab === "login" ? (
            <>
              Pas encore de compte ?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal text-xs sm:text-sm"
                onClick={() => setCurrentTab("register")}
              >
                Inscrivez-vous
              </Button>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal text-xs sm:text-sm"
                onClick={() => setCurrentTab("login")}
              >
                Connectez-vous
              </Button>
            </>
          )}
        </div>

        {/* Subscription notice */}
        <div className="text-center text-xs text-muted-foreground mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-muted">
          <p className="hidden sm:block">
            ℹ️ Après la création de votre compte, vous pourrez vous abonner à un plan pour accéder au contenu premium.
          </p>
          <p className="sm:hidden">
            ℹ️ Abonnement disponible après inscription.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}