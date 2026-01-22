import { db } from "./db";
import {
  contacts, transactions, payments,
  type Contact, type InsertContact, type UpdateContactRequest,
  type Transaction, type InsertTransaction, type UpdateTransactionRequest,
  type Payment, type InsertPayment
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // Contacts
  getContacts(userId: string): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, updates: UpdateContactRequest): Promise<Contact>;
  deleteContact(id: number): Promise<void>;

  // Transactions
  getTransactions(userId: string): Promise<(Transaction & { contact: Contact })[]>;
  getTransaction(id: number): Promise<(Transaction & { contact: Contact, payments: Payment[] }) | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, updates: UpdateTransactionRequest): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  deletePayment(id: number): Promise<void>;

  // Dashboard
  getDashboardStats(userId: string): Promise<{
    totalGiven: number;
    totalTaken: number;
    totalInterestGiven: number;
    totalInterestTaken: number;
    pendingTransactions: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Contacts
  async getContacts(userId: string): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.userId, userId));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async updateContact(id: number, updates: UpdateContactRequest): Promise<Contact> {
    const [contact] = await db
      .update(contacts)
      .set(updates)
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // Transactions
  async getTransactions(userId: string): Promise<(Transaction & { contact: Contact })[]> {
    const rows = await db
      .select({
        transaction: transactions,
        contact: contacts,
      })
      .from(transactions)
      .innerJoin(contacts, eq(transactions.contactId, contacts.id))
      .where(eq(transactions.userId, userId));

    return rows.map((row) => ({
      ...row.transaction,
      contact: row.contact,
    }));
  }

  async getTransaction(id: number): Promise<(Transaction & { contact: Contact, payments: Payment[] }) | undefined> {
    const [row] = await db
      .select({
        transaction: transactions,
        contact: contacts,
      })
      .from(transactions)
      .innerJoin(contacts, eq(transactions.contactId, contacts.id))
      .where(eq(transactions.id, id));

    if (!row) return undefined;

    const paymentRows = await db
      .select()
      .from(payments)
      .where(eq(payments.transactionId, id));

    return {
      ...row.transaction,
      contact: row.contact,
      payments: paymentRows,
    };
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async updateTransaction(id: number, updates: UpdateTransactionRequest): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(payments).where(eq(payments.transactionId, id)); // Cascade delete payments manually just in case
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  // Payments
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async deletePayment(id: number): Promise<void> {
    await db.delete(payments).where(eq(payments.id, id));
  }

  // Dashboard Stats
  async getDashboardStats(userId: string): Promise<{
    totalGiven: number;
    totalTaken: number;
    totalInterestGiven: number;
    totalInterestTaken: number;
    pendingTransactions: number;
  }> {
    // This is a simplified calculation. Ideally, we calculate interest properly.
    // For MVP, we can just sum up principal amounts.
    // Interest calculation is complex and dynamic based on time.
    // We will let the frontend calculate current interest for display,
    // or we could add a calculated field here.

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));

    let totalGiven = 0;
    let totalTaken = 0;
    let pendingTransactions = 0;

    userTransactions.forEach((t) => {
      const amount = parseFloat(t.amount);
      if (t.status === 'ACTIVE') {
        pendingTransactions++;
        if (t.type === 'GIVEN') {
          totalGiven += amount;
        } else {
          totalTaken += amount;
        }
      }
    });

    return {
      totalGiven,
      totalTaken,
      totalInterestGiven: 0, // Placeholder - hard to calc in SQL without more logic
      totalInterestTaken: 0, // Placeholder
      pendingTransactions,
    };
  }
}

export const storage = new DatabaseStorage();
