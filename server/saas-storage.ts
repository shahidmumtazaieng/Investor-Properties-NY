import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { 
  CommonInvestor, 
  InsertCommonInvestor,
  CommonInvestorSession,
  InsertCommonInvestorSession,
  InstitutionalInvestor
} from "../shared/schema.js";
import { db as rawDb } from './database.js';
import { DatabaseRepository } from './database-repository.js';
import * as schema from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

// Extend the existing MemStorage class with SaaS functionality
export class SaaSStorageExtension {
  private commonInvestors: Map<string, CommonInvestor> = new Map();
  private commonInvestorSessions: Map<string, CommonInvestorSession> = new Map();
  private commonInvestorsByUsername: Map<string, string> = new Map(); // username -> id
  private commonInvestorsByEmail: Map<string, string> = new Map(); // email -> id
  private db: DatabaseRepository;
  private rawDb: any;

  constructor() {
    this.db = new DatabaseRepository();
    this.rawDb = rawDb;
    this.seedSampleInvestors();
  }
  
  // Notification and Subscription Methods
  async getAllCommonInvestors(): Promise<CommonInvestor[]> {
    try {
      const result = await this.db.getAllCommonInvestors();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching all common investors from database:', error);
      // Fallback to mock data
      return Array.from(this.commonInvestors.values());
    }
  }
  
  async getAllInstitutionalInvestors(): Promise<InstitutionalInvestor[]> {
    try {
      const result = await this.db.getAllInstitutionalInvestors();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching all institutional investors from database:', error);
      // Fallback to mock data
      return Array.from(this.institutionalInvestors.values());
    }
  }
  
  async getCommonInvestorsWithForeclosureSubscription(): Promise<CommonInvestor[]> {
    try {
      const allInvestors = await this.getAllCommonInvestors();
      return allInvestors.filter(investor => 
        investor.hasForeclosureSubscription && 
        investor.foreclosureSubscriptionExpiry && 
        new Date(investor.foreclosureSubscriptionExpiry) > new Date()
      );
    } catch (error) {
      console.error('Error fetching common investors with foreclosure subscription:', error);
      // Fallback to mock implementation
      return Array.from(this.commonInvestors.values()).filter(investor => investor.hasForeclosureSubscription);
    }
  }
  
  async createSubscriptionRecord(investorId: string, subscriptionData: any): Promise<any> {
    try {
      return await this.db.createSubscriptionRecord(investorId, subscriptionData);
    } catch (error) {
      console.error('Error creating subscription record in database:', error);
      // Continue with mock implementation
      const investor = await this.getCommonInvestorById(investorId);
      if (!investor) return null;
      
      return this.updateCommonInvestor(investorId, {
        hasForeclosureSubscription: true,
        foreclosureSubscriptionExpiry: subscriptionData.expiryDate,
        subscriptionPlan: subscriptionData.planType
      });
    }
  }
  
  async updateSubscriptionStatus(investorId: string, status: string): Promise<boolean> {
    try {
      // In a real implementation, we would update a subscription records table
      // For now, we'll just update the investor record
      const investor = await this.getCommonInvestorById(investorId);
      if (!investor) return false;
      
      await this.updateCommonInvestor(investorId, {
        hasForeclosureSubscription: status === 'active',
        foreclosureSubscriptionExpiry: status === 'active' ? investor.foreclosureSubscriptionExpiry : null
      });
      
      return true;
    } catch (error) {
      console.error('Error updating subscription status in database:', error);
      // Continue with mock implementation
      const investor = await this.getCommonInvestorById(investorId);
      if (!investor) return false;
      
      await this.updateCommonInvestor(investorId, {
        hasForeclosureSubscription: status === 'active',
        foreclosureSubscriptionExpiry: status === 'active' ? investor.foreclosureSubscriptionExpiry : null
      });
      
      return true;
    }
  }
  
  async createForeclosureSubscriptionRequest(investorId: string, requestData: any): Promise<any> {
    // Use the real database
    if (this.rawDb) {
      try {
        const result = await this.rawDb.insert(schema.foreclosureSubscriptions).values({
          leadId: investorId,
          counties: requestData.counties || ['ALL'],
          subscriptionType: requestData.subscriptionType || 'weekly',
          isActive: false, // Not active until approved
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        return result[0];
      } catch (error) {
        console.error('Error creating foreclosure subscription request:', error);
        throw error;
      }
    }
    
    // Mock implementation
    return { id: randomUUID(), leadId: investorId, ...requestData, isActive: false };
  }

  // Seed some sample common investors for testing
  private seedSampleInvestors() {
    const sampleInvestors: CommonInvestor[] = [
      {
        id: randomUUID(),
        username: "investor1",
        password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G", // password: "password123"
        email: "investor1@example.com",
        firstName: "John",
        lastName: "Investor",
        phone: "+1234567890",
        isActive: true,
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationSentAt: null,
        emailVerifiedAt: new Date(),
        phoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationSentAt: null,
        phoneVerifiedAt: new Date(),
        hasForeclosureSubscription: false,
        foreclosureSubscriptionExpiry: null,
        subscriptionPlan: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        username: "investor2",
        password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G", // password: "password123"
        email: "investor2@example.com",
        firstName: "Jane",
        lastName: "Smith",
        phone: "+1234567891",
        isActive: true,
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationSentAt: null,
        emailVerifiedAt: new Date(),
        phoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationSentAt: null,
        phoneVerifiedAt: new Date(),
        hasForeclosureSubscription: true,
        foreclosureSubscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        subscriptionPlan: "yearly",
        passwordResetToken: null,
        passwordResetExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    sampleInvestors.forEach(investor => {
      this.commonInvestors.set(investor.id, investor);
      this.commonInvestorsByUsername.set(investor.username, investor.id);
      this.commonInvestorsByEmail.set(investor.email, investor.id);
    });
  }

  // Common Investor methods
  async createCommonInvestor(insertInvestor: InsertCommonInvestor): Promise<CommonInvestor> {
    const id = randomUUID();
    const now = new Date();
    
    const investor: CommonInvestor = {
      id,
      username: insertInvestor.username,
      password: insertInvestor.password,
      email: insertInvestor.email,
      firstName: insertInvestor.firstName,
      lastName: insertInvestor.lastName,
      phone: insertInvestor.phone || null,
      isActive: insertInvestor.isActive ?? true,
      emailVerified: insertInvestor.emailVerified ?? false,
      emailVerificationToken: insertInvestor.emailVerificationToken || null,
      emailVerificationSentAt: insertInvestor.emailVerificationSentAt || null,
      emailVerifiedAt: insertInvestor.emailVerifiedAt || null,
      phoneVerified: insertInvestor.phoneVerified ?? false,
      phoneVerificationCode: insertInvestor.phoneVerificationCode || null,
      phoneVerificationSentAt: insertInvestor.phoneVerificationSentAt || null,
      phoneVerifiedAt: insertInvestor.phoneVerifiedAt || null,
      hasForeclosureSubscription: insertInvestor.hasForeclosureSubscription ?? false,
      foreclosureSubscriptionExpiry: insertInvestor.foreclosureSubscriptionExpiry || null,
      subscriptionPlan: insertInvestor.subscriptionPlan || null,
      passwordResetToken: insertInvestor.passwordResetToken || null,
      passwordResetExpires: insertInvestor.passwordResetExpires || null,
      createdAt: now,
      updatedAt: now,
    };

    this.commonInvestors.set(id, investor);
    this.commonInvestorsByUsername.set(investor.username, id);
    this.commonInvestorsByEmail.set(investor.email, id);

    return investor;
  }

  async getCommonInvestorByUsername(username: string): Promise<CommonInvestor | null> {
    const id = this.commonInvestorsByUsername.get(username);
    return id ? this.commonInvestors.get(id) || null : null;
  }

  async getCommonInvestorByEmail(email: string): Promise<CommonInvestor | null> {
    const id = this.commonInvestorsByEmail.get(email);
    return id ? this.commonInvestors.get(id) || null : null;
  }

  async getCommonInvestorById(id: string): Promise<CommonInvestor | null> {
    return this.commonInvestors.get(id) || null;
  }

  async authenticateCommonInvestor(username: string, password: string): Promise<CommonInvestor | null> {
    const investor = await this.getCommonInvestorByUsername(username);
    if (!investor) return null;

    const isValid = await bcrypt.compare(password, investor.password);
    return isValid ? investor : null;
  }

  async updateCommonInvestor(id: string, data: Partial<CommonInvestor>): Promise<CommonInvestor | null> {
    const investor = this.commonInvestors.get(id);
    if (!investor) return null;

    const updatedInvestor = {
      ...investor,
      ...data,
      updatedAt: new Date(),
    };

    this.commonInvestors.set(id, updatedInvestor);

    // Update indexes if username or email changed
    if (data.username && data.username !== investor.username) {
      this.commonInvestorsByUsername.delete(investor.username);
      this.commonInvestorsByUsername.set(data.username, id);
    }
    if (data.email && data.email !== investor.email) {
      this.commonInvestorsByEmail.delete(investor.email);
      this.commonInvestorsByEmail.set(data.email, id);
    }

    return updatedInvestor;
  }

  // Session methods
  async createCommonInvestorSession(investorId: string, sessionToken: string, expiresAt: Date): Promise<void> {
    const session: CommonInvestorSession = {
      id: randomUUID(),
      investorId,
      sessionToken,
      expiresAt,
      createdAt: new Date(),
    };

    this.commonInvestorSessions.set(sessionToken, session);
  }

  async getCommonInvestorSession(sessionToken: string): Promise<{ investorId: string; expiresAt: Date } | null> {
    const session = this.commonInvestorSessions.get(sessionToken);
    if (!session) return null;

    return {
      investorId: session.investorId,
      expiresAt: session.expiresAt,
    };
  }

  async deleteCommonInvestorSession(sessionToken: string): Promise<void> {
    this.commonInvestorSessions.delete(sessionToken);
  }

  // Institutional Investor methods
  private institutionalInvestors: Map<string, InstitutionalInvestor> = new Map();
  private institutionalSessions: Map<string, any> = new Map();
  private institutionalInvestorsByUsername: Map<string, string> = new Map();
  private institutionalInvestorsByEmail: Map<string, string> = new Map();

  async getInstitutionalInvestorById(id: string): Promise<InstitutionalInvestor | null> {
    return this.institutionalInvestors.get(id) || null;
  }

  async getInstitutionalInvestorByUsername(username: string): Promise<InstitutionalInvestor | null> {
    const id = this.institutionalInvestorsByUsername.get(username);
    return id ? this.institutionalInvestors.get(id) || null : null;
  }

  async getInstitutionalInvestorByEmail(email: string): Promise<InstitutionalInvestor | null> {
    const id = this.institutionalInvestorsByEmail.get(email);
    return id ? this.institutionalInvestors.get(id) || null : null;
  }

  async authenticateInstitutionalInvestor(username: string, password: string): Promise<InstitutionalInvestor | null> {
    const investor = await this.getInstitutionalInvestorByUsername(username);
    if (!investor || !investor.password) return null;

    const isValid = await bcrypt.compare(password, investor.password);
    return isValid ? investor : null;
  }

  async createInstitutionalSession(investorId: string, sessionToken: string, expiresAt: Date): Promise<void> {
    const session = {
      id: randomUUID(),
      investorId,
      sessionToken,
      expiresAt,
      createdAt: new Date(),
    };

    this.institutionalSessions.set(sessionToken, session);
  }

  async getInstitutionalSession(sessionToken: string): Promise<any | null> {
    return this.institutionalSessions.get(sessionToken) || null;
  }

  async deleteInstitutionalSession(sessionToken: string): Promise<void> {
    this.institutionalSessions.delete(sessionToken);
  }

  // Offer methods (extend existing offers functionality)
  async createOffer(data: any): Promise<any> {
    // Use the real database
    if (this.rawDb) {
      try {
        const result = await this.rawDb.insert(schema.offers).values(data).returning();
        return result[0];
      } catch (error) {
        console.error('Error creating offer:', error);
        throw error;
      }
    }
    
    // Fallback to mock implementation
    const id = randomUUID();
    const now = new Date();
    
    const offer = {
      id,
      ...data,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    console.log("Creating offer:", offer);
    return offer;
  }

  async getOffersByInvestor(investorId: string, investorType: 'common' | 'institutional'): Promise<any[]> {
    // Use the real database
    if (this.rawDb) {
      try {
        if (investorType === 'common') {
          return await this.rawDb.select().from(schema.offers)
            .where(eq(schema.offers.commonInvestorId, investorId))
            .orderBy(desc(schema.offers.createdAt));
        } else {
          return await this.rawDb.select().from(schema.offers)
            .where(eq(schema.offers.institutionalInvestorId, investorId))
            .orderBy(desc(schema.offers.createdAt));
        }
      } catch (error) {
        console.error('Error fetching offers by investor:', error);
        return [];
      }
    }
    
    // Mock implementation
    return [];
  }

  async getOffersByProperty(propertyId: string): Promise<any[]> {
    // Use the real database
    if (this.rawDb) {
      try {
        return await this.rawDb.select().from(schema.offers)
          .where(eq(schema.offers.propertyId, propertyId))
          .orderBy(desc(schema.offers.createdAt));
      } catch (error) {
        console.error('Error fetching offers by property:', error);
        return [];
      }
    }
    
    // Mock implementation
    return [];
  }

  async updateOffer(id: string, data: Partial<any>): Promise<any | null> {
    // Use the real database
    if (this.rawDb) {
      try {
        const result = await this.rawDb.update(schema.offers)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(schema.offers.id, id))
          .returning();
        return result[0];
      } catch (error) {
        console.error('Error updating offer:', error);
        return null;
      }
    }
    
    // Mock implementation
    return null;
  }

  async deleteOffer(id: string): Promise<boolean> {
    // Use the real database
    if (this.rawDb) {
      try {
        await this.rawDb.delete(schema.offers)
          .where(eq(schema.offers.id, id));
        return true;
      } catch (error) {
        console.error('Error deleting offer:', error);
        return false;
      }
    }
    
    // Mock implementation
    return true;
  }

  // Utility methods
  getAllCommonInvestorSessions(): CommonInvestorSession[] {
    return Array.from(this.commonInvestorSessions.values());
  }

  // Clean up expired sessions
  cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [token, session] of this.commonInvestorSessions.entries()) {
      if (session.expiresAt < now) {
        this.commonInvestorSessions.delete(token);
      }
    }
  }
}
