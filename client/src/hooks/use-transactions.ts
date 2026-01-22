import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateTransactionRequest, type UpdateTransactionRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useTransactions() {
  return useQuery({
    queryKey: [api.transactions.list.path],
    queryFn: async () => {
      const res = await fetch(api.transactions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.transactions.list.responses[200].parse(await res.json());
    },
  });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: [api.transactions.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.transactions.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transaction details");
      return api.transactions.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTransactionRequest) => {
      // Ensure numeric fields are numbers, even if form sends strings
      const payload = {
        ...data,
        amount: String(data.amount), // schema expects string/numeric for decimal
        interestRate: String(data.interestRate),
      };
      
      const res = await fetch(api.transactions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create transaction");
      }
      return api.transactions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
      toast({ title: "Success", description: "Transaction recorded" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.transactions.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete transaction");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
      toast({ title: "Deleted", description: "Transaction removed" });
    },
  });
}

export function useSettleTransaction() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: number) => {
            const url = buildUrl(api.transactions.update.path, { id });
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "SETTLED" }),
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to settle transaction");
            return api.transactions.update.responses[200].parse(await res.json());
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [api.transactions.get.path, data.id] });
            queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
            toast({ title: "Settled", description: "Transaction marked as settled" });
        }
    });
}
