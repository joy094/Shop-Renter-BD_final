import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { t, mode, setMode } = useLanguage();
  
  const [businessName, setBusinessName] = useState(() => {
    return localStorage.getItem("businessName") || "Dokan Bhara";
  });

  const handleSave = () => {
    localStorage.setItem("businessName", businessName);
    window.location.reload(); // Refresh to update header
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("nav.settings")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("nav.settings")}</CardTitle>
          <CardDescription>Configure application preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-3">
            <Label>{t("settings.language")}</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                type="button" 
                variant={mode === "en" ? "default" : "outline"} 
                onClick={() => setMode("en")}
                className="justify-start h-auto py-3 px-4"
              >
                <div>
                  <div className="font-semibold text-left">English</div>
                  <div className="text-xs opacity-80 text-left font-normal">English only mode</div>
                </div>
              </Button>
              <Button 
                type="button" 
                variant={mode === "bn" ? "default" : "outline"} 
                onClick={() => setMode("bn")}
                className="justify-start h-auto py-3 px-4"
              >
                <div>
                  <div className="font-semibold text-left font-bengali">বাংলা</div>
                  <div className="text-xs opacity-80 text-left font-normal font-bengali">শুধুমাত্র বাংলা</div>
                </div>
              </Button>
              <Button 
                type="button" 
                variant={mode === "both" ? "default" : "outline"} 
                onClick={() => setMode("both")}
                className="justify-start h-auto py-3 px-4"
              >
                <div>
                  <div className="font-semibold text-left">Bilingual</div>
                  <div className="text-xs opacity-80 text-left font-normal font-bengali">বাংলা + English</div>
                </div>
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="space-y-1">
              <Label htmlFor="businessName">{t("settings.businessName")}</Label>
              <p className="text-sm text-muted-foreground">{t("settings.businessNameDesc")}</p>
            </div>
            <div className="flex gap-3">
              <Input 
                id="businessName" 
                value={businessName} 
                onChange={(e) => setBusinessName(e.target.value)} 
                className="max-w-md"
              />
              <Button onClick={handleSave}>{t("action.save")}</Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
