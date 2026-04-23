import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Store, Receipt, BarChart3, Settings, Menu, LogOut, Moon, Sun } from "lucide-react";
import { useLanguage, LanguageMode } from "@/lib/i18n";
import { useLogout, useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "nav.dashboard" as const },
  { href: "/tenants", icon: Users, label: "nav.tenants" as const },
  { href: "/shops", icon: Store, label: "nav.shops" as const },
  { href: "/payments", icon: Receipt, label: "nav.payments" as const },
  { href: "/reports", icon: BarChart3, label: "nav.reports" as const },
  { href: "/settings", icon: Settings, label: "nav.settings" as const },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { t, mode, setMode } = useLanguage();
  const logout = useLogout();
  const { data: session } = useGetMe();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const businessName = localStorage.getItem("businessName") || "Dokan Bhara";

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/login"),
    });
  };

  const NavLinks = () => (
    <div className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{t(item.label)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Store className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg text-foreground truncate">{businessName}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="w-8 h-8 bg-primary/10">
              <AvatarFallback className="text-primary">{session?.user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{session?.user?.name || "Admin"}</span>
              <span className="text-xs text-muted-foreground truncate">{session?.user?.username}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="h-16 flex items-center px-6 border-b border-border">
                  <Store className="w-6 h-6 text-primary mr-2" />
                  <span className="font-bold text-lg text-foreground truncate">{businessName}</span>
                </div>
                <div className="p-4">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="md:hidden font-bold text-lg truncate">{businessName}</div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {mode === "en" ? "EN" : mode === "bn" ? "বাংলা" : "EN / বা"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setMode("en")}>English Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("bn")}>বাংলা</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("both")}>English + বাংলা</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full md:hidden">
                  <Avatar className="w-8 h-8 bg-primary/10">
                    <AvatarFallback className="text-primary">{session?.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{session?.user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.signout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" className="hidden md:flex text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t("nav.signout")}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
