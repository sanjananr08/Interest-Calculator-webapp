import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreatePaymentRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePaymentRequest) => {
      const res = await fetch(api.payments.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to record payment");
      return api.payments.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate the specific transaction details to update the payment list
      queryClient.invalidateQueries({ 
        queryKey: [api.transactions.get.path, data.transactionId] 
      });
      toast({ title: "Success", description: "Payment recorded successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, transactionId }: { id: number; transactionId: number }) => {
      const url = buildUrl(api.payments.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete payment");
      return transactionId;
    },
    onSuccess: (transactionId) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.transactions.get.path, transactionId] 
      });
      toast({ title: "Deleted", description: "Payment removed" });
    },
  });
}
