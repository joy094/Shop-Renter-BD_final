import React from "react";
import { useLanguage } from "@/lib/i18n";
import { 
  useGetMonthlyCollection, 
  useGetShopOccupancy, 
  useGetTopTenants 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell,
  BarChart, Bar
} from "recharts";

export default function Reports() {
  const { t, formatBDT, formatMonth } = useLanguage();

  const { data: monthlyCollection, isLoading: isLoadingCollection } = useGetMonthlyCollection();
  const { data: occupancy, isLoading: isLoadingOccupancy } = useGetShopOccupancy();
  const { data: topTenants, isLoading: isLoadingTopTenants } = useGetTopTenants();

  const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-3))'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("nav.reports")}</h1>
      </div>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>{t("dash.collectionChart")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {isLoadingCollection ? (
              <div className="h-full flex items-center justify-center animate-pulse">{t("generic.loading")}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyCollection || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(val) => {
                      const [y, m] = val.split('-');
                      return `${m}/${y.substring(2)}`;
                    }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(val) => `৳${val/1000}k`}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatBDT(value)}
                    labelFormatter={(label) => formatMonth(label)}
                  />
                  <Area type="monotone" dataKey="expected" name="Expected" stroke="hsl(var(--chart-2))" fill="url(#colorExpected)" />
                  <Area type="monotone" dataKey="collected" name="Collected" stroke="hsl(var(--chart-1))" fill="url(#colorCollected)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.occupancyChart")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill={PIE_COLORS[0]} />
                      <Cell fill={PIE_COLORS[1]} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Tenants (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoadingTopTenants ? (
                <div className="h-full flex items-center justify-center animate-pulse">{t("generic.loading")}</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topTenants || []} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tickFormatter={(val) => `৳${val/1000}k`} />
                    <YAxis type="category" dataKey="tenantName" width={100} tick={{fontSize: 12}} />
                    <Tooltip formatter={(value: number) => formatBDT(value)} />
                    <Bar dataKey="totalPaid" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
