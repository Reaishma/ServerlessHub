import { 
  users, 
  cloudFunctions, 
  apiEndpoints, 
  firestoreCollections, 
  firestoreDocuments, 
  logEntries, 
  iamUsers, 
  serviceAccounts,
  type User, 
  type InsertUser,
  type CloudFunction,
  type InsertCloudFunction,
  type ApiEndpoint,
  type InsertApiEndpoint,
  type FirestoreCollection,
  type InsertFirestoreCollection,
  type FirestoreDocument,
  type InsertFirestoreDocument,
  type LogEntry,
  type InsertLogEntry,
  type IamUser,
  type InsertIamUser,
  type ServiceAccount,
  type InsertServiceAccount
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Cloud Functions
  getCloudFunctions(): Promise<CloudFunction[]>;
  getCloudFunction(id: number): Promise<CloudFunction | undefined>;
  createCloudFunction(func: InsertCloudFunction): Promise<CloudFunction>;
  updateCloudFunction(id: number, func: Partial<InsertCloudFunction>): Promise<CloudFunction | undefined>;
  deleteCloudFunction(id: number): Promise<boolean>;

  // API Endpoints
  getApiEndpoints(): Promise<ApiEndpoint[]>;
  createApiEndpoint(endpoint: InsertApiEndpoint): Promise<ApiEndpoint>;
  updateApiEndpoint(id: number, endpoint: Partial<InsertApiEndpoint>): Promise<ApiEndpoint | undefined>;

  // Firestore Collections
  getFirestoreCollections(): Promise<FirestoreCollection[]>;
  createFirestoreCollection(collection: InsertFirestoreCollection): Promise<FirestoreCollection>;
  deleteFirestoreCollection(id: number): Promise<boolean>;

  // Firestore Documents
  getFirestoreDocuments(collectionId: number): Promise<FirestoreDocument[]>;
  createFirestoreDocument(doc: InsertFirestoreDocument): Promise<FirestoreDocument>;
  updateFirestoreDocument(id: number, doc: Partial<InsertFirestoreDocument>): Promise<FirestoreDocument | undefined>;
  deleteFirestoreDocument(id: number): Promise<boolean>;

  // Log Entries
  getLogEntries(filters?: { service?: string; level?: string; limit?: number }): Promise<LogEntry[]>;
  createLogEntry(entry: InsertLogEntry): Promise<LogEntry>;

  // IAM Users
  getIamUsers(): Promise<IamUser[]>;
  createIamUser(user: InsertIamUser): Promise<IamUser>;
  updateIamUser(id: number, user: Partial<InsertIamUser>): Promise<IamUser | undefined>;
  deleteIamUser(id: number): Promise<boolean>;

  // Service Accounts
  getServiceAccounts(): Promise<ServiceAccount[]>;
  createServiceAccount(account: InsertServiceAccount): Promise<ServiceAccount>;
  updateServiceAccount(id: number, account: Partial<InsertServiceAccount>): Promise<ServiceAccount | undefined>;
  deleteServiceAccount(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private cloudFunctions: Map<number, CloudFunction> = new Map();
  private apiEndpoints: Map<number, ApiEndpoint> = new Map();
  private firestoreCollections: Map<number, FirestoreCollection> = new Map();
  private firestoreDocuments: Map<number, FirestoreDocument> = new Map();
  private logEntries: Map<number, LogEntry> = new Map();
  private iamUsers: Map<number, IamUser> = new Map();
  private serviceAccounts: Map<number, ServiceAccount> = new Map();
  
  private currentUserId = 1;
  private currentFunctionId = 1;
  private currentEndpointId = 1;
  private currentCollectionId = 1;
  private currentDocumentId = 1;
  private currentLogId = 1;
  private currentIamUserId = 1;
  private currentServiceAccountId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample data
    this.createCloudFunction({
      name: "user-authentication",
      runtime: "Node.js 18",
      trigger: "HTTP",
      code: "exports.handler = (req, res) => { res.json({ message: 'Hello World' }); }"
    });

    this.createCloudFunction({
      name: "data-processor",
      runtime: "Python 3.9",
      trigger: "Cloud Storage",
      code: "def main(event, context): print('Processing data')"
    });

    this.createApiEndpoint({
      path: "/api/users",
      method: "GET",
      status: "Healthy",
      requestsPerMin: 45,
      avgResponseTime: 120
    });

    this.createApiEndpoint({
      path: "/api/auth/login",
      method: "POST",
      status: "Healthy",
      requestsPerMin: 12,
      avgResponseTime: 200
    });

    this.createFirestoreCollection({ name: "users" });
    this.createFirestoreCollection({ name: "products" });
    this.createFirestoreCollection({ name: "orders" });

    this.createLogEntry({
      service: "Cloud Functions",
      level: "INFO",
      message: "Function 'user-authentication' deployed successfully"
    });

    this.createLogEntry({
      service: "Cloud Endpoints",
      level: "WARNING",
      message: "API endpoint '/api/data/export' response time exceeded 2s threshold"
    });

    this.createIamUser({
      email: "vra.9618@gmail.com",
      role: "Owner"
    });

    this.createIamUser({
      email: "developer@example.com",
      role: "Editor"
    });

    this.createServiceAccount({
      name: "function-executor",
      email: "function-executor@project.iam.gserviceaccount.com",
      roles: ["Cloud Functions Invoker"]
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Cloud Functions
  async getCloudFunctions(): Promise<CloudFunction[]> {
    return Array.from(this.cloudFunctions.values());
  }

  async getCloudFunction(id: number): Promise<CloudFunction | undefined> {
    return this.cloudFunctions.get(id);
  }

  async createCloudFunction(func: InsertCloudFunction): Promise<CloudFunction> {
    const id = this.currentFunctionId++;
    const cloudFunction: CloudFunction = { 
      ...func, 
      id, 
      status: "Active",
      deployed: new Date()
    };
    this.cloudFunctions.set(id, cloudFunction);
    return cloudFunction;
  }

  async updateCloudFunction(id: number, func: Partial<InsertCloudFunction>): Promise<CloudFunction | undefined> {
    const existing = this.cloudFunctions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...func };
    this.cloudFunctions.set(id, updated);
    return updated;
  }

  async deleteCloudFunction(id: number): Promise<boolean> {
    return this.cloudFunctions.delete(id);
  }

  // API Endpoints
  async getApiEndpoints(): Promise<ApiEndpoint[]> {
    return Array.from(this.apiEndpoints.values());
  }

  async createApiEndpoint(endpoint: InsertApiEndpoint): Promise<ApiEndpoint> {
    const id = this.currentEndpointId++;
    const apiEndpoint: ApiEndpoint = { ...endpoint, id };
    this.apiEndpoints.set(id, apiEndpoint);
    return apiEndpoint;
  }

  async updateApiEndpoint(id: number, endpoint: Partial<InsertApiEndpoint>): Promise<ApiEndpoint | undefined> {
    const existing = this.apiEndpoints.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...endpoint };
    this.apiEndpoints.set(id, updated);
    return updated;
  }

  // Firestore Collections
  async getFirestoreCollections(): Promise<FirestoreCollection[]> {
    return Array.from(this.firestoreCollections.values());
  }

  async createFirestoreCollection(collection: InsertFirestoreCollection): Promise<FirestoreCollection> {
    const id = this.currentCollectionId++;
    const firestoreCollection: FirestoreCollection = { 
      ...collection, 
      id, 
      documentCount: 0 
    };
    this.firestoreCollections.set(id, firestoreCollection);
    return firestoreCollection;
  }

  async deleteFirestoreCollection(id: number): Promise<boolean> {
    return this.firestoreCollections.delete(id);
  }

  // Firestore Documents
  async getFirestoreDocuments(collectionId: number): Promise<FirestoreDocument[]> {
    return Array.from(this.firestoreDocuments.values()).filter(doc => doc.collectionId === collectionId);
  }

  async createFirestoreDocument(doc: InsertFirestoreDocument): Promise<FirestoreDocument> {
    const id = this.currentDocumentId++;
    const firestoreDocument: FirestoreDocument = { 
      ...doc, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.firestoreDocuments.set(id, firestoreDocument);
    
    // Update collection document count
    const collection = this.firestoreCollections.get(doc.collectionId);
    if (collection) {
      collection.documentCount++;
    }
    
    return firestoreDocument;
  }

  async updateFirestoreDocument(id: number, doc: Partial<InsertFirestoreDocument>): Promise<FirestoreDocument | undefined> {
    const existing = this.firestoreDocuments.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...doc, updatedAt: new Date() };
    this.firestoreDocuments.set(id, updated);
    return updated;
  }

  async deleteFirestoreDocument(id: number): Promise<boolean> {
    const doc = this.firestoreDocuments.get(id);
    if (doc) {
      // Update collection document count
      const collection = this.firestoreCollections.get(doc.collectionId);
      if (collection && collection.documentCount > 0) {
        collection.documentCount--;
      }
    }
    return this.firestoreDocuments.delete(id);
  }

  // Log Entries
  async getLogEntries(filters?: { service?: string; level?: string; limit?: number }): Promise<LogEntry[]> {
    let entries = Array.from(this.logEntries.values());
    
    if (filters?.service && filters.service !== "All Services") {
      entries = entries.filter(entry => entry.service === filters.service);
    }
    
    if (filters?.level && filters.level !== "All Levels") {
      entries = entries.filter(entry => entry.level === filters.level);
    }
    
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (filters?.limit) {
      entries = entries.slice(0, filters.limit);
    }
    
    return entries;
  }

  async createLogEntry(entry: InsertLogEntry): Promise<LogEntry> {
    const id = this.currentLogId++;
    const logEntry: LogEntry = { 
      ...entry, 
      id, 
      timestamp: new Date()
    };
    this.logEntries.set(id, logEntry);
    return logEntry;
  }

  // IAM Users
  async getIamUsers(): Promise<IamUser[]> {
    return Array.from(this.iamUsers.values());
  }

  async createIamUser(user: InsertIamUser): Promise<IamUser> {
    const id = this.currentIamUserId++;
    const iamUser: IamUser = { 
      ...user, 
      id, 
      status: "Active",
      createdAt: new Date()
    };
    this.iamUsers.set(id, iamUser);
    return iamUser;
  }

  async updateIamUser(id: number, user: Partial<InsertIamUser>): Promise<IamUser | undefined> {
    const existing = this.iamUsers.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...user };
    this.iamUsers.set(id, updated);
    return updated;
  }

  async deleteIamUser(id: number): Promise<boolean> {
    return this.iamUsers.delete(id);
  }

  // Service Accounts
  async getServiceAccounts(): Promise<ServiceAccount[]> {
    return Array.from(this.serviceAccounts.values());
  }

  async createServiceAccount(account: InsertServiceAccount): Promise<ServiceAccount> {
    const id = this.currentServiceAccountId++;
    const serviceAccount: ServiceAccount = { 
      ...account, 
      id, 
      createdAt: new Date()
    };
    this.serviceAccounts.set(id, serviceAccount);
    return serviceAccount;
  }

  async updateServiceAccount(id: number, account: Partial<InsertServiceAccount>): Promise<ServiceAccount | undefined> {
    const existing = this.serviceAccounts.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...account };
    this.serviceAccounts.set(id, updated);
    return updated;
  }

  async deleteServiceAccount(id: number): Promise<boolean> {
    return this.serviceAccounts.delete(id);
  }
}

export const storage = new MemStorage();
