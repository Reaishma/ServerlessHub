import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCloudFunctionSchema, 
  insertApiEndpointSchema, 
  insertFirestoreCollectionSchema, 
  insertFirestoreDocumentSchema, 
  insertLogEntrySchema, 
  insertIamUserSchema, 
  insertServiceAccountSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Cloud Functions routes
  app.get("/api/functions", async (req, res) => {
    const functions = await storage.getCloudFunctions();
    res.json(functions);
  });

  app.post("/api/functions", async (req, res) => {
    try {
      const functionData = insertCloudFunctionSchema.parse(req.body);
      const newFunction = await storage.createCloudFunction(functionData);
      
      // Log the deployment
      await storage.createLogEntry({
        service: "Cloud Functions",
        level: "INFO",
        message: `Function '${newFunction.name}' deployed successfully`
      });
      
      res.json(newFunction);
    } catch (error) {
      res.status(400).json({ error: "Invalid function data" });
    }
  });

  app.delete("/api/functions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteCloudFunction(id);
    
    if (deleted) {
      await storage.createLogEntry({
        service: "Cloud Functions",
        level: "INFO",
        message: `Function deleted successfully`
      });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Function not found" });
    }
  });

  // API Endpoints routes
  app.get("/api/endpoints", async (req, res) => {
    const endpoints = await storage.getApiEndpoints();
    res.json(endpoints);
  });

  app.post("/api/endpoints/test", async (req, res) => {
    const { method, url, headers, body } = req.body;
    
    // Simulate API test
    await storage.createLogEntry({
      service: "Cloud Endpoints",
      level: "INFO",
      message: `API request processed: ${method} ${url}`
    });
    
    res.json({
      status: 200,
      responseTime: Math.floor(Math.random() * 500) + 100,
      response: { success: true, message: "API test successful" }
    });
  });

  // Firestore Collections routes
  app.get("/api/collections", async (req, res) => {
    const collections = await storage.getFirestoreCollections();
    res.json(collections);
  });

  app.post("/api/collections", async (req, res) => {
    try {
      const collectionData = insertFirestoreCollectionSchema.parse(req.body);
      const newCollection = await storage.createFirestoreCollection(collectionData);
      
      await storage.createLogEntry({
        service: "Cloud Firestore",
        level: "INFO",
        message: `Collection '${newCollection.name}' created successfully`
      });
      
      res.json(newCollection);
    } catch (error) {
      res.status(400).json({ error: "Invalid collection data" });
    }
  });

  // Firestore Documents routes
  app.get("/api/collections/:id/documents", async (req, res) => {
    const collectionId = parseInt(req.params.id);
    const documents = await storage.getFirestoreDocuments(collectionId);
    res.json(documents);
  });

  app.post("/api/collections/:id/documents", async (req, res) => {
    try {
      const collectionId = parseInt(req.params.id);
      const documentData = insertFirestoreDocumentSchema.parse({
        ...req.body,
        collectionId
      });
      
      const newDocument = await storage.createFirestoreDocument(documentData);
      
      await storage.createLogEntry({
        service: "Cloud Firestore",
        level: "INFO",
        message: `Document created in collection`
      });
      
      res.json(newDocument);
    } catch (error) {
      res.status(400).json({ error: "Invalid document data" });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updatedDocument = await storage.updateFirestoreDocument(id, req.body);
    
    if (updatedDocument) {
      await storage.createLogEntry({
        service: "Cloud Firestore",
        level: "INFO",
        message: `Document updated successfully`
      });
      res.json(updatedDocument);
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteFirestoreDocument(id);
    
    if (deleted) {
      await storage.createLogEntry({
        service: "Cloud Firestore",
        level: "INFO",
        message: `Document deleted successfully`
      });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  });

  // Firestore Query route
  app.post("/api/query", async (req, res) => {
    const { collectionId, field, operator, value } = req.body;
    
    // Simulate query execution
    const documents = await storage.getFirestoreDocuments(collectionId);
    
    await storage.createLogEntry({
      service: "Cloud Firestore",
      level: "INFO",
      message: `Query executed: ${field} ${operator} ${value}`
    });
    
    res.json({
      results: documents.slice(0, 3), // Return first 3 for demo
      count: documents.length
    });
  });

  // Logging routes
  app.get("/api/logs", async (req, res) => {
    const { service, level, limit } = req.query;
    const logs = await storage.getLogEntries({
      service: service as string,
      level: level as string,
      limit: limit ? parseInt(limit as string) : undefined
    });
    res.json(logs);
  });

  // IAM Users routes
  app.get("/api/iam/users", async (req, res) => {
    const users = await storage.getIamUsers();
    res.json(users);
  });

  app.post("/api/iam/users", async (req, res) => {
    try {
      const userData = insertIamUserSchema.parse(req.body);
      const newUser = await storage.createIamUser(userData);
      
      await storage.createLogEntry({
        service: "IAM",
        level: "INFO",
        message: `User '${newUser.email}' added with role '${newUser.role}'`
      });
      
      res.json(newUser);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.delete("/api/iam/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteIamUser(id);
    
    if (deleted) {
      await storage.createLogEntry({
        service: "IAM",
        level: "INFO",
        message: `User removed successfully`
      });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // Service Accounts routes
  app.get("/api/iam/service-accounts", async (req, res) => {
    const accounts = await storage.getServiceAccounts();
    res.json(accounts);
  });

  app.post("/api/iam/service-accounts", async (req, res) => {
    try {
      const accountData = insertServiceAccountSchema.parse(req.body);
      const newAccount = await storage.createServiceAccount(accountData);
      
      await storage.createLogEntry({
        service: "IAM",
        level: "INFO",
        message: `Service account '${newAccount.name}' created successfully`
      });
      
      res.json(newAccount);
    } catch (error) {
      res.status(400).json({ error: "Invalid service account data" });
    }
  });

  // Security policies route
  app.post("/api/iam/security-policies", async (req, res) => {
    await storage.createLogEntry({
      service: "IAM",
      level: "INFO",
      message: "Security policies updated successfully"
    });
    
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
