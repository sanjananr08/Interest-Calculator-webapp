import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, DollarSign, Activity } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  type: "given" | "taken" | "interest" | "neutral";
  description?: string;
}

export function StatCard({ title, value, type, description }: StatCardProps) {
  const styles = {
    given: {
      icon: ArrowUpRight,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-200",
    },
    taken: {
      icon: ArrowDownLeft,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-200",
    },
    interest: {
      icon: Activity,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    neutral: {
      icon: DollarSign,
      color: "text-slate-500",
      bg: "bg-slate-100",
      border: "border-slate-200",
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <Card className={`overflow-hidden border transition-all hover:shadow-md ${style.border}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold font-display mt-2">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${style.bg} ${style.color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
