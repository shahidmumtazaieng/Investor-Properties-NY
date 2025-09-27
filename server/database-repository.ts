import { supabase, db } from './database.ts';
import { eq, and, gte, desc } from 'drizzle-orm';
import * as schema from '../shared/schema.ts';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

/**
 * Database Repository - Handles all database operations
 * Provides methods for CRUD operations on all entities
 */
export class DatabaseRepository {
  // ==================== USERS ====================
  async getAllUsers() {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock users data');
      return [];
    }
    return await db.select().from(schema.users);
  }

  async getUserById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock user data');
      return null;
    }
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0] || null;
  }

  async getUserByUsername(username: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock user data for username:', username);
      return null;
    }
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0] || null;
  }

  async createUser(userData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating user');
      return { id: 'demo-user-id', ...userData };
    }
    const result = await db.insert(schema.users).values(userData).returning();
    return result[0];
  }

  async updateUser(id: string, userData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not updating user');
      return { id, ...userData };
    }
    const result = await db.update(schema.users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  // ==================== PROPERTIES ====================
  async getAllProperties() {
    // Handle demo mode
    if (!db) {
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
        },
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
        }
      ];
    }
    return await db.select().from(schema.properties)
      .where(eq(schema.properties.isActive, true))
      .orderBy(desc(schema.properties.createdAt));
  }

  async getPropertyById(id: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock property data for id:', id);
      return null;
    }
    const result = await db.select().from(schema.properties).where(eq(schema.properties.id, id));
    return result[0] || null;
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
    const result = await db.select().from(schema.partners).where(eq(schema.partners.username, username));
    return result[0] || null;
  }

  async createPartner(partnerData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating partner');
      return { id: 'demo-partner-id', ...partnerData };
    }
    const result = await db.insert(schema.partners).values(partnerData).returning();
    return result[0];
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
      return null;
    }
    const result = await db.select().from(schema.commonInvestors).where(eq(schema.commonInvestors.username, username));
    return result[0] || null;
  }

  async createCommonInvestor(investorData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating common investor');
      return { id: 'demo-common-investor-id', ...investorData };
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
      return null;
    }
    const result = await db.select().from(schema.institutionalInvestors)
      .where(eq(schema.institutionalInvestors.username, username));
    return result[0] || null;
  }

  async createInstitutionalInvestor(investorData: any) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not creating institutional investor');
      return { id: 'demo-institutional-investor-id', ...investorData };
    }
    const result = await db.insert(schema.institutionalInvestors).values(investorData).returning();
    return result[0];
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
          auctionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          startingBid: "450000",
          propertyType: "Multi-Family",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "f2",
          address: "321 Staten Island Way",
          county: "Richmond",
          auctionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
          startingBid: "380000",
          propertyType: "Single Family",
          isActive: true,
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
      return { id: 'demo-foreclosure-listing-id', ...listingData };
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

  // ==================== AUTHENTICATION ====================
  
  // Common Investor Authentication
  async getCommonInvestorByEmail(email: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock common investor data for email:', email);
      return null;
    }
    const result = await db.select().from(schema.commonInvestors)
      .where(eq(schema.commonInvestors.email, email));
    return result[0] || null;
  }

  async authenticateCommonInvestor(username: string, password: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not authenticating common investor');
      // For demo purposes, return a mock user if username is 'demo'
      if (username === 'demo') {
        return {
          id: 'demo-user-id',
          username: 'demo',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          userType: 'common_investor'
        };
      }
      return null;
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

  // Institutional Investor Authentication
  async getInstitutionalInvestorByEmail(email: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock institutional investor data for email:', email);
      return null;
    }
    const result = await db.select().from(schema.institutionalInvestors)
      .where(eq(schema.institutionalInvestors.email, email));
    return result[0] || null;
  }

  async authenticateInstitutionalInvestor(username: string, password: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not authenticating institutional investor');
      return null;
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

  // Partner Authentication
  async getPartnerByEmail(email: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: returning mock partner data for email:', email);
      return null;
    }
    const result = await db.select().from(schema.partners)
      .where(eq(schema.partners.email, email));
    return result[0] || null;
  }

  async authenticatePartner(username: string, password: string) {
    // Handle demo mode
    if (!db) {
      console.log('Demo mode: not authenticating partner');
      return null;
    }

    const partner = await this.getPartnerByUsername(username);
    if (!partner) {
      return null;
    }

    const isValid = await bcrypt.compare(password, partner.password);
    if (!isValid) {
      return null;
    }

    return partner;
  }

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

  // ==================== PASSWORD RESET ====================
  
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
          updatedAt: new Date()
        })
        .where(eq(schema.partners.id, id));
      return true;
    } catch (error) {
      console.error('Error updating partner password:', error);
      return false;
    }
  }
}