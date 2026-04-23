import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: session, isLoading } = useGetMe();

  useEffect(() => {
    if (!isLoading && (!session || !session.authenticated) && location !== "/login") {
      setLocation("/login");
    }
  }, [session, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-bengali">লোড হচ্ছে... / Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.authenticated && location !== "/login") {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
