import { useTransactions } from "@/hooks/use-transactions";
import { CreateTransactionDialog } from "@/components/CreateTransactionDialog";
import { formatCurrency } from "@/lib/interest-utils";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format } from "date-fns";

export default function Transactions() {
  const { data: transactions, isLoading } = useTransactions();

  if (isLoading) {
    return <TransactionsSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">Track loans given and taken.</p>
        </div>
        <CreateTransactionDialog />
      </div>

      <div className="space-y-4">
        {transactions?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <p>No transactions yet.</p>
            <p className="text-sm">Create your first loan record to get started.</p>
          </div>
        ) : (
          transactions?.map((tx) => (
            <Link key={tx.id} href={`/transactions/${tx.id}`}>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group border-l-4" style={{ borderLeftColor: tx.type === 'GIVEN' ? '#10b981' : '#f43f5e' }}>
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${tx.type === 'GIVEN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {tx.type === 'GIVEN' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{tx.contact?.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(tx.startDate), "MMM d, yyyy")}</span>
                        <span>•</span>
                        <span>{tx.interestRate}% Interest</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="font-mono font-bold text-lg">{formatCurrency(Number(tx.amount))}</div>
                    <div className="flex items-center gap-2 mt-1 sm:justify-end">
                      <Badge variant={tx.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{tx.interestType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
