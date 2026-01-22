export * from "./models/auth";
import { pgTable, text, serial, integer, boolean, timestamp, numeric, date, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id), // Owner of the contact
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  relation: text("relation"), // e.g., "Friend", "Family", "Business"
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  type: text("type").notNull(), // 'GIVEN' or 'TAKEN'
  amount: numeric("amount").notNull(),
  interestRate: numeric("interest_rate").notNull(), // Percentage per year/month? Usually per year or month. Let's assume % per month based on common informal lending, or make it configurable. Let's stick to % per year (annual) as standard, but maybe add frequency. Let's assume % per year for now.
  interestType: text("interest_type").notNull(), // 'SIMPLE' or 'COMPOUND'
  startDate: date("start_date").notNull(),
  dueDate: date("due_date"),
  status: text("status").default("ACTIVE"), // 'ACTIVE', 'SETTLED'
  description: text("description"),
  screenshotUrl: text("screenshot_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull().references(() => transactions.id),
  amount: numeric("amount").notNull(),
  date: date("date").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  contact: one(contacts, {
    fields: [transactions.contactId],
    references: [contacts.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  transaction: one(transactions, {
    fields: [payments.transactionId],
    references: [transactions.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, userId: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, userId: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// Request types
export type CreateContactRequest = InsertContact;
export type UpdateContactRequest = Partial<InsertContact>;

export type CreateTransactionRequest = InsertTransaction;
export type UpdateTransactionRequest = Partial<InsertTransaction>;

export type CreatePaymentRequest = InsertPayment;

// Response types
export type ContactResponse = Contact;
export type TransactionResponse = Transaction & { contact?: Contact, payments?: Payment[] }; // Enriched response
export type PaymentResponse = Payment;

export type DashboardStats = {
  totalGiven: number;
  totalTaken: number;
  totalInterestGiven: number;
  totalInterestTaken: number;
};
