import { codeSnippets, type CodeSnippet, type InsertCodeSnippet } from "@shared/schema";
import { users, type User, type InsertUser } from "@shared/schema";

// CRUD interface for storage
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Code snippet methods
  getCodeSnippet(id: number): Promise<CodeSnippet | undefined>;
  getCodeSnippetByShareId(shareId: string): Promise<CodeSnippet | undefined>;
  createCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet>;
  updateCodeSnippet(id: number, snippet: Partial<InsertCodeSnippet>): Promise<CodeSnippet | undefined>;
  deleteCodeSnippet(id: number): Promise<boolean>;
  getAllCodeSnippets(): Promise<CodeSnippet[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private codeSnippets: Map<number, CodeSnippet>;
  private userCurrentId: number;
  private snippetCurrentId: number;

  constructor() {
    this.users = new Map();
    this.codeSnippets = new Map();
    this.userCurrentId = 1;
    this.snippetCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Code snippet methods
  async getCodeSnippet(id: number): Promise<CodeSnippet | undefined> {
    return this.codeSnippets.get(id);
  }

  async getCodeSnippetByShareId(shareId: string): Promise<CodeSnippet | undefined> {
    return Array.from(this.codeSnippets.values()).find(
      (snippet) => snippet.shareId === shareId,
    );
  }

  async createCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet> {
    const id = this.snippetCurrentId++;
    const createdAt = new Date();
    
    // Create a properly typed CodeSnippet with all required fields
    const codeSnippet: CodeSnippet = {
      id,
      createdAt,
      code: snippet.code,
      title: snippet.title,
      shareId: snippet.shareId,
      language: snippet.language || "javascript"
    };
    
    this.codeSnippets.set(id, codeSnippet);
    return codeSnippet;
  }

  async updateCodeSnippet(id: number, snippet: Partial<InsertCodeSnippet>): Promise<CodeSnippet | undefined> {
    const existing = this.codeSnippets.get(id);
    if (!existing) return undefined;
    
    // Create an updated snippet with proper typing
    const updated: CodeSnippet = {
      ...existing,
      code: snippet.code ?? existing.code,
      title: snippet.title ?? existing.title,
      language: snippet.language ?? existing.language,
      // Only update shareId if provided
      shareId: snippet.shareId ?? existing.shareId,
    };
    
    this.codeSnippets.set(id, updated);
    return updated;
  }

  async deleteCodeSnippet(id: number): Promise<boolean> {
    return this.codeSnippets.delete(id);
  }

  async getAllCodeSnippets(): Promise<CodeSnippet[]> {
    return Array.from(this.codeSnippets.values());
  }
}

export const storage = new MemStorage();
