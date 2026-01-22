import { useTransaction, useSettleTransaction, useDeleteTransaction } from "@/hooks/use-transactions";
import { useDeletePayment } from "@/hooks/use-payments";
import { AddPaymentDialog } from "@/components/AddPaymentDialog";
import { useRoute, useLocation } from "wouter";
import { calculateInterest, formatCurrency } from "@/lib/interest-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2, CheckCircle, Calendar, Percent } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TransactionDetails() {
  const [, params] = useRoute("/transactions/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  
  const { data: transaction, isLoading } = useTransaction(id);
  const { mutate: settle, isPending: isSettling } = useSettleTransaction();
  const { mutate: deleteTx } = useDeleteTransaction();
  const { mutate: deletePayment } = useDeletePayment();

  if (isLoading || !transaction) {
    return <DetailsSkeleton />;
  }

  // Calculations
  const principal = Number(transaction.amount);
  const interest = calculateInterest(
    principal,
    Number(transaction.interestRate),
    transaction.startDate,
    new Date(), // today for current interest
    transaction.interestType as "SIMPLE" | "COMPOUND"
  );
  
  const totalPaid = transaction.payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  // Outstanding = Principal + Interest - Paid
  const outstanding = Math.max(0, principal + interest - totalPaid);

  const handleDelete = () => {
    deleteTx(id, {
      onSuccess: () => setLocation("/transactions"),
    });
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/transactions")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{transaction.contact?.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{transaction.type}</Badge>
            <span>•</span>
            <span>Created {format(new Date(transaction.createdAt || new Date()), "MMM d, yyyy")}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
           {transaction.status === "ACTIVE" && (
            <Button 
              variant="default" 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => settle(id)}
              disabled={isSettling}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Settle
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the transaction and all associated payment records permanently.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Principal Amount</p>
                <p className="text-2xl font-bold font-mono">{formatCurrency(principal)}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Interest Accrued</p>
                <p className="text-2xl font-bold font-mono text-orange-600">{formatCurrency(interest)}</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-primary mb-1 font-medium">Total Outstanding</p>
                <p className="text-3xl font-bold font-mono text-primary">{formatCurrency(outstanding)}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Start Date</span>
                </div>
                <p className="font-medium pl-6">{format(new Date(transaction.startDate), "MMMM d, yyyy")}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Percent className="w-4 h-4" />
                  <span>Interest Rate</span>
                </div>
                <p className="font-medium pl-6">{transaction.interestRate}% per year ({transaction.interestType?.toLowerCase()})</p>
              </div>
            </div>

            {transaction.description && (
              <div className="bg-muted/30 p-4 rounded-lg text-sm border">
                <span className="font-semibold block mb-1">Note:</span>
                {transaction.description}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payments Section */}
        <div className="space-y-6">
          <Card className="shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Payments</CardTitle>
              {transaction.status === "ACTIVE" && <AddPaymentDialog transactionId={id} />}
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-sm text-muted-foreground">
                Total Paid: <span className="font-bold text-foreground">{formatCurrency(totalPaid)}</span>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!transaction.payments || transaction.payments.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-xs">
                          No payments recorded
                        </TableCell>
                      </TableRow>
                    ) : (
                      transaction.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="text-xs">
                            {format(new Date(payment.date), "MMM d, yyyy")}
                            {payment.note && <div className="text-muted-foreground truncate max-w-[100px]">{payment.note}</div>}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {formatCurrency(Number(payment.amount))}
                          </TableCell>
                           <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => deletePayment({ id: payment.id, transactionId: id })}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}
