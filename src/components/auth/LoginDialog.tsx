import { useState } from "react";

import { LogIn, LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";

export const LoginDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error.message,
        });
      } else {
        setIsOpen(false);
        setEmail("");
        setPassword("");
      }
    } catch (_error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar fazer login.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (_error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar.",
      });
    }
  };

  // If authenticated, show logout button
  if (isAuthenticated) {
    return (
      <Button
        variant="outline"
        size={isMobile ? "icon" : "sm"}
        className={isMobile ? "h-9 w-9" : "h-9 gap-2 px-3"}
        onClick={() => void handleLogout()}
        title={isMobile ? user?.email?.split("@")[0] || "Usuario" : undefined}
      >
        {isMobile ? (
          <LogOut className="h-4 w-4" />
        ) : (
          <>
            <User className="h-4 w-4" />
            <span className="text-xs font-medium">{user?.email?.split("@")[0] || "Usuario"}</span>
            <LogOut className="h-4 w-4" />
          </>
        )}
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={isMobile ? "icon" : "sm"}
          className={isMobile ? "h-9 w-9" : "h-9 gap-2 px-3"}
          title={isMobile ? "Login" : undefined}
        >
          <LogIn className="h-4 w-4" />
          {!isMobile && <span className="text-xs font-medium">Login</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login Supabase</DialogTitle>
          <DialogDescription>
            Entre com suas credenciais do Supabase para autenticar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => void handleLogin(event)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu-email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
