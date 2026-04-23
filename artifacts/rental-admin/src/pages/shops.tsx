import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { 
  useListShops, 
  useCreateShop, 
  useUpdateShop, 
  useDeleteShop, 
  useAssignTenantToShop,
  useListTenants,
  getListShopsQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, UserPlus, MapPin, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Shops() {
  const { t, formatBDT } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: shops, isLoading } = useListShops();
  const { data: tenants } = useListTenants();
  
  const createShop = useCreateShop();
  const updateShop = useUpdateShop();
  const deleteShop = useDeleteShop();
  const assignTenant = useAssignTenantToShop();

  const [isShopDialogOpen, setIsShopDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [shopForm, setShopForm] = useState({
    code: "", location: "", sizeSqft: "", monthlyRent: "", depositAmount: "", notes: ""
  });
  
  const [assignForm, setAssignForm] = useState({
    shopId: "", tenantId: "", leaseStart: new Date().toISOString().split('T')[0]
  });

  const handleOpenShopDialog = (shop?: any) => {
    if (shop) {
      setEditingId(shop.id);
      setShopForm({
        code: shop.code,
        location: shop.location,
        sizeSqft: shop.sizeSqft?.toString() || "",
        monthlyRent: shop.monthlyRent.toString(),
        depositAmount: shop.depositAmount?.toString() || "",
        notes: shop.notes || "",
      });
    } else {
      setEditingId(null);
      setShopForm({ code: "", location: "", sizeSqft: "", monthlyRent: "", depositAmount: "", notes: "" });
    }
    setIsShopDialogOpen(true);
  };

  const handleShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      code: shopForm.code,
      location: shopForm.location,
      sizeSqft: shopForm.sizeSqft ? Number(shopForm.sizeSqft) : undefined,
      monthlyRent: Number(shopForm.monthlyRent),
      depositAmount: shopForm.depositAmount ? Number(shopForm.depositAmount) : undefined,
      notes: shopForm.notes,
    };

    if (editingId) {
      updateShop.mutate({ id: editingId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListShopsQueryKey() });
          setIsShopDialogOpen(false);
          toast({ title: "Updated successfully" });
        }
      });
    } else {
      createShop.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListShopsQueryKey() });
          setIsShopDialogOpen(false);
          toast({ title: "Created successfully" });
        }
      });
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignTenant.mutate({ 
      id: assignForm.shopId, 
      data: { tenantId: assignForm.tenantId || null, leaseStart: assignForm.leaseStart } 
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListShopsQueryKey() });
        setIsAssignDialogOpen(false);
        toast({ title: "Tenant assigned successfully" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("nav.shops")}</h1>
        <Button onClick={() => handleOpenShopDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          {t("action.addShop")}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">{t("generic.loading")}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shops?.map((shop) => (
            <Card key={shop.id} className="flex flex-col border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl">{shop.code}</CardTitle>
                  <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                    <MapPin className="w-3 h-3" /> {shop.location}
                  </div>
                </div>
                <Badge variant={shop.status === "occupied" ? "default" : "secondary"} className="font-normal capitalize">
                  {shop.status === "occupied" ? t("status.occupied") : t("status.vacant")}
                </Badge>
              </CardHeader>
              <CardContent className="pb-3 flex-1 text-sm space-y-2">
                <div className="flex justify-between items-center bg-muted/50 p-2 rounded">
                  <span className="text-muted-foreground">{t("field.rent")}</span>
                  <span className="font-bold text-primary">{formatBDT(shop.monthlyRent)}</span>
                </div>
                
                {shop.sizeSqft && (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Square className="w-3 h-3" /> {shop.sizeSqft} sqft
                  </div>
                )}
                
                <div className="pt-2 mt-2 border-t border-border/50">
                  {shop.status === "occupied" ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Current Tenant</p>
                      <p className="font-medium truncate">{shop.tenantName}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No tenant assigned</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex gap-2 border-t border-border/50 pt-3 mt-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => {
                    setAssignForm({ shopId: shop.id, tenantId: shop.tenantId || "", leaseStart: shop.leaseStart?.split('T')[0] || new Date().toISOString().split('T')[0] });
                    setIsAssignDialogOpen(true);
                  }}
                >
                  <UserPlus className="w-3 h-3 mr-2" />
                  {t("action.assignTenant")}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleOpenShopDialog(shop)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Shop Form Dialog */}
      <Dialog open={isShopDialogOpen} onOpenChange={setIsShopDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleShopSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? t("action.edit") : t("action.addShop")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("field.shopCode")}</Label>
                  <Input value={shopForm.code} onChange={e => setShopForm({...shopForm, code: e.target.value})} required placeholder="e.g. A-12" />
                </div>
                <div className="space-y-2">
                  <Label>{t("field.location")}</Label>
                  <Input value={shopForm.location} onChange={e => setShopForm({...shopForm, location: e.target.value})} required placeholder="e.g. Ground Floor" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("field.rent")} (BDT)</Label>
                  <Input type="number" value={shopForm.monthlyRent} onChange={e => setShopForm({...shopForm, monthlyRent: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("field.size")}</Label>
                  <Input type="number" value={shopForm.sizeSqft} onChange={e => setShopForm({...shopForm, sizeSqft: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("field.deposit")} (BDT)</Label>
                <Input type="number" value={shopForm.depositAmount} onChange={e => setShopForm({...shopForm, depositAmount: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsShopDialogOpen(false)}>{t("action.cancel")}</Button>
              <Button type="submit">{t("action.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Tenant Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAssignSubmit}>
            <DialogHeader>
              <DialogTitle>{t("action.assignTenant")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>{t("nav.tenants")}</Label>
                <Select value={assignForm.tenantId} onValueChange={(val) => setAssignForm({...assignForm, tenantId: val === "none" ? "" : val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Unassign (Vacant) --</SelectItem>
                    {tenants?.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name} ({t.phone})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lease Start Date</Label>
                <Input type="date" value={assignForm.leaseStart} onChange={e => setAssignForm({...assignForm, leaseStart: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>{t("action.cancel")}</Button>
              <Button type="submit">{t("action.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
