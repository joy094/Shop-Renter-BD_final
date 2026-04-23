import React, { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Store, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const login = useLogin();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { data: { username, password } },
      {
        onSuccess: (res) => {
          if (res.authenticated) {
            setLocation("/");
          } else {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: "Invalid credentials",
            });
          }
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: (err as { error?: string })?.error || "An error occurred",
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <Card className="w-full max-w-md shadow-xl border-border relative z-10">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-2">
            <Store className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">
            {t("auth.title")}
          </CardTitle>
          <CardDescription className="text-base">
            {t("auth.subtitle")}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("auth.username")}</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium" 
              disabled={login.isPending}
            >
              {login.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              {t("auth.login")}
            </Button>
            
            <div className="text-sm text-center text-muted-foreground bg-muted p-3 rounded-md w-full">
              Demo credentials: <strong>admin</strong> / <strong>admin123</strong>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
