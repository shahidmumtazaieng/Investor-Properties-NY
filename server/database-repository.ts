import { supabase, db, databaseHealthCheck } from './database.ts';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import * as schema from '../shared/schema.ts';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'investor-properties-ny-jwt-secret';

/**
 * Database Repository - Handles all database operations
 * Provides methods for CRUD operations on all entities
 */
export class DatabaseRepository {
  // Utility function to check if we should use demo mode
  private async shouldUseDemoMode(): Promise<boolean> {
    // If db is null, we're already in demo mode
    if (!db) {
      return true;
    }
    
    // Check database health
    try {
      const health = await databaseHealthCheck();
      return health.status !== 'healthy';
    } catch (error) {
      console.log('Health check failed, using demo mode:', error instanceof Error ? error.message : String(error));
      return true;
    }
  }

  // ==================== USERS ====================
  async getAllUsers() {
    // Check if we should use demo mode
    if (await this.shouldUseDemoMode()) {
      console.log('Demo mode: returning mock users data');
      return [];
    }
    
    // Additional null check for db
    if (!db) {
      console.log('Database is null, returning mock users data');
      return [];
    }
    
    try {
      return await db.select().from(schema.users);
    } catch (error) {
      console.error('Error fetching users, falling back to demo mode:', error);
      return [];
    }
  }

  async getUserById(id: string) {
    // Check if we should use demo mode
    if (await this.shouldUseDemoMode()) {
      console.log('Demo mode: returning mock user data');
      return null;
    }
    
    // Additional null check for db
    if (!db) {
      console.log('Database is null, returning mock user data');
      return null;
    }
    
    try {
      const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching user by ID, falling back to demo mode:', error);
      return null;
    }
  }

  async getUserByUsername(username: string) {
    // Check if we should use demo mode
    if (await this.shouldUseDemoMode()) {
      console.log('Demo mode: returning mock user data for username:', username);
      return null;
    }
    
    // Additional null check for db
    if (!db) {
      console.log('Database is null, returning mock user data for username:', username);
      return null;
    }
    
    try {
      const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching user by username, falling back to demo mode:', error);
      return null;
    }
  }

  async createUser(userData: any) {
    // Check if we should use demo mode
    if (await this.shouldUseDemoMode()) {
      console.log('Demo mode: not creating user');
      return { id: 'demo-user-id', ...userData };
    }
    
    // Additional null check for db
    if (!db) {
      console.log('Database is null, not creating user');
      return { id: 'demo-user-id', ...userData };
    }
    
    try {
      const result = await db.insert(schema.users).values(userData).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user, falling back to demo mode:', error);
      return { id: 'demo-user-id', ...userData };
    }
  }

  async updateUser(id: string, userData: any) {
    // Check if we should use demo mode
    if (await this.shouldUseDemoMode()) {
      console.log('Demo mode: not updating user');
      return { id, ...userData };
    }
    
    // Additional null check for db
    if (!db) {
      console.log('Database is null, not updating user');
      return { id, ...userData };
    }
    
    try {
      const result = await db.update(schema.users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(schema.users.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating user, falling back to demo mode:', error);
      return { id, ...userData };
    }
  }

  // ==================== PROPERTIES ====================
  async getAllProperties() {
    // Check if we should use demo mode
    if (await this.shouldUseDemoMode()) {
      console.log('Demo mode: returning mock properties data');
      return [
        {
          id: "1",
          address: "123 Brooklyn Ave",
          neighborhood: "Park Slope",
          borough: "Brooklyn",
          propertyType: "Condo",
          beds: 2,
          baths: "2",
          sqft: 1200,
          price: "750000",
          arv: "850000",
          estimatedProfit: "75000",
          images: ["/placeholder-property.jpg"],
          description: "Beautiful condo in prime Brooklyn location with modern amenities.",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any,
        {
          id: "2",
          address: "456 Queens Blvd",
          neighborhood: "Long Island City",
          borough: "Queens",
          propertyType: "Single Family",
          beds: 3,
          baths: "2.5",
          sqft: 1800,
          price: "650000",
          arv: "750000",
          estimatedProfit: "85000",
          images: ["/placeholder-property.jpg"],
          description: "Spacious single family home with great potential for renovation.",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any
      ];
    }
    
    // Additional null check for db
    if (!db) {
      console.log('Database is null, returning mock properties data');
      // Return mock data on error
      return [
        {
          id: "1",
          address: "123 Brooklyn Ave",
          neighborhood: "Park Slope",
          borough: "Brooklyn",
          propertyType: "Condo",
          beds: 2,
          baths: "2",
          sqft: 1200,
          price: "750000",
          arv: "850000",
          estimatedProfit: "75000",
          images: ["/placeholder-property.jpg"],
          description: "Beautiful condo in prime Brooklyn location with modern amenities.",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any,
        {
          id: "2",
          address: "456 Queens Blvd",
          neighborhood: "Long Island City",
          borough: "Queens",
          propertyType: "Single Family",
          beds: 3,
          baths: "2.5",
          sqft: 1800,
          price: "650000",
          arv: "750000",
          estimatedProfit: "85000",
          images: ["/placeholder-property.jpg"],
          description: "Spacious single family home with great potential for renovation.",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any
      ];
    }
    
    try {
      return await db.select().from(schema.properties)
        .where(eq(schema.properties.isActive, true))
        .orderBy(desc(schema.properties.createdAt));
    } catch (error) {
      console.error('Error fetching properties, falling back to demo mode:', error);
      // Return mock data on error
      return [
        {
          id: "1",
          address: "123 Brooklyn Ave",
          neighborhood: "Park Slope",
          borough: "Brooklyn",
          propertyType: "Condo",
          beds: 2,
          baths: "2",
          sqft: 1200,
          price: "750000",
          arv: "850000",
          estimatedProfit: "75000",
          images: ["/placeholder-property.jpg"],
          description: "Beautiful condo in prime Brooklyn location with modern amenities.",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any,
        {
          id: "2",
          address: "456 Queens Blvd",
          neighborhood: "Long Island City",
          borough: "Queens",
          propertyType: "Single Family",
          beds: 3,
          baths: "2.5",
          sqft: 1800,
          price: "650000",
          arv: "750000",
          estimatedProfit: "85000",
          images: ["/placeholder-property.jpg"],
          description: "Spacious single family home with great potential for renovation.",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any
      ];
    }
  }

  async getPropertyById(id: string) {
    // Check if we should use demo mode
    if (await this.shouldUseDemoMode()) {
      console.log('Demo mode: returning mock property data for id:', id);
      return null;
    }
    
    // Additional null check for db
    if (!db) {
      console.log('Database is null, returning mock property data for id:', id);
      return null;
    }
    
    try {
      const result = await db.select().from(schema.properties).where(eq(schema.properties.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching property by ID, falling back to demo mode:', error);
      return null;
    }
  }

  async createProperty(propertyData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating property');
      return { id: 'demo-property-id', ...propertyData };
    }
    const result = await db.insert(schema.properties).values(propertyData).returning();
    return result[0];
  }

  async updateProperty(id: string, propertyData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating property');
      return { id, ...propertyData };
    }
    const result = await db.update(schema.properties)
      .set({ ...propertyData, updatedAt: new Date() })
      .where(eq(schema.properties.id, id))
      .returning();
    return result[0];
  }

  async deleteProperty(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not deleting property');
      return { id };
    }
    const result = await db.update(schema.properties)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schema.properties.id, id))
      .returning();
    return result[0];
  }

  // ==================== LEADS ====================
  async getAllLeads() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock leads data');
      return [];
    }
    return await db.select().from(schema.leads)
      .orderBy(desc(schema.leads.createdAt));
  }

  async getLeadById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock lead data');
      return null;
    }
    const result = await db.select().from(schema.leads).where(eq(schema.leads.id, id));
    return result[0] || null;
  }

  // ==================== PARTNERS ====================
  async getAllPartners() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock partners data');
      return [];
    }
    return await db.select().from(schema.partners)
      .where(eq(schema.partners.isActive, true));
  }

  async getPartnerById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock partner data');
      return null;
    }
    const result = await db.select().from(schema.partners).where(eq(schema.partners.id, id));
    return result[0] || null;
  }

  async getPartnerByUsername(username: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock partner data for username:', username);
      return null;
    }
    
    try {
      const result = await db.select().from(schema.partners).where(eq(schema.partners.username, username));
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching partner by username:', error);
      return null;
    }
  }

  async getPartnerByEmail(email: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock partner data for email:', email);
      return null;
    }
    
    try {
      const result = await db.select().from(schema.partners).where(eq(schema.partners.email, email));
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching partner by email:', error);
      return null;
    }
  }

  async createPartner(partnerData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating partner');
      // Try to use Supabase client as fallback
      try {
        const { data, error } = await supabase
          .from('partners')
          .insert(partnerData)
          .select()
          .single();
        
        if (error) {
          console.log('Supabase insert failed:', error.message);
          return { id: 'demo-partner-id', ...partnerData };
        }
        
        console.log('Successfully created partner in Supabase:', data.id);
        return data;
      } catch (error) {
        console.log('Supabase fallback failed:', error instanceof Error ? error.message : String(error));
        return { id: 'demo-partner-id', ...partnerData };
      }
    }
    
    try {
      const result = await db.insert(schema.partners).values(partnerData).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating partner in database:', error);
      // Fall back to demo mode on database error
      console.log('Falling back to demo mode for partner creation');
      return { id: 'demo-partner-id', ...partnerData };
    }
  }

  async updatePartner(id: string, partnerData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating partner');
      return { id, ...partnerData };
    }
    const result = await db.update(schema.partners)
      .set({ ...partnerData, updatedAt: new Date() })
      .where(eq(schema.partners.id, id))
      .returning();
    return result[0];
  }

  async authenticatePartner(username: string, password: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not authenticating partner');
      // For demo purposes, return a mock partner if username is 'testpartner' and password is 'testpassword123'
      if (username === 'testpartner' && password === 'testpassword123') {
        return {
          id: 'demo-partner-id',
          username: 'testpartner',
          email: 'testpartner@example.com',
          firstName: 'Test',
          lastName: 'Partner',
          company: 'Test Company',
          isActive: true,
          approvalStatus: 'approved'
        };
      }
      // Also support the default admin user for demo
      if (username === 'partner' && password === 'partner123') {
        return {
          id: 'demo-partner-id-2',
          username: 'partner',
          email: 'partner@example.com',
          firstName: 'Demo',
          lastName: 'Partner',
          company: 'Demo Company',
          isActive: true,
          approvalStatus: 'approved'
        };
      }
      return null;
    }

    try {
      const partner = await this.getPartnerByUsername(username);
      if (!partner) {
        return null;
      }

      const isValid = await bcrypt.compare(password, partner.password);
      if (!isValid) {
        return null;
      }

      return partner;
    } catch (error) {
      console.error('Error authenticating partner:', error);
      return null;
    }
  }

  async generatePartnerToken(partnerId: string) {
    const token = jwt.sign({ id: partnerId }, JWT_SECRET, { expiresIn: '1h' });
    return token;
  }

  // ==================== COMMON INVESTORS ====================
  async getAllCommonInvestors() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock common investors data');
      return [];
    }
    return await db.select().from(schema.commonInvestors)
      .where(eq(schema.commonInvestors.isActive, true));
  }

  async getCommonInvestorById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock common investor data');
      return null;
    }
    const result = await db.select().from(schema.commonInvestors).where(eq(schema.commonInvestors.id, id));
    return result[0] || null;
  }

  async getCommonInvestorByUsername(username: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock common investor data for username:', username);
      // Try to use Supabase client as fallback
      try {
        const { data, error } = await supabase
          .from('common_investors')
          .select('*')
          .eq('username', username)
          .single();
        
        if (error) {
          console.log('Supabase query failed:', error.message);
          return null;
        }
        
        console.log('Successfully fetched common investor from Supabase:', username);
        return data;
      } catch (error) {
        console.log('Supabase fallback failed:', error instanceof Error ? error.message : String(error));
        return null;
      }
    }
    const result = await db.select().from(schema.commonInvestors).where(eq(schema.commonInvestors.username, username));
    return result[0] || null;
  }

  async getCommonInvestorByEmail(email: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock common investor data for email:', email);
      // Try to use Supabase client as fallback
      try {
        const { data, error } = await supabase
          .from('common_investors')
          .select('*')
          .eq('email', email)
          .single();
        
        if (error) {
          console.log('Supabase query failed:', error.message);
          return null;
        }
        
        console.log('Successfully fetched common investor from Supabase by email:', email);
        return data;
      } catch (error) {
        console.log('Supabase fallback failed:', error instanceof Error ? error.message : String(error));
        return null;
      }
    }
    const result = await db.select().from(schema.commonInvestors).where(eq(schema.commonInvestors.email, email));
    return result[0] || null;
  }

  async createCommonInvestor(investorData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating common investor');
      // Try to use Supabase client as fallback
      try {
        const { data, error } = await supabase
          .from('common_investors')
          .insert(investorData)
          .select()
          .single();
        
        if (error) {
          console.log('Supabase insert failed:', error.message);
          return { id: 'demo-common-investor-id', ...investorData };
        }
        
        console.log('Successfully created common investor in Supabase:', data.id);
        return data;
      } catch (error) {
        console.log('Supabase fallback failed:', error instanceof Error ? error.message : String(error));
        return { id: 'demo-common-investor-id', ...investorData };
      }
    }
    const result = await db.insert(schema.commonInvestors).values(investorData).returning();
    return result[0];
  }

  async updateCommonInvestor(id: string, investorData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating common investor');
      return { id, ...investorData };
    }
    const result = await db.update(schema.commonInvestors)
      .set({ ...investorData, updatedAt: new Date() })
      .where(eq(schema.commonInvestors.id, id))
      .returning();
    return result[0];
  }

  async authenticateCommonInvestor(username: string, password: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not authenticating common investor');
      // For demo purposes, return a mock user if username is 'demo'
      if (username === 'demo' && password === 'demo123') {
        return {
          id: 'demo-user-id',
          username: 'demo',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          userType: 'common_investor'
        };
      }
      
      // Try to authenticate using Supabase client as fallback
      try {
        // First get the investor by username
        const { data: investor, error } = await supabase
          .from('common_investors')
          .select('*')
          .eq('username', username)
          .single();
        
        if (error || !investor) {
          console.log('Supabase query failed or investor not found:', error?.message);
          return null;
        }
        
        // Verify password
        const isValid = await bcrypt.compare(password, investor.password);
        if (!isValid) {
          return null;
        }
        
        console.log('Successfully authenticated common investor via Supabase:', username);
        return investor;
      } catch (error) {
        console.log('Supabase authentication fallback failed:', error instanceof Error ? error.message : String(error));
        return null;
      }
    }

    const investor = await this.getCommonInvestorByUsername(username);
    if (!investor) {
      return null;
    }

    const isValid = await bcrypt.compare(password, investor.password);
    if (!isValid) {
      return null;
    }

    return investor;
  }

  async getCommonInvestorsWithForeclosureSubscription() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock common investors with foreclosure subscription');
      return [];
    }
    return await db.select().from(schema.commonInvestors)
      .where(
        and(
          eq(schema.commonInvestors.isActive, true),
          eq(schema.commonInvestors.hasForeclosureSubscription, true),
          gte(schema.commonInvestors.foreclosureSubscriptionExpiry, new Date())
        )
      );
  }

  // ==================== INSTITUTIONAL INVESTORS ====================
  async getAllInstitutionalInvestors() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock institutional investors data');
      return [];
    }
    return await db.select().from(schema.institutionalInvestors)
      .where(eq(schema.institutionalInvestors.isActive, true));
  }

  async getInstitutionalInvestorById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock institutional investor data');
      return null;
    }
    const result = await db.select().from(schema.institutionalInvestors)
      .where(eq(schema.institutionalInvestors.id, id));
    return result[0] || null;
  }

  async getInstitutionalInvestorByUsername(username: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock institutional investor data for username:', username);
      // Try to use Supabase client as fallback
      try {
        const { data, error } = await supabase
          .from('institutional_investors')
          .select('*')
          .eq('username', username)
          .single();
        
        if (error) {
          console.log('Supabase query failed:', error.message);
          return null;
        }
        
        console.log('Successfully fetched institutional investor from Supabase:', username);
        return data;
      } catch (error) {
        console.log('Supabase fallback failed:', error instanceof Error ? error.message : String(error));
        return null;
      }
    }
    const result = await db.select().from(schema.institutionalInvestors).where(eq(schema.institutionalInvestors.username, username));
    return result[0] || null;
  }

  async getInstitutionalInvestorByEmail(email: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock institutional investor data for email:', email);
      // Try to use Supabase client as fallback
      try {
        const { data, error } = await supabase
          .from('institutional_investors')
          .select('*')
          .eq('email', email)
          .single();
        
        if (error) {
          console.log('Supabase query failed:', error.message);
          return null;
        }
        
        console.log('Successfully fetched institutional investor from Supabase by email:', email);
        return data;
      } catch (error) {
        console.log('Supabase fallback failed:', error instanceof Error ? error.message : String(error));
        return null;
      }
    }
    const result = await db.select().from(schema.institutionalInvestors).where(eq(schema.institutionalInvestors.email, email));
    return result[0] || null;
  }

  async createInstitutionalInvestor(investorData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating institutional investor');
      // Try to use Supabase client as fallback
      try {
        const { data, error } = await supabase
          .from('institutional_investors')
          .insert(investorData)
          .select()
          .single();
        
        if (error) {
          console.log('Supabase insert failed:', error.message);
          return { id: 'demo-institutional-investor-id', ...investorData };
        }
        
        console.log('Successfully created institutional investor in Supabase:', data.id);
        return data;
      } catch (error) {
        console.log('Supabase fallback failed:', error instanceof Error ? error.message : String(error));
        return { id: 'demo-institutional-investor-id', ...investorData };
      }
    }
    const result = await db.insert(schema.institutionalInvestors).values(investorData).returning();
    return result[0];
  }

  async authenticateInstitutionalInvestor(username: string, password: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not authenticating institutional investor');
      // For demo purposes, return a mock investor if username is 'institutional_demo' and password is 'demo123'
      if (username === 'institutional_demo' && password === 'demo123') {
        return {
          id: 'demo-institutional-investor-id',
          username: 'institutional_demo',
          email: 'institutional@example.com',
          personName: 'Demo Institutional',
          institutionName: 'Demo Institution',
          jobTitle: 'Investment Manager',
          workPhone: '(555) 123-4567',
          personalPhone: '(555) 987-6543',
          isActive: true,
          status: 'approved'
        };
      }
      // Also support a generic institutional investor for testing
      if (username === 'institutional' && password === 'institutional123') {
        return {
          id: 'demo-institutional-investor-id-2',
          username: 'institutional',
          email: 'institutional@test.com',
          personName: 'Test Institutional',
          institutionName: 'Test Institution',
          jobTitle: 'Director',
          workPhone: '(555) 555-5555',
          personalPhone: '(555) 444-4444',
          isActive: true,
          status: 'approved'
        };
      }
      
      // Try to authenticate using Supabase client as fallback
      try {
        // First get the investor by username
        const { data: investor, error } = await supabase
          .from('institutional_investors')
          .select('*')
          .eq('username', username)
          .single();
        
        if (error || !investor) {
          console.log('Supabase query failed or investor not found:', error?.message);
          return null;
        }
        
        // Verify password
        const isValid = await bcrypt.compare(password, investor.password);
        if (!isValid) {
          return null;
        }
        
        console.log('Successfully authenticated institutional investor via Supabase:', username);
        return investor;
      } catch (error) {
        console.log('Supabase authentication fallback failed:', error instanceof Error ? error.message : String(error));
        return null;
      }
    }

    const investor = await this.getInstitutionalInvestorByUsername(username);
    if (!investor || !investor.password) {
      return null;
    }

    const isValid = await bcrypt.compare(password, investor.password);
    if (!isValid) {
      return null;
    }

    return investor;
  }

  async updateInstitutionalInvestor(id: string, investorData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating institutional investor');
      return { id, ...investorData };
    }
    const result = await db.update(schema.institutionalInvestors)
      .set({ ...investorData, updatedAt: new Date() })
      .where(eq(schema.institutionalInvestors.id, id))
      .returning();
    return result[0];
  }
  // ==================== FORECLOSURE LISTINGS ====================
  async getAllForeclosureListings() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock foreclosure listings data');
      return [
        {
          id: "f1",
          address: "789 Bronx Ave",
          county: "Bronx",
          neighborhood: "Riverdale",
          borough: "Bronx",
          auctionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          startingBid: "450000",
          assessedValue: "500000",
          propertyType: "Multi-Family",
          beds: 6,
          baths: "4",
          sqft: 3000,
          yearBuilt: 1980,
          description: "Investment property with multiple rental units",
          docketNumber: "09876-54321",
          plaintiff: "Chase Bank",
          defendant: "John Doe",
          attorney: "Smith & Associates",
          attorneyPhone: "(555) 123-4567",
          attorneyEmail: "smith@law.com",
          caseNumber: "CV-2023-12345",
          judgmentAmount: "450000",
          interestRate: "4.5",
          lienPosition: "First",
          propertyCondition: "Good",
          occupancyStatus: "Occupied",
          redemptionPeriodEnd: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
          saleType: "Foreclosure Auction",
          openingBid: "400000",
          minimumBid: "350000",
          depositRequirement: "10%",
          saleTerms: "Cash only",
          propertyImages: ["/placeholder-foreclosure.jpg"],
          legalDescription: "Lot 1, Block 2, Riverdale Section 3",
          parcelNumber: "123456789",
          zoningClassification: "R3-2",
          taxDelinquencyAmount: "15000",
          hoaDues: "350",
          utilities: "Gas, Electric, Water",
          environmentalIssues: "None reported",
          titleStatus: "Clear",
          titleCompany: "Title Experts LLC",
          titleCompanyPhone: "(555) 987-6543",
          titleCompanyEmail: "info@titleexperts.com",
          inspectionReportUrl: "/inspection-report-f1.pdf",
          appraisalReportUrl: "/appraisal-report-f1.pdf",
          propertyDocumentsUrl: "/property-documents-f1.zip",
          notes: "Property in good condition, strong rental history",
          status: "upcoming",
          isActive: true,
          featured: false,
          priorityLevel: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "f2",
          address: "321 Staten Island Way",
          county: "Richmond",
          neighborhood: "St. George",
          borough: "Staten Island",
          auctionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
          startingBid: "380000",
          assessedValue: "420000",
          propertyType: "Single Family",
          beds: 3,
          baths: "2",
          sqft: 1800,
          yearBuilt: 1995,
          description: "Beautiful family home in great neighborhood",
          docketNumber: "12345-67890",
          plaintiff: "Bank of America",
          defendant: "Jane Smith",
          attorney: "Johnson Legal Group",
          attorneyPhone: "(555) 234-5678",
          attorneyEmail: "johnson@legal.com",
          caseNumber: "CV-2023-98765",
          judgmentAmount: "380000",
          interestRate: "3.75",
          lienPosition: "First",
          propertyCondition: "Fair",
          occupancyStatus: "Vacant",
          redemptionPeriodEnd: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
          saleType: "Foreclosure Auction",
          openingBid: "350000",
          minimumBid: "300000",
          depositRequirement: "10%",
          saleTerms: "Cash or approved financing",
          propertyImages: ["/placeholder-foreclosure2.jpg"],
          legalDescription: "Lot 5, Block 1, St. George Heights",
          parcelNumber: "987654321",
          zoningClassification: "R4-1",
          taxDelinquencyAmount: "12000",
          hoaDues: "200",
          utilities: "Electric, Water",
          environmentalIssues: "Asbestos reported",
          titleStatus: "Clouded",
          titleCompany: "Secure Title Services",
          titleCompanyPhone: "(555) 876-5432",
          titleCompanyEmail: "contact@securetitle.com",
          inspectionReportUrl: "/inspection-report-f2.pdf",
          appraisalReportUrl: "/appraisal-report-f2.pdf",
          propertyDocumentsUrl: "/property-documents-f2.zip",
          notes: "Needs some renovation but good bones",
          status: "upcoming",
          isActive: true,
          featured: false,
          priorityLevel: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
    return await db.select().from(schema.foreclosureListings)
      .where(eq(schema.foreclosureListings.isActive, true))
      .orderBy(desc(schema.foreclosureListings.createdAt));
  }

  async getForeclosureListingById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock foreclosure listing data for id:', id);
      return null;
    }
    const result = await db.select().from(schema.foreclosureListings)
      .where(eq(schema.foreclosureListings.id, id));
    return result[0] || null;
  }

  async createForeclosureListing(listingData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating foreclosure listing');
      return { 
        id: 'demo-foreclosure-listing-id', 
        ...listingData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: listingData.isActive !== undefined ? listingData.isActive : true,
        featured: listingData.featured !== undefined ? listingData.featured : false,
        priorityLevel: listingData.priorityLevel !== undefined ? listingData.priorityLevel : 0,
        neighborhood: listingData.neighborhood !== undefined ? listingData.neighborhood : null,
        borough: listingData.borough !== undefined ? listingData.borough : null,
        notes: listingData.notes !== undefined ? listingData.notes : null,
        defendant: listingData.defendant !== undefined ? listingData.defendant : null,
        attorney: listingData.attorney !== undefined ? listingData.attorney : null,
        attorneyPhone: listingData.attorneyPhone !== undefined ? listingData.attorneyPhone : null,
        attorneyEmail: listingData.attorneyEmail !== undefined ? listingData.attorneyEmail : null,
        caseNumber: listingData.caseNumber !== undefined ? listingData.caseNumber : null,
        judgmentAmount: listingData.judgmentAmount !== undefined ? listingData.judgmentAmount : null,
        interestRate: listingData.interestRate !== undefined ? listingData.interestRate : null,
        lienPosition: listingData.lienPosition !== undefined ? listingData.lienPosition : null,
        propertyCondition: listingData.propertyCondition !== undefined ? listingData.propertyCondition : null,
        occupancyStatus: listingData.occupancyStatus !== undefined ? listingData.occupancyStatus : null,
        redemptionPeriodEnd: listingData.redemptionPeriodEnd !== undefined ? listingData.redemptionPeriodEnd : null,
        saleType: listingData.saleType !== undefined ? listingData.saleType : null,
        openingBid: listingData.openingBid !== undefined ? listingData.openingBid : null,
        minimumBid: listingData.minimumBid !== undefined ? listingData.minimumBid : null,
        depositRequirement: listingData.depositRequirement !== undefined ? listingData.depositRequirement : null,
        saleTerms: listingData.saleTerms !== undefined ? listingData.saleTerms : null,
        propertyImages: listingData.propertyImages !== undefined ? listingData.propertyImages : null,
        legalDescription: listingData.legalDescription !== undefined ? listingData.legalDescription : null,
        parcelNumber: listingData.parcelNumber !== undefined ? listingData.parcelNumber : null,
        zoningClassification: listingData.zoningClassification !== undefined ? listingData.zoningClassification : null,
        taxDelinquencyAmount: listingData.taxDelinquencyAmount !== undefined ? listingData.taxDelinquencyAmount : null,
        hoaDues: listingData.hoaDues !== undefined ? listingData.hoaDues : null,
        utilities: listingData.utilities !== undefined ? listingData.utilities : null,
        environmentalIssues: listingData.environmentalIssues !== undefined ? listingData.environmentalIssues : null,
        titleStatus: listingData.titleStatus !== undefined ? listingData.titleStatus : null,
        titleCompany: listingData.titleCompany !== undefined ? listingData.titleCompany : null,
        titleCompanyPhone: listingData.titleCompanyPhone !== undefined ? listingData.titleCompanyPhone : null,
        titleCompanyEmail: listingData.titleCompanyEmail !== undefined ? listingData.titleCompanyEmail : null,
        inspectionReportUrl: listingData.inspectionReportUrl !== undefined ? listingData.inspectionReportUrl : null,
        appraisalReportUrl: listingData.appraisalReportUrl !== undefined ? listingData.appraisalReportUrl : null,
        propertyDocumentsUrl: listingData.propertyDocumentsUrl !== undefined ? listingData.propertyDocumentsUrl : null
      };
    }
    const result = await db.insert(schema.foreclosureListings).values(listingData).returning();
    return result[0];
  }

  async updateForeclosureListing(id: string, listingData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating foreclosure listing');
      return { id, ...listingData };
    }
    const result = await db.update(schema.foreclosureListings)
      .set({ ...listingData, updatedAt: new Date() })
      .where(eq(schema.foreclosureListings.id, id))
      .returning();
    return result[0];
  }

  async deleteForeclosureListing(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not deleting foreclosure listing');
      return { id };
    }
    const result = await db.update(schema.foreclosureListings)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schema.foreclosureListings.id, id))
      .returning();
    return result[0];
  }

  // Toggle foreclosure listing status (active/inactive)
  async toggleForeclosureListingStatus(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not toggling foreclosure listing status');
      // For demo, return a mock result
      return {
        id,
        isActive: false, // Toggle the status
        updatedAt: new Date()
      };
    }
    
    // First, get the current listing to check if it exists
    const existingListing = await db.select()
      .from(schema.foreclosureListings)
      .where(eq(schema.foreclosureListings.id, id));
      
    if (existingListing.length === 0) {
      throw new Error('Foreclosure listing not found');
    }
    
    // Toggle the isActive status
    const currentStatus = existingListing[0].isActive;
    const result = await db.update(schema.foreclosureListings)
      .set({ isActive: !currentStatus, updatedAt: new Date() })
      .where(eq(schema.foreclosureListings.id, id))
      .returning();
      
    return result[0];
  }

  // ==================== BID SERVICE REQUESTS ====================
  
  async createBidServiceRequest(requestData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating bid service request');
      return { id: 'demo-bid-request-id', ...requestData };
    }
    
    try {
      const result = await db.insert(schema.bidServiceRequests).values(requestData).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating bid service request:', error);
      throw error;
    }
  }

  async getAllBidServiceRequests() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock bid service requests');
      return [];
    }
    
    try {
      return await db.select().from(schema.bidServiceRequests)
        .orderBy(desc(schema.bidServiceRequests.createdAt));
    } catch (error) {
      console.error('Error fetching all bid service requests:', error);
      return [];
    }
  }

  async getBidServiceRequestsByLeadId(leadId: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock bid service requests for leadId:', leadId);
      return [];
    }
    
    try {
      return await db.select().from(schema.bidServiceRequests)
        .where(eq(schema.bidServiceRequests.leadId, leadId))
        .orderBy(desc(schema.bidServiceRequests.createdAt));
    } catch (error) {
      console.error('Error fetching bid service requests by leadId:', error);
      return [];
    }
  }

  async getBidServiceRequestById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock bid service request data');
      return null;
    }
    
    try {
      const result = await db.select().from(schema.bidServiceRequests)
        .where(eq(schema.bidServiceRequests.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching bid service request:', error);
      return null;
    }
  }

  async updateBidServiceRequest(id: string, requestData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating bid service request');
      return { id, ...requestData };
    }
    
    try {
      const result = await db.update(schema.bidServiceRequests)
        .set({ ...requestData, updatedAt: new Date() })
        .where(eq(schema.bidServiceRequests.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating bid service request:', error);
      throw error;
    }
  }

  // ==================== INSTITUTIONAL BID TRACKING ====================
  
  async createInstitutionalBidTracking(bidData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating institutional bid tracking');
      return { id: 'demo-bid-id', ...bidData };
    }
    
    try {
      const result = await db.insert(schema.institutionalBidTracking).values(bidData).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating institutional bid tracking:', error);
      throw error;
    }
  }

  async getAllInstitutionalBidTracking() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock institutional bid tracking records');
      return [];
    }
    
    try {
      return await db.select().from(schema.institutionalBidTracking)
        .orderBy(desc(schema.institutionalBidTracking.createdAt));
    } catch (error) {
      console.error('Error fetching all institutional bid tracking records:', error);
      return [];
    }
  }

  async getInstitutionalBidTrackingById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock institutional bid tracking data');
      return null;
    }
    
    try {
      const result = await db.select().from(schema.institutionalBidTracking)
        .where(eq(schema.institutionalBidTracking.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching institutional bid tracking:', error);
      return null;
    }
  }

  async getInstitutionalBidTrackingByInvestorId(investorId: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock institutional bid tracking data for investorId:', investorId);
      return [];
    }
    
    try {
      return await db.select().from(schema.institutionalBidTracking)
        .where(eq(schema.institutionalBidTracking.investorId, investorId))
        .orderBy(desc(schema.institutionalBidTracking.createdAt));
    } catch (error) {
      console.error('Error fetching institutional bid tracking by investorId:', error);
      return [];
    }
  }

  async updateInstitutionalBidTracking(id: string, bidData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating institutional bid tracking');
      return { id, ...bidData };
    }
    
    try {
      const result = await db.update(schema.institutionalBidTracking)
        .set({ ...bidData, updatedAt: new Date() })
        .where(eq(schema.institutionalBidTracking.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating institutional bid tracking:', error);
      throw error;
    }
  }

  // ==================== FORECLOSURE BIDDING ====================
  async createForeclosureBid(bidData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating foreclosure bid');
      return { id: 'demo-bid-id', ...bidData };
    }
    
    try {
      const result = await db.insert(schema.institutionalBidTracking).values(bidData).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating foreclosure bid:', error);
      throw error;
    }
  }

  async getForeclosureBidsByInvestorId(investorId: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock foreclosure bids for investorId:', investorId);
      return [];
    }
    
    try {
      return await db.select().from(schema.institutionalBidTracking)
        .where(eq(schema.institutionalBidTracking.investorId, investorId))
        .orderBy(desc(schema.institutionalBidTracking.createdAt));
    } catch (error) {
      console.error('Error fetching foreclosure bids by investorId:', error);
      return [];
    }
  }

  async getForeclosureBidById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock foreclosure bid data');
      return null;
    }
    
    try {
      const result = await db.select().from(schema.institutionalBidTracking)
        .where(eq(schema.institutionalBidTracking.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching foreclosure bid:', error);
      return null;
    }
  }

  async updateForeclosureBid(id: string, bidData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating foreclosure bid');
      return { id, ...bidData };
    }
    
    try {
      const result = await db.update(schema.institutionalBidTracking)
        .set({ ...bidData, updatedAt: new Date() })
        .where(eq(schema.institutionalBidTracking.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating foreclosure bid:', error);
      throw error;
    }
  }

  // ==================== DELETE METHODS FOR BID SERVICE REQUESTS AND INSTITUTIONAL BID TRACKING ====================
  
  async deleteBidServiceRequest(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not deleting bid service request');
      return { id };
    }
    
    try {
      const result = await db.delete(schema.bidServiceRequests)
        .where(eq(schema.bidServiceRequests.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error deleting bid service request:', error);
      throw error;
    }
  }
  
  async deleteInstitutionalBidTracking(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not deleting institutional bid tracking');
      return { id };
    }
    
    try {
      const result = await db.delete(schema.institutionalBidTracking)
        .where(eq(schema.institutionalBidTracking.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error deleting institutional bid tracking:', error);
      throw error;
    }
  }

  // ==================== OFFERS ====================
  async getAllOffers() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock offers data');
      return [];
    }
    return await db.select().from(schema.offers)
      .orderBy(desc(schema.offers.createdAt));
  }

  async getOfferById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock offer data');
      return null;
    }
    const result = await db.select().from(schema.offers).where(eq(schema.offers.id, id));
    return result[0] || null;
  }

  async getOffersByPropertyId(propertyId: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock offers data for propertyId:', propertyId);
      return [];
    }
    return await db.select().from(schema.offers)
      .where(eq(schema.offers.propertyId, propertyId))
      .orderBy(desc(schema.offers.createdAt));
  }

  async getOffersByBuyerId(buyerId: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock offers data for buyerId:', buyerId);
      return [];
    }
    return await db.select().from(schema.offers)
      .where(eq(schema.offers.buyerLeadId, buyerId))
      .orderBy(desc(schema.offers.createdAt));
  }

  async getOffersByInvestorId(investorId: string, investorType: 'common' | 'institutional') {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock offers data for investorId:', investorId);
      return [];
    }
    
    if (investorType === 'common') {
      return await db.select().from(schema.offers)
        .where(eq(schema.offers.commonInvestorId, investorId))
        .orderBy(desc(schema.offers.createdAt));
    } else {
      return await db.select().from(schema.offers)
        .where(eq(schema.offers.institutionalInvestorId, investorId))
        .orderBy(desc(schema.offers.createdAt));
    }
  }

  async createOffer(offerData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating offer');
      return { id: 'demo-offer-id', ...offerData };
    }
    const result = await db.insert(schema.offers).values(offerData).returning();
    return result[0];
  }

  async updateOffer(id: string, offerData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating offer');
      return { id, ...offerData };
    }
    const result = await db.update(schema.offers)
      .set({ ...offerData, updatedAt: new Date() })
      .where(eq(schema.offers.id, id))
      .returning();
    return result[0];
  }

  // ==================== SUBSCRIPTIONS ====================
  async createSubscriptionRecord(investorId: string, subscriptionData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating subscription record');
      return { id: 'demo-subscription-id', leadId: investorId, ...subscriptionData };
    }
    
    // Update the investor record
    await this.updateCommonInvestor(investorId, {
      hasForeclosureSubscription: true,
      foreclosureSubscriptionExpiry: subscriptionData.expiryDate,
      subscriptionPlan: subscriptionData.planType.toLowerCase()
    });
    
    // Store in foreclosure_subscriptions table
    const result = await db.insert(schema.foreclosureSubscriptions).values({
      leadId: investorId,
      counties: ['ALL'], // Default to all counties
      subscriptionType: subscriptionData.planType,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return result[0];
  }

  async updateSubscriptionStatus(investorId: string, isActive: boolean) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating subscription status');
      return { id: investorId };
    }
    
    // Update the investor record
    const result = await db.update(schema.commonInvestors)
      .set({ 
        hasForeclosureSubscription: isActive,
        updatedAt: new Date()
      })
      .where(eq(schema.commonInvestors.id, investorId))
      .returning();
    
    // Also update any subscription records
    await db.update(schema.foreclosureSubscriptions)
      .set({ 
        isActive: isActive,
        updatedAt: new Date()
      })
      .where(eq(schema.foreclosureSubscriptions.leadId, investorId));
    
    return result[0];
  }

  // ==================== FORECLOSURE SUBSCRIPTION REQUESTS ====================
  async createForeclosureSubscriptionRequest(investorId: string, requestData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating foreclosure subscription request');
      return { id: 'demo-subscription-request-id', leadId: investorId, ...requestData };
    }
    
    // Create a subscription request record
    const result = await db.insert(schema.foreclosureSubscriptions).values({
      leadId: investorId,
      counties: requestData.counties || ['ALL'],
      subscriptionType: requestData.subscriptionType || 'weekly',
      isActive: false, // Not active until approved
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return result[0];
  }

  async getForeclosureSubscriptionRequests() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock foreclosure subscription requests');
      return [];
    }
    
    // Get all subscription requests that are not yet active
    return await db.select().from(schema.foreclosureSubscriptions)
      .where(eq(schema.foreclosureSubscriptions.isActive, false))
      .orderBy(desc(schema.foreclosureSubscriptions.createdAt));
  }

  async getForeclosureSubscriptionRequestById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock foreclosure subscription request');
      return null;
    }
    
    const result = await db.select().from(schema.foreclosureSubscriptions)
      .where(and(
        eq(schema.foreclosureSubscriptions.id, id),
        eq(schema.foreclosureSubscriptions.isActive, false)
      ));
    
    return result[0] || null;
  }

  async approveForeclosureSubscriptionRequest(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not approving foreclosure subscription request');
      return { id };
    }
    
    // Update the subscription request to active
    const result = await db.update(schema.foreclosureSubscriptions)
      .set({ 
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(schema.foreclosureSubscriptions.id, id))
      .returning();
    
    // Also update the investor record to have foreclosure subscription
    if (result[0]) {
      await db.update(schema.commonInvestors)
        .set({ 
          hasForeclosureSubscription: true,
          foreclosureSubscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          subscriptionPlan: result[0].subscriptionType,
          updatedAt: new Date()
        })
        .where(eq(schema.commonInvestors.id, result[0].leadId));
    }
    
    return result[0];
  }

  async rejectForeclosureSubscriptionRequest(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not rejecting foreclosure subscription request');
      return { id };
    }
    
    // Delete the subscription request
    const result = await db.delete(schema.foreclosureSubscriptions)
      .where(eq(schema.foreclosureSubscriptions.id, id))
      .returning();
    
    return result[0];
  }

  // ==================== AUTHENTICATION ====================
  


  // ==================== SESSION MANAGEMENT ====================
  
  // Common Investor Sessions
  async createCommonInvestorSession(investorId: string, sessionToken: string, expiresAt: Date) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating common investor session');
      return { id: 'demo-session-id', investorId, sessionToken, expiresAt, createdAt: new Date() };
    }
    const result = await db.insert(schema.commonInvestorSessions).values({
      investorId,
      sessionToken,
      expiresAt,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  async getCommonInvestorSession(sessionToken: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock common investor session data');
      return null;
    }
    const result = await db.select().from(schema.commonInvestorSessions)
      .where(eq(schema.commonInvestorSessions.sessionToken, sessionToken));
    return result[0] || null;
  }

  async deleteCommonInvestorSession(sessionToken: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not deleting common investor session');
      return;
    }
    await db.delete(schema.commonInvestorSessions)
      .where(eq(schema.commonInvestorSessions.sessionToken, sessionToken));
  }

  async cleanupExpiredSessions() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not cleaning up expired sessions');
      return;
    }
    await db.delete(schema.commonInvestorSessions)
      .where(gte(schema.commonInvestorSessions.expiresAt, new Date()));
  }

  // Institutional Investor Sessions
  async createInstitutionalSession(investorId: string, sessionToken: string, expiresAt: Date) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating institutional session');
      return { id: 'demo-institutional-session-id', investorId, sessionToken, expiresAt, createdAt: new Date() };
    }
    const result = await db.insert(schema.institutionalSessions).values({
      investorId,
      sessionToken,
      expiresAt,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  async getInstitutionalSession(sessionToken: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock institutional session data');
      return null;
    }
    const result = await db.select().from(schema.institutionalSessions)
      .where(eq(schema.institutionalSessions.sessionToken, sessionToken));
    return result[0] || null;
  }

  async deleteInstitutionalSession(sessionToken: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not deleting institutional session');
      return;
    }
    await db.delete(schema.institutionalSessions)
      .where(eq(schema.institutionalSessions.sessionToken, sessionToken));
  }

  // ==================== UTILITY FUNCTIONS ====================
  
  generateSessionToken(): string {
    return randomUUID() + '-' + Date.now();
  }

  generateEmailVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  generatePhoneVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async hashPassword(password: string): Promise<string> {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock hashed password');
      return password; // In demo mode, just return the password as-is
    }
    return await bcrypt.hash(password, 12);
  }

  // ==================== JWT TOKEN FUNCTIONS ====================
  
  /**
   * Generate JWT token for user
   */
  generateJWTToken(user: any, userType: string): string {
    const payload = {
      id: user.id,
      username: user.username || user.email,
      email: user.email,
      userType: userType,
      // Add any other user data you want in the token
    };
    
    // Token expires in 30 days
    const expiresIn = '30d';
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }
  
  /**
   * Verify JWT token
   */
  verifyJWTToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  }
  
  /**
   * Decode JWT token without verification (for debugging)
   */
  decodeJWTToken(token: string): any {
    return jwt.decode(token);
  }

  // ==================== PASSWORD RESET ====================
  
  async createPasswordResetToken(userId: string, userType: string): Promise<string> {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock reset token');
      return 'demo-reset-token';
    }
    
    try {
      const token = this.generateEmailVerificationToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
      
      await db.insert(schema.passwordResetTokens).values({
        userId,
        userType,
        token,
        expiresAt,
        used: false,
        createdAt: new Date()
      });
      
      return token;
    } catch (error) {
      console.error('Error creating password reset token:', error);
      throw error;
    }
  }
  
  async validatePasswordResetToken(token: string): Promise<{ userId: string, userType: string } | null> {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: validating mock reset token');
      if (token === 'demo-reset-token') {
        return { userId: 'demo-user-id', userType: 'common_investor' };
      }
      return null;
    }
    
    try {
      const result = await db.select().from(schema.passwordResetTokens)
        .where(
          and(
            eq(schema.passwordResetTokens.token, token),
            eq(schema.passwordResetTokens.used, false),
            gte(schema.passwordResetTokens.expiresAt, new Date())
          )
        );
      
      if (result.length === 0) {
        return null;
      }
      
      return {
        userId: result[0].userId,
        userType: result[0].userType
      };
    } catch (error) {
      console.error('Error validating password reset token:', error);
      return null;
    }
  }
  
  async invalidatePasswordResetToken(token: string): Promise<void> {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: invalidating mock reset token');
      return;
    }
    
    try {
      await db.update(schema.passwordResetTokens)
        .set({ used: true })
        .where(eq(schema.passwordResetTokens.token, token));
    } catch (error) {
      console.error('Error invalidating password reset token:', error);
    }
  }
  
  async updateCommonInvestorPassword(id: string, newPassword: string): Promise<boolean> {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating common investor password');
      return true;
    }
    
    try {
      const hashedPassword = await this.hashPassword(newPassword);
      await db.update(schema.commonInvestors)
        .set({ 
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          updatedAt: new Date()
        })
        .where(eq(schema.commonInvestors.id, id));
      return true;
    } catch (error) {
      console.error('Error updating common investor password:', error);
      return false;
    }
  }
  
  async updateInstitutionalInvestorPassword(id: string, newPassword: string): Promise<boolean> {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating institutional investor password');
      return true;
    }
    
    try {
      const hashedPassword = await this.hashPassword(newPassword);
      await db.update(schema.institutionalInvestors)
        .set({ 
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          updatedAt: new Date()
        })
        .where(eq(schema.institutionalInvestors.id, id));
      return true;
    } catch (error) {
      console.error('Error updating institutional investor password:', error);
      return false;
    }
  }
  
  async updatePartnerPassword(id: string, newPassword: string): Promise<boolean> {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating partner password');
      return true;
    }
    
    try {
      const hashedPassword = await this.hashPassword(newPassword);
      await db.update(schema.partners)
        .set({ 
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          updatedAt: new Date()
        })
        .where(eq(schema.partners.id, id));
      return true;
    } catch (error) {
      console.error('Error updating partner password:', error);
      return false;
    }
  }
  
  async updateAdminPassword(id: string, newPassword: string): Promise<boolean> {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating admin password');
      return true;
    }
    
    try {
      const hashedPassword = await this.hashPassword(newPassword);
      await db.update(schema.adminUsers)
        .set({ 
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          updatedAt: new Date()
        })
        .where(eq(schema.adminUsers.id, id));
      return true;
    } catch (error) {
      console.error('Error updating admin password:', error);
      return false;
    }
  }

  // ==================== ADMIN USERS ====================
  async getAllAdminUsers() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock admin users data');
      return [];
    }
    return await db.select().from(schema.adminUsers);
  }

  async getAdminUserById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock admin user data');
      return null;
    }
    const result = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.id, id));
    return result[0] || null;
  }

  async getAdminUserByUsername(username: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock admin user data for username:', username);
      // For demo purposes, return a mock admin user if username is 'admin'
      if (username === 'admin') {
        return {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          password: 'admin123', // In real implementation, this would be hashed
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      return null;
    }
    const result = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.username, username));
    return result[0] || null;
  }

  async getAdminUserByEmail(email: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock admin user data for email:', email);
      return null;
    }
    const result = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
    return result[0] || null;
  }

  async authenticateAdmin(username: string, password: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not authenticating admin');
      // For demo purposes, accept 'admin'/'admin123'
      if (username === 'admin' && password === 'admin123') {
        return {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          userType: 'admin'
        };
      }
      return null;
    }

    const admin = await this.getAdminUserByUsername(username);
    if (!admin) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return null;
    }

    return admin;
  }

  async createAdminUser(adminData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating admin user');
      return { id: 'demo-admin-id', ...adminData };
    }
    const result = await db.insert(schema.adminUsers).values(adminData).returning();
    return result[0];
  }

  async updateAdminUser(id: string, adminData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating admin user');
      return { id, ...adminData };
    }
    const result = await db.update(schema.adminUsers)
      .set({ ...adminData, updatedAt: new Date() })
      .where(eq(schema.adminUsers.id, id))
      .returning();
    return result[0];
  }

  // ==================== ADMIN SESSIONS ====================
  async createAdminSession(adminId: string, sessionToken: string, expiresAt: Date) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating admin session');
      return;
    }
    await db.insert(schema.adminSessions).values({
      adminId,
      sessionToken,
      expiresAt,
      createdAt: new Date()
    }).returning();
  }

  async getAdminSession(sessionToken: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock admin session data');
      return null;
    }
    const result = await db.select().from(schema.adminSessions)
      .where(eq(schema.adminSessions.sessionToken, sessionToken));
    return result[0] || null;
  }

  async deleteAdminSession(sessionToken: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not deleting admin session');
      return;
    }
    await db.delete(schema.adminSessions)
      .where(eq(schema.adminSessions.sessionToken, sessionToken));
  }

  // ==================== BLOGS ====================
  async getAllBlogs() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock blogs data');
      return [
        {
          id: "1",
          title: "Understanding New York Real Estate Market Trends",
          excerpt: "An analysis of current market conditions and future predictions for NYC real estate.",
          content: "Full blog content would go here...",
          slug: "ny-real-estate-trends",
          author: "Alex Morgan",
          tags: ["market analysis", "trends", "NYC"],
          published: true,
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          featured: false,
          coverImage: "/placeholder-blog.jpg",
          viewCount: 0
        },
        {
          id: "2",
          title: "Top 10 Investment Opportunities in Brooklyn",
          excerpt: "Discover the most promising neighborhoods for real estate investment in Brooklyn.",
          content: "Full blog content would go here...",
          slug: "brooklyn-investment-opportunities",
          author: "Jamie Chen",
          tags: ["investment", "Brooklyn", "opportunities"],
          published: true,
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          featured: false,
          coverImage: "/placeholder-blog.jpg",
          viewCount: 0
        }
      ];
    }
    return await db.select().from(schema.blogs).orderBy(desc(schema.blogs.createdAt));
  }

  async getBlogById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock blog data for id:', id);
      return null;
    }
    const result = await db.select().from(schema.blogs).where(eq(schema.blogs.id, id));
    return result[0] || null;
  }

  async getBlogBySlug(slug: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock blog data for slug:', slug);
      return null;
    }
    const result = await db.select().from(schema.blogs).where(eq(schema.blogs.slug, slug));
    return result[0] || null;
  }

  async createBlog(blogData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating blog');
      return { id: 'demo-blog-id', ...blogData };
    }
    const result = await db.insert(schema.blogs).values(blogData).returning();
    return result[0];
  }

  async updateBlog(id: string, blogData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating blog');
      return { id, ...blogData };
    }
    const result = await db.update(schema.blogs)
      .set({ ...blogData, updatedAt: new Date() })
      .where(eq(schema.blogs.id, id))
      .returning();
    return result[0];
  }

  async deleteBlog(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not deleting blog');
      return { id };
    }
    const result = await db.delete(schema.blogs).where(eq(schema.blogs.id, id)).returning();
    return result[0];
  }

  // ==================== ADMIN DASHBOARD STATS ====================
  
  async getDashboardStats() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock dashboard stats');
      return {
        totalUsers: 124,
        pendingApprovals: 8,
        activeProperties: 42,
        totalRevenue: 12500
      };
    }
    
    try {
      // Get total users count using the view
      const allUsers = await db.select().from(schema.allUsersView);
      const totalUsers = allUsers.length;
      
      // Get pending approvals (institutional investors with pending status)
      const pendingInstitutionalInvestors = await db.select().from(schema.institutionalInvestors)
        .where(eq(schema.institutionalInvestors.status, 'pending'));
      
      // Get active properties
      const activeProperties = await db.select().from(schema.properties)
        .where(eq(schema.properties.isActive, true));
      
      // Calculate total revenue (simplified - would need more complex logic in real implementation)
      // For now, we'll use a placeholder value based on active properties
      const totalRevenue = activeProperties.length * 300; // $300 per active property
      
      return {
        totalUsers,
        pendingApprovals: pendingInstitutionalInvestors.length,
        activeProperties: activeProperties.length,
        totalRevenue
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return mock data as fallback
      return {
        totalUsers: 124,
        pendingApprovals: 8,
        activeProperties: 42,
        totalRevenue: 12500
      };
    }
  }
  
  async getPendingApprovals() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock pending approvals');
      return [];
    }
    
    try {
      // Get institutional investors with pending status
      const pendingInstitutionalInvestors = await db.select().from(schema.institutionalInvestors)
        .where(eq(schema.institutionalInvestors.status, 'pending'))
        .orderBy(desc(schema.institutionalInvestors.createdAt));
      
      return pendingInstitutionalInvestors;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return [];
    }
  }
  
  async getActivePropertiesCount() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock active properties count');
      return 42;
    }
    
    try {
      const result = await db.select().from(schema.properties)
        .where(eq(schema.properties.isActive, true));
      return result.length;
    } catch (error) {
      console.error('Error fetching active properties count:', error);
      return 42; // Return mock value as fallback
    }
  }
  
  async getTotalRevenue() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock total revenue');
      return 12500;
    }
    
    try {
      // Simplified revenue calculation - in a real implementation, this would be more complex
      // based on actual transactions, subscriptions, etc.
      const activePropertiesCount = await this.getActivePropertiesCount();
      const revenue = activePropertiesCount * 300; // $300 per active property
      
      return revenue;
    } catch (error) {
      console.error('Error calculating total revenue:', error);
      return 12500; // Return mock value as fallback
    }
  }
  
  // ==================== EMAIL CAMPAIGNS ====================
  
  async getAllEmailCampaigns() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock email campaigns');
      return [
        {
          id: '1',
          name: 'Weekly Property Update',
          subject: 'New Properties This Week',
          content: '<p>Check out our latest property listings...</p>',
          recipients: 'all',
          status: 'sent',
          sentAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Foreclosure Alert',
          subject: 'New Foreclosure Listings',
          content: '<p>New foreclosure properties available...</p>',
          recipients: 'institutional_investors',
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
    
    try {
      return await db.select().from(schema.emailCampaigns)
        .orderBy(desc(schema.emailCampaigns.createdAt));
    } catch (error) {
      console.error('Error fetching email campaigns:', error);
      return [];
    }
  }
  
  async getEmailCampaignById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock email campaign for id:', id);
      return null;
    }
    
    try {
      const result = await db.select().from(schema.emailCampaigns)
        .where(eq(schema.emailCampaigns.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching email campaign by id:', error);
      return null;
    }
  }
  
  async createEmailCampaign(campaignData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating email campaign');
      return { id: 'demo-campaign-id', ...campaignData, createdAt: new Date(), updatedAt: new Date() };
    }
    
    try {
      const result = await db.insert(schema.emailCampaigns).values(campaignData).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating email campaign:', error);
      throw error;
    }
  }
  
  async updateEmailCampaign(id: string, campaignData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating email campaign');
      return { id, ...campaignData };
    }
    
    try {
      const result = await db.update(schema.emailCampaigns)
        .set({ ...campaignData, updatedAt: new Date() })
        .where(eq(schema.emailCampaigns.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating email campaign:', error);
      throw error;
    }
  }
  
  async deleteEmailCampaign(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not deleting email campaign');
      return { id };
    }
    
    try {
      const result = await db.delete(schema.emailCampaigns)
        .where(eq(schema.emailCampaigns.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error deleting email campaign:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS ====================
  async getAnalyticsData() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock analytics data');
      return {
        totalUsers: 150,
        totalProperties: 86,
        totalInvestors: 110,
        totalSellers: 24,
        recentActivity: [
          { type: 'new_user', count: 12, date: new Date() },
          { type: 'new_property', count: 5, date: new Date() },
          { type: 'new_investment', count: 3, date: new Date() }
        ],
        revenueData: [
          { month: 'Jan', revenue: 12500 },
          { month: 'Feb', revenue: 18600 },
          { month: 'Mar', revenue: 15400 }
        ]
      };
    }

    try {
      // Get counts for different user types
      const commonInvestors = await db.select({ count: sql<number>`count(*)` }).from(schema.commonInvestors);
      const institutionalInvestors = await db.select({ count: sql<number>`count(*)` }).from(schema.institutionalInvestors);
      const partners = await db.select({ count: sql<number>`count(*)` }).from(schema.partners);
      const properties = await db.select({ count: sql<number>`count(*)` }).from(schema.properties);
      
      // Return analytics data
      return {
        totalUsers: commonInvestors[0].count + institutionalInvestors[0].count + partners[0].count,
        totalProperties: properties[0].count,
        totalInvestors: commonInvestors[0].count + institutionalInvestors[0].count,
        totalSellers: partners[0].count,
        // In a real implementation, you would add more detailed analytics data here
        recentActivity: [],
        revenueData: []
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  async getSecurityAnalytics() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock security analytics data');
      return {
        totalSecurityEvents: 24,
        recentEvents: [
          { type: 'failed_login', count: 8, severity: 'medium' },
          { type: 'suspicious_activity', count: 3, severity: 'high' },
          { type: 'password_reset', count: 13, severity: 'low' }
        ],
        topThreats: [
          { ip: '192.168.1.100', attempts: 15, lastSeen: new Date() },
          { ip: '104.28.29.10', attempts: 8, lastSeen: new Date() }
        ]
      };
    }

    try {
      // In a real implementation, you would query security-related data from the database
      // For now, returning mock data structure
      return {
        totalSecurityEvents: 0,
        recentEvents: [],
        topThreats: []
      };
    } catch (error) {
      console.error('Error fetching security analytics data:', error);
      throw error;
    }
  }
}