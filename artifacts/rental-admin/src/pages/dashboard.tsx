import React from "react";
import { 
  useGetDashboardSummary, 
  useGetRecentPayments, 
  useGetDueReminders, 
  useGetMonthlyCollection, 
  useGetShopOccupancy 
} from "@workspace/api-client-react";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, Users, Wallet, AlertCircle, Phone, ArrowUpRight, TrendingUp } from "lucide-react";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

export default function Dashboard() {
  const { t, formatBDT, formatMonth } = useLanguage();
  
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: recentPayments, isLoading: isLoadingRecent } = useGetRecentPayments();
  const { data: dueReminders, isLoading: isLoadingDue } = useGetDueReminders();
  const { data: monthlyCollection, isLoading: isLoadingCollection } = useGetMonthlyCollection();
  const { data: occupancy, isLoading: isLoadingOccupancy } = useGetShopOccupancy();

  if (isLoadingSummary) {
    return <div className="flex items-center justify-center h-full p-8"><span className="animate-pulse">{t("generic.loading")}</span></div>;
  }

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-3))'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("nav.dashboard")}</h1>
        {summary && <p className="text-muted-foreground">{formatMonth(summary.currentMonth)}</p>}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t("dash.kpi.shops")}</CardTitle>
            <Store className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalShops || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.occupiedShops || 0} occupied, {summary?.vacantShops || 0} vacant
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t("dash.kpi.tenants")}</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalTenants || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t("dash.kpi.collected")}</CardTitle>
            <Wallet className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatBDT(summary?.collectedThisMonth || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {formatBDT(summary?.expectedThisMonth || 0)} expected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t("dash.kpi.outstanding")}</CardTitle>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatBDT(summary?.outstandingThisMonth || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              from {summary?.unpaidCount || 0} unpaid invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("dash.collectionChart")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoadingCollection ? (
                  <div className="h-full flex items-center justify-center animate-pulse">{t("generic.loading")}</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyCollection || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(val) => {
                          const [y, m] = val.split('-');
                          return `${m}/${y.substring(2)}`;
                        }}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tickFormatter={(val) => `৳${val/1000}k`}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatBDT(value)}
                        labelFormatter={(label) => formatMonth(label)}
                      />
                      <Area type="monotone" dataKey="collected" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorCollected)" />
                      <Area type="monotone" dataKey="expected" stroke="hsl(var(--chart-2))" fill="none" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dash.recentPayments")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRecent ? (
                <div className="animate-pulse">{t("generic.loading")}</div>
              ) : recentPayments && recentPayments.length > 0 ? (
                <div className="space-y-4">
                  {recentPayments.map(payment => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {payment.shopCode}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{payment.tenantName}</p>
                          <p className="text-xs text-muted-foreground">{formatMonth(payment.month)} • {payment.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">+{formatBDT(payment.amountPaid)}</p>
                        {payment.paidOn && <p className="text-xs text-muted-foreground">{format(new Date(payment.paidOn), "MMM d, yyyy")}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">{t("generic.noData")}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("dash.occupancyChart")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {isLoadingOccupancy ? (
                  <div className="h-full flex items-center justify-center animate-pulse">{t("generic.loading")}</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Occupied', value: occupancy?.occupied || 0 },
                          { name: 'Vacant', value: occupancy?.vacant || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill={COLORS[0]} />
                        <Cell fill={COLORS[1]} />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                  <span className="text-sm">{t("status.occupied")} ({occupancy?.occupied || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                  <span className="text-sm">{t("status.vacant")} ({occupancy?.vacant || 0})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 shadow-sm">
            <CardHeader className="bg-destructive/5 pb-4">
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {t("dash.dueReminders")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingDue ? (
                <div className="animate-pulse">{t("generic.loading")}</div>
              ) : dueReminders && dueReminders.length > 0 ? (
                <div className="space-y-3">
                  {dueReminders.map(reminder => (
                    <div key={reminder.paymentId} className="flex flex-col p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-sm">{reminder.shopCode} • {reminder.tenantName}</p>
                          <p className="text-xs text-muted-foreground">{formatMonth(reminder.month)} • {reminder.daysOverdue} {t("field.daysOverdue")}</p>
                        </div>
                        <p className="font-bold text-destructive">{formatBDT(reminder.amountDue - reminder.amountPaid)}</p>
                      </div>
                      <a href={`tel:${reminder.tenantPhone}`} className="flex items-center justify-center gap-2 w-full py-2 bg-background hover:bg-muted border rounded text-sm font-medium transition-colors">
                        <Phone className="w-4 h-4" />
                        {reminder.tenantPhone}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">{t("generic.noData")}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
