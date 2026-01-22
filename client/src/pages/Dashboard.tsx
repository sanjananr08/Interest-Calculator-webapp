import { useDashboardStats } from "@/hooks/use-dashboard";
import { StatCard } from "@/components/StatCard";
import { formatCurrency } from "@/lib/interest-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const chartData = [
    { name: 'Given', value: Number(stats?.totalGiven) || 0, color: '#10b981' }, // Emerald-500
    { name: 'Taken', value: Number(stats?.totalTaken) || 0, color: '#f43f5e' }, // Rose-500
  ];

  const totalInterest = (Number(stats?.totalInterestGiven) || 0) + (Number(stats?.totalInterestTaken) || 0);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your finances.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <StatCard
            title="Total Given"
            value={formatCurrency(Number(stats?.totalGiven) || 0)}
            type="given"
            description="Money you lent out"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Total Taken"
            value={formatCurrency(Number(stats?.totalTaken) || 0)}
            type="taken"
            description="Money you borrowed"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Net Interest"
            value={formatCurrency(totalInterest)}
            type="interest"
            description="Interest accumulated"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Pending Actions"
            value={String(stats?.pendingTransactions || 0)}
            type="neutral"
            description="Active transactions"
          />
        </motion.div>
      </div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {chartData.every(d => d.value === 0) ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data to display
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for Recent Activity or other widgets */}
        <Card className="col-span-1 shadow-sm flex items-center justify-center bg-muted/20 border-dashed">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">More analytics coming soon...</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-[350px] rounded-xl" />
        <Skeleton className="h-[350px] rounded-xl" />
      </div>
    </div>
  );
}
