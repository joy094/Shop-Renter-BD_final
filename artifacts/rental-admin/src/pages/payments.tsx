import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { 
  useListPayments, 
  useCreatePayment, 
  useUpdatePayment, 
  useDeletePayment, 
  useGenerateMonthlyPayments,
  useListShops,
  getListPaymentsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Calendar, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Payments() {
  const { t, formatBDT, formatMonth } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const currentMonthStr = format(new Date(), "yyyy-MM");
  const [filterMonth, setFilterMonth] = useState(currentMonthStr);
  
  const { data: payments, isLoading } = useListPayments({ month: filterMonth });
  const { data: shops } = useListShops();
  
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();
  const generateInvoices = useGenerateMonthlyPayments();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    shopId: "", month: currentMonthStr, amountDue: "", amountPaid: "0", method: "cash", paidOn: format(new Date(), "yyyy-MM-dd"), note: ""
  });

  const handleShopSelect = (shopId: string) => {
    const shop = shops?.find(s => s.id === shopId);
    if (shop) {
      setFormData(prev => ({
        ...prev,
        shopId,
        amountDue: shop.monthlyRent.toString(),
        amountPaid: shop.monthlyRent.toString(), // Default to full payment
      }));
    }
  };

  const handleOpenDialog = (payment?: any) => {
    if (payment) {
      setEditingId(payment.id);
      setFormData({
        shopId: payment.shopId,
        month: payment.month,
        amountDue: payment.amountDue.toString(),
        amountPaid: payment.amountPaid.toString(),
        method: payment.method || "cash",
        paidOn: payment.paidOn ? payment.paidOn.split('T')[0] : format(new Date(), "yyyy-MM-dd"),
        note: payment.note || ""
      });
    } else {
      setEditingId(null);
      setFormData({ 
        shopId: "", month: filterMonth, amountDue: "", amountPaid: "", method: "cash", paidOn: format(new Date(), "yyyy-MM-dd"), note: "" 
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      shopId: formData.shopId,
      month: formData.month,
      amountDue: Number(formData.amountDue),
      amountPaid: Number(formData.amountPaid),
      method: formData.method as any,
      paidOn: formData.paidOn || undefined,
      note: formData.note
    };

    if (editingId) {
      updatePayment.mutate({ id: editingId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          setIsDialogOpen(false);
          toast({ title: "Payment updated successfully" });
        }
      });
    } else {
      createPayment.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          setIsDialogOpen(false);
          toast({ title: "Payment recorded successfully" });
        }
      });
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure?")) {
      deletePayment.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          toast({ title: "Payment deleted" });
        }
      });
    }
  };

  const handleGenerateInvoices = () => {
    if (confirm(`Generate unpaid invoices for all occupied shops for ${formatMonth(filterMonth)}?`)) {
      generateInvoices.mutate({ data: { month: filterMonth } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
          toast({ title: "Invoices generated successfully" });
        }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20';
      case 'partial': return 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20';
      case 'unpaid': return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("nav.payments")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateInvoices} disabled={generateInvoices.isPending}>
            <FileText className="w-4 h-4 mr-2" />
            {t("action.generateInvoices")}
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            {t("action.recordPayment")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 border rounded-md shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Label className="shrink-0">{t("field.month")}:</Label>
          <Input 
            type="month" 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)} 
            className="w-auto"
          />
        </div>
        <div className="text-sm text-muted-foreground ml-auto">
          {payments && `${payments.length} records found`}
        </div>
      </div>

      <div className="border rounded-md bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("field.shopCode")}</TableHead>
              <TableHead>{t("nav.tenants")}</TableHead>
              <TableHead>{t("field.amountDue")}</TableHead>
              <TableHead>{t("field.amountPaid")}</TableHead>
              <TableHead>{t("field.status")}</TableHead>
              <TableHead>{t("field.date")}</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">{t("generic.loading")}</TableCell></TableRow>
            ) : payments?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">{t("generic.noData")}</TableCell></TableRow>
            ) : (
              payments?.map((payment) => (
                <TableRow key={payment.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenDialog(payment)}>
                  <TableCell className="font-medium">{payment.shopCode}</TableCell>
                  <TableCell>{payment.tenantName}</TableCell>
                  <TableCell>{formatBDT(payment.amountDue)}</TableCell>
                  <TableCell className="font-bold text-primary">{formatBDT(payment.amountPaid)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 capitalize ${getStatusColor(payment.status)}`}>
                      {t(`status.${payment.status}` as any) || payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.paidOn ? format(new Date(payment.paidOn), "dd MMM, yy") : "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={(e) => handleDelete(payment.id, e)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
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
              <DialogTitle>{editingId ? t("action.edit") : t("action.recordPayment")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("field.shopCode")}</Label>
                  <Select value={formData.shopId} onValueChange={handleShopSelect} disabled={!!editingId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Shop" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops?.filter(s => s.status === 'occupied' || s.id === formData.shopId).map(shop => (
                        <SelectItem key={shop.id} value={shop.id}>{shop.code} - {shop.tenantName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("field.month")}</Label>
                  <Input type="month" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} required disabled={!!editingId} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("field.amountDue")}</Label>
                  <Input type="number" value={formData.amountDue} onChange={e => setFormData({...formData, amountDue: e.target.value})} required disabled={!!editingId && formData.amountPaid !== "0"} />
                </div>
                <div className="space-y-2">
                  <Label>{t("field.amountPaid")}</Label>
                  <Input type="number" value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: e.target.value})} required className="font-bold text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("field.paymentMethod")}</Label>
                  <Select value={formData.method} onValueChange={(val) => setFormData({...formData, method: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["cash", "bkash", "nagad", "rocket", "bank", "other"].map(m => (
                        <SelectItem key={m} value={m}>{t(`method.${m}` as any) || m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("field.date")}</Label>
                  <Input type="date" value={formData.paidOn} onChange={e => setFormData({...formData, paidOn: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t("field.notes")}</Label>
                <Input value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Optional note..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t("action.cancel")}</Button>
              <Button type="submit">{t("action.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
