import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { useListTenants, useCreateTenant, useUpdateTenant, useDeleteTenant, getListTenantsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Tenants() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: tenants, isLoading } = useListTenants();
  
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const deleteTenant = useDeleteTenant();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", phone: "", nidNumber: "", address: "", email: "", notes: ""
  });

  const filteredTenants = tenants?.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.phone.includes(search) || 
    (t.nidNumber && t.nidNumber.includes(search))
  ) || [];

  const handleOpenDialog = (tenant?: any) => {
    if (tenant) {
      setEditingId(tenant.id);
      setFormData({
        name: tenant.name,
        phone: tenant.phone,
        nidNumber: tenant.nidNumber || "",
        address: tenant.address || "",
        email: tenant.email || "",
        notes: tenant.notes || "",
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", phone: "", nidNumber: "", address: "", email: "", notes: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTenant.mutate({ id: editingId, data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTenantsQueryKey() });
          setIsDialogOpen(false);
          toast({ title: "Updated successfully" });
        }
      });
    } else {
      createTenant.mutate({ data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTenantsQueryKey() });
          setIsDialogOpen(false);
          toast({ title: "Created successfully" });
        }
      });
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure?")) {
      deleteTenant.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTenantsQueryKey() });
          toast({ title: "Deleted successfully" });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("nav.tenants")}</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          {t("action.addTenant")}
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground absolute ml-3" />
        <Input 
          placeholder={typeof t("generic.search") === "string" ? t("generic.search") as string : "Search..."} 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-md bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("field.name")}</TableHead>
              <TableHead>{t("field.phone")}</TableHead>
              <TableHead>{t("field.nid")}</TableHead>
              <TableHead>{t("field.address")}</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">{t("generic.loading")}</TableCell></TableRow>
            ) : filteredTenants.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">{t("generic.noData")}</TableCell></TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TableRow key={tenant.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenDialog(tenant)}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>{tenant.phone}</TableCell>
                  <TableCell>{tenant.nidNumber || "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{tenant.address || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={(e) => handleDelete(tenant.id, e)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? t("action.edit") : t("action.addTenant")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("field.name")}</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("field.phone")}</Label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("field.nid")}</Label>
                  <Input value={formData.nidNumber} onChange={e => setFormData({...formData, nidNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>{t("field.email")}</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("field.address")}</Label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t("field.notes")}</Label>
                <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t("action.cancel")}</Button>
              <Button type="submit" disabled={createTenant.isPending || updateTenant.isPending}>{t("action.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
