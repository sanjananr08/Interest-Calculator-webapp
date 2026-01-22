import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Contacts
  app.get(api.contacts.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const contacts = await storage.getContacts(userId);
    res.json(contacts);
  });

  app.get(api.contacts.get.path, isAuthenticated, async (req, res) => {
    const contact = await storage.getContact(Number(req.params.id));
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.json(contact);
  });

  app.post(api.contacts.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.contacts.create.input.parse(req.body);
      const userId = (req.user as any).claims.sub;
      const contact = await storage.createContact({ ...input, userId });
      res.status(201).json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.contacts.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.contacts.update.input.parse(req.body);
      const contact = await storage.updateContact(Number(req.params.id), input);
      res.json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.contacts.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteContact(Number(req.params.id));
    res.status(204).send();
  });

  // Transactions
  app.get(api.transactions.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const transactions = await storage.getTransactions(userId);
    res.json(transactions);
  });

  app.get(api.transactions.get.path, isAuthenticated, async (req, res) => {
    const transaction = await storage.getTransaction(Number(req.params.id));
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json(transaction);
  });

  app.post(api.transactions.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.transactions.create.input.parse(req.body);
      const userId = (req.user as any).claims.sub;
      const transaction = await storage.createTransaction({ ...input, userId });
      res.status(201).json(transaction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.transactions.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.transactions.update.input.parse(req.body);
      const transaction = await storage.updateTransaction(Number(req.params.id), input);
      res.json(transaction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.transactions.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteTransaction(Number(req.params.id));
    res.status(204).send();
  });

  // Payments
  app.post(api.payments.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.payments.create.input.parse(req.body);
      const payment = await storage.createPayment(input);
      res.status(201).json(payment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.payments.delete.path, isAuthenticated, async (req, res) => {
    await storage.deletePayment(Number(req.params.id));
    res.status(204).send();
  });

  // Dashboard
  app.get(api.dashboard.stats.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const stats = await storage.getDashboardStats(userId);
    res.json(stats);
  });

  return httpServer;
}
