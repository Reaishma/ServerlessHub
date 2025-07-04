import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const cloudFunctions = pgTable("cloud_functions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  runtime: text("runtime").notNull(),
  trigger: text("trigger").notNull(),
  status: text("status").notNull().default("Active"),
  code: text("code").notNull(),
  deployed: timestamp("deployed").notNull().defaultNow(),
});

export const apiEndpoints = pgTable("api_endpoints", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  method: text("method").notNull(),
  status: text("status").notNull().default("Healthy"),
  requestsPerMin: integer("requests_per_min").notNull().default(0),
  avgResponseTime: integer("avg_response_time").notNull().default(0),
});

export const firestoreCollections = pgTable("firestore_collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  documentCount: integer("document_count").notNull().default(0),
});

export const firestoreDocuments = pgTable("firestore_documents", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").references(() => firestoreCollections.id),
  documentId: text("document_id").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const logEntries = pgTable("log_entries", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(),
  level: text("level").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const iamUsers = pgTable("iam_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const serviceAccounts = pgTable("service_accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  email: text("email").notNull().unique(),
  roles: text("roles").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCloudFunctionSchema = createInsertSchema(cloudFunctions).pick({
  name: true,
  runtime: true,
  trigger: true,
  code: true,
});

export const insertApiEndpointSchema = createInsertSchema(apiEndpoints).pick({
  path: true,
  method: true,
  status: true,
  requestsPerMin: true,
  avgResponseTime: true,
});

export const insertFirestoreCollectionSchema = createInsertSchema(firestoreCollections).pick({
  name: true,
});

export const insertFirestoreDocumentSchema = createInsertSchema(firestoreDocuments).pick({
  collectionId: true,
  documentId: true,
  data: true,
});

export const insertLogEntrySchema = createInsertSchema(logEntries).pick({
  service: true,
  level: true,
  message: true,
});

export const insertIamUserSchema = createInsertSchema(iamUsers).pick({
  email: true,
  role: true,
});

export const insertServiceAccountSchema = createInsertSchema(serviceAccounts).pick({
  name: true,
  email: true,
  roles: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CloudFunction = typeof cloudFunctions.$inferSelect;
export type InsertCloudFunction = z.infer<typeof insertCloudFunctionSchema>;

export type ApiEndpoint = typeof apiEndpoints.$inferSelect;
export type InsertApiEndpoint = z.infer<typeof insertApiEndpointSchema>;

export type FirestoreCollection = typeof firestoreCollections.$inferSelect;
export type InsertFirestoreCollection = z.infer<typeof insertFirestoreCollectionSchema>;

export type FirestoreDocument = typeof firestoreDocuments.$inferSelect;
export type InsertFirestoreDocument = z.infer<typeof insertFirestoreDocumentSchema>;

export type LogEntry = typeof logEntries.$inferSelect;
export type InsertLogEntry = z.infer<typeof insertLogEntrySchema>;

export type IamUser = typeof iamUsers.$inferSelect;
export type InsertIamUser = z.infer<typeof insertIamUserSchema>;

export type ServiceAccount = typeof serviceAccounts.$inferSelect;
export type InsertServiceAccount = z.infer<typeof insertServiceAccountSchema>;
