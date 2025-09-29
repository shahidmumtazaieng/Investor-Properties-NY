import { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import {
  insertCommonInvestorSchema,
  CommonInvestor,
  InsertCommonInvestor,
  InsertOffer,
  insertOfferSchema,
  InstitutionalInvestor
} from "../shared/schema.js";
import { SaaSStorageExtension } from "./saas-storage.js";
import { DatabaseRepository } from "./database-repository.js";

// Extended Request interface for authenticated users
interface AuthenticatedRequest extends Request {
  user?: CommonInvestor | any;
  userType?: 'common_investor' | 'institutional_investor' | 'partner';
}

// Storage interface for new SaaS features
interface SaaSStorage {
  // Common Investors
  createCommonInvestor(data: InsertCommonInvestor): Promise<CommonInvestor>;
  getCommonInvestorByUsername(username: string): Promise<CommonInvestor | null>;
  getCommonInvestorByEmail(email: string): Promise<CommonInvestor | null>;
  getCommonInvestorById(id: string): Promise<CommonInvestor | null>;
  authenticateCommonInvestor(username: string, password: string): Promise<CommonInvestor | null>;
  updateCommonInvestor(id: string, data: Partial<CommonInvestor>): Promise<CommonInvestor | null>;
  
  // Sessions
  createCommonInvestorSession(investorId: string, sessionToken: string, expiresAt: Date): Promise<void>;
  getCommonInvestorSession(sessionToken: string): Promise<{ investorId: string; expiresAt: Date } | null>;
  deleteCommonInvestorSession(sessionToken: string): Promise<void>;
  
  // Offers
  createOffer(data: InsertOffer): Promise<any>;
  getOffersByInvestor(investorId: string, investorType: 'common' | 'institutional'): Promise<any[]>;
  getOffersByProperty(propertyId: string): Promise<any[]>;
  updateOffer(id: string, data: Partial<any>): Promise<any | null>;
  deleteOffer(id: string): Promise<boolean>;
  
  // Properties (existing)
  getProperties(): Promise<any[]>;
  getProperty(id: string): Promise<any | null>;
  
  // Foreclosures (existing)
  getForeclosureListings(): Promise<any[]>;
  getForeclosureListingsByCounty(county: string): Promise<any[]>;
}

// Initialize SaaS storage extension
let saasStorage: SaaSStorageExtension;
const db = new DatabaseRepository();

// Extend existing storage with new methods
declare global {
  var storage: SaaSStorage;
}

// Utility functions
function generateSessionToken(): string {
  return randomUUID() + '-' + Date.now();
}

function generateEmailVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generatePhoneVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Authentication middleware for common investors
async function authenticateCommonInvestor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const sessionToken = req.cookies?.common_investor_session || req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const session = await saasStorage.getCommonInvestorSession(sessionToken);
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ message: "Session expired" });
    }

    const investor = await saasStorage.getCommonInvestorById(session.investorId);
    if (!investor || !investor.isActive) {
      return res.status(401).json({ message: "Account not active" });
    }

    req.user = investor;
    next();
  } catch (error) {
    console.error("Common investor authentication error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
}

// Import notification and subscription services
import { NotificationService } from "./notification-service.js";
import { SubscriptionService } from "./subscription-service.js";

// SaaS Routes
export function registerSaaSRoutes(app: Express) {
  // Initialize SaaS storage if not already done
  if (!saasStorage) {
    saasStorage = new SaaSStorageExtension();
  }
  
  // Common Investor Registration
  app.post("/api/investors/register", async (req, res) => {
    try {
      const { username, password, email, firstName, lastName, phone, investorType } = req.body;
      
      // Validate investor type
      if (investorType !== 'common') {
        return res.status(400).json({ message: "Invalid investor type" });
      }

      // Check if username or email already exists
      const existingUsername = await saasStorage.getCommonInvestorByUsername(username);
      const existingEmail = await saasStorage.getCommonInvestorByEmail(email);
      
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Generate verification tokens
      const emailToken = generateEmailVerificationToken();
      const phoneCode = generatePhoneVerificationCode();

      const investorData: InsertCommonInvestor = {
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        phone,
        isActive: true,
        emailVerified: false,
        emailVerificationToken: emailToken,
        emailVerificationSentAt: new Date(),
        phoneVerified: false,
        phoneVerificationCode: phoneCode,
        phoneVerificationSentAt: new Date(),
        hasForeclosureSubscription: false,
      };

      const investor = await saasStorage.createCommonInvestor(investorData);

      // In a real implementation, we would send email and SMS verification here
      // For now, we'll just log the tokens for development
      console.log('Email verification token:', emailToken);
      console.log('Phone verification code:', phoneCode);

      res.status(201).json({
        success: true,
        message: "Registration successful. Please check your email and phone for verification codes.",
        investorId: investor.id,
        requiresVerification: true
      });

    } catch (error) {
      console.error("Common investor registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Common Investor Login
  app.post("/api/investors/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const investor = await saasStorage.authenticateCommonInvestor(username, password);
      
      if (!investor) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!investor.isActive) {
        return res.status(401).json({ message: "Account is not active" });
      }

      // Create session
      const sessionToken = generateSessionToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      await saasStorage.createCommonInvestorSession(investor.id, sessionToken, expiresAt);

      // Set cookie
      res.cookie("common_investor_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: investor.id,
          username: investor.username,
          firstName: investor.firstName,
          lastName: investor.lastName,
          email: investor.email,
          hasForeclosureSubscription: investor.hasForeclosureSubscription
        },
        sessionToken,
        expiresAt
      });

    } catch (error) {
      console.error("Common investor login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Common Investor Logout
  app.post("/api/investors/logout", async (req, res) => {
    try {
      const sessionToken = req.cookies?.common_investor_session;
      
      if (sessionToken) {
        await saasStorage.deleteCommonInvestorSession(sessionToken);
      }
      
      res.clearCookie("common_investor_session");
      res.json({ success: true, message: "Logged out successfully" });
      
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Get Properties (Public - for outer layer)
  app.get("/api/public/properties", async (req, res) => {
    try {
      // Use global storage for properties (existing system)
      const properties = await db.getAllProperties();
      // Filter only approved and active properties
      const publicProperties = properties.filter((p: any) => p.isActive && p.status === 'available');
      res.json(publicProperties);
    } catch (error) {
      console.error("Error fetching public properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });
  
  // Add new property with notification
  app.post("/api/properties", async (req, res) => {
    try {
      // Create the property
      const property = await db.createProperty(req.body);
      
      // Send notification to all registered users
      await NotificationService.sendPropertyListingNotification(property);
      
      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  // Get Foreclosure Samples (Public - limited for marketing)
  app.get("/api/public/foreclosures/samples", async (req, res) => {
    try {
      // Use global storage for foreclosures (existing system)
      const foreclosures = await db.getAllForeclosureListings();
      // Return only first 3 as samples for marketing
      const samples = foreclosures.slice(0, 3).map((f: any) => ({
        id: f.id,
        address: f.address,
        county: f.county,
        auctionDate: f.auctionDate,
        startingBid: f.startingBid,
        propertyType: f.propertyType,
        // Hide sensitive details for samples
      }));

      res.json({
        samples,
        totalAvailable: foreclosures.length,
        message: "Subscribe to access full foreclosure listings"
      });
    } catch (error) {
      console.error("Error fetching foreclosure samples:", error);
      res.status(500).json({ message: "Failed to fetch foreclosure samples" });
    }
  });
  
  // Add new foreclosure with notification
  app.post("/api/foreclosures", async (req, res) => {
    try {
      // Create the foreclosure
      const foreclosure = await db.createForeclosureListing(req.body);
      
      // Send notification based on subscription status
      // Institutional investors get free access, common investors need subscription
      await NotificationService.sendForeclosureUpdateNotification(foreclosure);
      
      res.status(201).json(foreclosure);
    } catch (error) {
      console.error("Error creating foreclosure:", error);
      res.status(500).json({ message: "Failed to create foreclosure" });
    }
  });

  // Protected Routes (require authentication)
  
  // Get Full Foreclosures (Protected - requires subscription)
  app.get("/api/investors/foreclosures", authenticateCommonInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const investor = req.user as CommonInvestor;
      
      // Check if investor has foreclosure subscription
      if (!investor.hasForeclosureSubscription || 
          (investor.foreclosureSubscriptionExpiry && investor.foreclosureSubscriptionExpiry < new Date())) {
        return res.status(403).json({ 
          message: "Foreclosure subscription required",
          subscriptionRequired: true 
        });
      }

      const foreclosures = await db.getAllForeclosureListings();
      res.json(foreclosures);
      
    } catch (error) {
      console.error("Error fetching foreclosures:", error);
      res.status(500).json({ message: "Failed to fetch foreclosures" });
    }
  });

  // Create Offer (Protected)
  app.post("/api/investors/offers", authenticateCommonInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const investor = req.user as CommonInvestor;
      const offerData = insertOfferSchema.parse({
        ...req.body,
        commonInvestorId: investor.id
      });

      const offer = await saasStorage.createOffer(offerData);
      res.status(201).json(offer);
      
    } catch (error) {
      console.error("Error creating offer:", error);
      res.status(400).json({ message: "Failed to create offer" });
    }
  });

  // Get Investor's Offers (Protected)
  app.get("/api/investors/offers", authenticateCommonInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const investor = req.user as CommonInvestor;
      const offers = await saasStorage.getOffersByInvestor(investor.id, 'common');
      res.json(offers);

    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  // ==================== INSTITUTIONAL INVESTOR AUTHENTICATION ====================
  
  // Authentication middleware for institutional investors
  async function authenticateInstitutionalInvestor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sessionToken = req.cookies?.institutional_investor_session || req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const session = await db.getInstitutionalSession(sessionToken);
      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ message: "Session expired" });
      }

      const investor = await db.getInstitutionalInvestorById(session.investorId);
      if (!investor || !investor.isActive) {
        return res.status(401).json({ message: "Account not active" });
      }

      req.user = investor as any;
      req.userType = 'institutional_investor';
      next();
    } catch (error) {
      console.error("Institutional investor authentication error:", error);
      res.status(500).json({ message: "Authentication error" });
    }
  }

  // Institutional Investor Login
  app.post("/api/institutional/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const investor = await db.authenticateInstitutionalInvestor(username, password);
      if (!investor) return res.status(401).json({ message: "Invalid credentials" });
      
      if (!investor) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!investor.isActive) {
        return res.status(401).json({ message: "Account is not active" });
      }

      // Create session
      const sessionToken = generateSessionToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      await db.createInstitutionalSession(investor.id, sessionToken, expiresAt);

      // Set cookie
      res.cookie("institutional_investor_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: investor.id,
          username: investor.username || investor.email,
          personName: investor.personName,
          institutionName: investor.institutionName,
          email: investor.email,
          jobTitle: investor.jobTitle,
          workPhone: investor.workPhone,
          personalPhone: investor.personalPhone,
          hasForeclosureSubscription: investor.hasForeclosureSubscription,
          status: investor.status,
          // Include business card URL if it exists
          ...(investor.businessCardUrl && { businessCardUrl: investor.businessCardUrl })
        },
        sessionToken,
        expiresAt
      });

    } catch (error) {
      console.error("Institutional investor login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Institutional Investor Logout
  app.post("/api/institutional/logout", async (req, res) => {
    try {
      const sessionToken = req.cookies?.institutional_investor_session;
      
      if (sessionToken) {
        await db.deleteInstitutionalSession(sessionToken);
      }
      
      res.clearCookie("institutional_investor_session");
      res.json({ success: true, message: "Logged out successfully" });
      
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // ==================== FORECLOSURE SUBSCRIPTION REQUESTS ====================

  // Request foreclosure subscription (Protected)
  app.post("/api/investors/foreclosure-subscription-request", authenticateCommonInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const investor = req.user as CommonInvestor;
      const requestData = req.body;
      
      // Create subscription request
      const request = await db.createForeclosureSubscriptionRequest(investor.id, requestData);
      
      res.status(201).json({ 
        message: "Foreclosure subscription request submitted successfully", 
        request 
      });
      
    } catch (error) {
      console.error("Error creating foreclosure subscription request:", error);
      res.status(500).json({ message: "Failed to submit foreclosure subscription request" });
    }
  });

  // Get investor's foreclosure subscription status
  app.get("/api/investors/foreclosure-subscription-status", authenticateCommonInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const investor = req.user as CommonInvestor;
      
      // Check if investor has active foreclosure subscription
      const hasSubscription = investor.hasForeclosureSubscription;
      const expiryDate = investor.foreclosureSubscriptionExpiry;
      
      res.json({ 
        hasSubscription,
        expiryDate,
        subscriptionPlan: investor.subscriptionPlan
      });
      
    } catch (error) {
      console.error("Error fetching foreclosure subscription status:", error);
      res.status(500).json({ message: "Failed to fetch foreclosure subscription status" });
    }
  });

  // ==================== FORECLOSURE BIDDING ====================

  // Create foreclosure bid (Protected - requires subscription for common investors)
  app.post("/api/investors/foreclosure-bids", authenticateCommonInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const investor = req.user as CommonInvestor;
      
      // Check if investor has foreclosure subscription
      if (!investor.hasForeclosureSubscription || 
          (investor.foreclosureSubscriptionExpiry && investor.foreclosureSubscriptionExpiry < new Date())) {
        return res.status(403).json({ 
          message: "Foreclosure subscription required to place bids",
          subscriptionRequired: true 
        });
      }
      
      const bidData = {
        ...req.body,
        investorId: investor.id
      };
      
      const bid = await db.createForeclosureBid(bidData);
      res.status(201).json(bid);
      
    } catch (error) {
      console.error("Error creating foreclosure bid:", error);
      res.status(500).json({ message: "Failed to create foreclosure bid" });
    }
  });

  // Get investor's foreclosure bids (Protected)
  app.get("/api/investors/foreclosure-bids", authenticateCommonInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const investor = req.user as CommonInvestor;
      const bids = await db.getForeclosureBidsByInvestorId(investor.id);
      res.json(bids);

    } catch (error) {
      console.error("Error fetching foreclosure bids:", error);
      res.status(500).json({ message: "Failed to fetch foreclosure bids" });
    }
  });

  // ==================== INSTITUTIONAL INVESTOR FORECLOSURE LISTINGS ====================

  // Get Full Foreclosures (Protected - no subscription required for institutional investors)
  app.get("/api/institutional/foreclosures", authenticateInstitutionalInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const foreclosures = await db.getAllForeclosureListings();
      res.json(foreclosures);
      
    } catch (error) {
      console.error("Error fetching foreclosures:", error);
      res.status(500).json({ message: "Failed to fetch foreclosures" });
    }
  });

  // ==================== INSTITUTIONAL INVESTOR FORECLOSURE BIDDING ====================

  // Create foreclosure bid (Protected - no subscription required for institutional investors)
  app.post("/api/institutional/foreclosure-bids", authenticateInstitutionalInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const investor = req.user as any;
      
      const bidData = {
        ...req.body,
        investorId: investor.id
      };
      
      const bid = await db.createForeclosureBid(bidData);
      res.status(201).json(bid);
      
    } catch (error) {
      console.error("Error creating foreclosure bid:", error);
      res.status(500).json({ message: "Failed to create foreclosure bid" });
    }
  });

  // Get institutional investor's foreclosure bids (Protected)
  app.get("/api/institutional/foreclosure-bids", authenticateInstitutionalInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const investor = req.user as any;
      const bids = await db.getForeclosureBidsByInvestorId(investor.id);
      res.json(bids);

    } catch (error) {
      console.error("Error fetching foreclosure bids:", error);
      res.status(500).json({ message: "Failed to fetch foreclosure bids" });
    }
  });

  // Seller property management routes
  // These are now handled by the seller portal routes below
  // app.post('/api/sellers/properties', async (req, res) => {
  //   try {
  //     const propertyData = req.body;
  //     // In real implementation, save to database and handle file uploads
  //     const newProperty = {
  //       id: `prop_${Date.now()}`,
  //       ...propertyData,
  //       sellerId: req.session?.userId || 'temp-seller',
  //       status: 'pending',
  //       views: 0,
  //       offers: 0,
  //       createdAt: new Date().toISOString(),
  //       updatedAt: new Date().toISOString()
  //     };
  //
  //     res.json({ message: 'Property submitted for review', propertyId: newProperty.id });
  //   } catch (error) {
  //     res.status(500).json({ message: 'Server error' });
  //   }
  // });
  //
  // app.get('/api/sellers/properties', async (req, res) => {
  //   try {
  //     // Return seller's properties (mock data)
  //     const mockProperties = [
  //       {
  //         id: 'prop_1',
  //         address: '123 Brooklyn Ave',
  //         neighborhood: 'Brooklyn Heights',
  //         borough: 'Brooklyn',
  //         propertyType: 'Condo',
  //         beds: 2,
  //         baths: '2',
  //         sqft: 1200,
  //         price: '750000',
  //         condition: 'Good',
  //         access: 'Immediate',
  //         status: 'approved',
  //         views: 45,
  //         offers: 3,
  //         createdAt: '2024-01-15T10:00:00Z',
  //         images: ['/placeholder-property.jpg'],
  //         description: 'Beautiful condo in prime location'
  //       }
  //     ];
  //     res.json(mockProperties);
  //   } catch (error) {
  //     res.status(500).json({ message: 'Server error' });
  //   }
  // });

  // Payment and subscription routes
  app.post('/api/payments/subscribe', async (req, res) => {
    try {
      const { planId, paymentMethod } = req.body;

      // Mock successful payment processing
      setTimeout(() => {
        res.json({
          success: true,
          message: 'Payment processed successfully',
          subscriptionId: `sub_${Date.now()}`
        });
      }, 2000);
    } catch (error) {
      res.status(500).json({ message: 'Payment processing failed' });
    }
  });

  app.post('/api/subscriptions/activate', async (req, res) => {
    try {
      const { planId, paymentConfirmed } = req.body;

      if (paymentConfirmed) {
        res.json({ message: 'Subscription activated successfully' });
      } else {
        res.status(400).json({ message: 'Payment not confirmed' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ===== ENHANCED FORECLOSURE SUBSCRIPTION ROUTES =====

  // Get current subscription
  app.get('/api/subscriptions/current', authenticateCommonInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const investor = req.user as CommonInvestor;

      // Mock subscription data - replace with actual database queries
      const subscription = {
        id: 'sub_' + Date.now(),
        planId: 'professional_monthly',
        status: 'active',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
        usage: {
          foreclosuresViewed: 45,
          searchesUsed: 23,
          alertsSet: 8,
          exportsUsed: 12,
          apiCallsUsed: 234,
          lastResetDate: new Date().toISOString()
        }
      };

      res.json({ subscription });
    } catch (error) {
      console.error('Get current subscription error:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  });

  // Get all available subscription plans
  app.get('/api/subscriptions/plans', async (req, res) => {
    try {
      const plans = [
        {
          id: 'basic_monthly',
          name: 'Basic Access',
          description: 'Perfect for individual investors getting started',
          price: 49,
          period: 'monthly',
          tier: 'basic',
          features: [
            { name: 'Foreclosure Database Access', included: true, limit: 50 },
            { name: 'Basic Search Filters', included: true },
            { name: 'Email Alerts', included: true, limit: 5 },
            { name: 'Property History', included: true },
            { name: 'Mobile App Access', included: true },
            { name: 'Data Export', included: true, limit: 10 }
          ],
          limits: {
            foreclosureAccess: 50,
            dailySearches: 20,
            propertyAlerts: 5,
            exportLimit: 10,
            apiCalls: 0,
            supportLevel: 'basic'
          }
        },
        {
          id: 'professional_monthly',
          name: 'Professional',
          description: 'For serious investors and small teams',
          price: 99,
          originalPrice: 129,
          period: 'monthly',
          tier: 'professional',
          popular: true,
          features: [
            { name: 'Foreclosure Database Access', included: true, limit: 200 },
            { name: 'Advanced Search Filters', included: true },
            { name: 'Email Alerts', included: true, limit: 25 },
            { name: 'API Access', included: true, limit: 1000 },
            { name: 'Priority Support', included: true },
            { name: 'Advanced Analytics', included: true }
          ],
          limits: {
            foreclosureAccess: 200,
            dailySearches: 100,
            propertyAlerts: 25,
            exportLimit: 50,
            apiCalls: 1000,
            supportLevel: 'priority'
          }
        },
        {
          id: 'enterprise_monthly',
          name: 'Enterprise',
          description: 'For large teams and institutional investors',
          price: 299,
          originalPrice: 399,
          period: 'monthly',
          tier: 'enterprise',
          recommended: true,
          features: [
            { name: 'Foreclosure Database Access', included: true, limit: -1 },
            { name: 'Unlimited Everything', included: true },
            { name: 'Dedicated Account Manager', included: true },
            { name: 'Custom Integrations', included: true },
            { name: 'White-label Options', included: true }
          ],
          limits: {
            foreclosureAccess: -1,
            dailySearches: -1,
            propertyAlerts: -1,
            exportLimit: -1,
            apiCalls: 10000,
            supportLevel: 'dedicated'
          }
        }
      ];

      // Add yearly plans with 20% discount
      const yearlyPlans = plans.map(plan => ({
        ...plan,
        id: plan.id.replace('monthly', 'yearly'),
        price: Math.round(plan.price * 12 * 0.8),
        originalPrice: plan.price * 12,
        period: 'yearly'
      }));

      res.json({ plans: [...plans, ...yearlyPlans] });
    } catch (error) {
      console.error('Get plans error:', error);
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  });

  // Change subscription plan
  app.post('/api/subscriptions/change', authenticateCommonInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const { planId } = req.body;
      const investor = req.user as CommonInvestor;

      if (!planId) {
        return res.status(400).json({ error: 'Plan ID is required' });
      }

      // Mock plan change - replace with actual subscription management
      const updatedSubscription = {
        id: 'sub_' + Date.now(),
        planId,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
        usage: {
          foreclosuresViewed: 0,
          searchesUsed: 0,
          alertsSet: 0,
          exportsUsed: 0,
          apiCallsUsed: 0,
          lastResetDate: new Date().toISOString()
        }
      };

      res.json({
        success: true,
        message: 'Subscription changed successfully',
        subscription: updatedSubscription
      });
    } catch (error) {
      console.error('Change subscription error:', error);
      res.status(500).json({ error: 'Failed to change subscription' });
    }
  });

  // Cancel subscription
  app.post('/api/subscriptions/cancel', authenticateCommonInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const investor = req.user as CommonInvestor;

      // Mock cancellation - replace with actual subscription management
      res.json({
        success: true,
        message: 'Subscription cancelled successfully. Access will continue until the end of your billing period.'
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  });

  // Get subscription usage analytics
  app.get('/api/subscriptions/analytics', authenticateCommonInvestor, async (req: AuthenticatedRequest, res) => {
    try {
      const investor = req.user as CommonInvestor;

      // Mock analytics data - replace with actual usage tracking
      const analytics = {
        currentPeriod: {
          foreclosuresViewed: 45,
          searchesPerformed: 123,
          alertsTriggered: 8,
          dataExported: 12,
          apiCallsMade: 234
        },
        previousPeriod: {
          foreclosuresViewed: 38,
          searchesPerformed: 98,
          alertsTriggered: 6,
          dataExported: 9,
          apiCallsMade: 187
        },
        trends: {
          foreclosureViewsChange: 18.4,
          searchesChange: 25.5,
          alertsChange: 33.3,
          exportsChange: 33.3,
          apiCallsChange: 25.1
        },
        topSearches: [
          'Brooklyn foreclosures',
          'Manhattan condos',
          'Queens multi-family',
          'Bronx single family',
          'Staten Island commercial'
        ],
        averageSessionDuration: '12m 34s',
        mostActiveDay: 'Tuesday',
        mostActiveHour: '2:00 PM'
      };

      res.json({ analytics });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // ===== SELLER PORTAL ROUTES =====

  // Middleware for seller authentication
  const authenticateSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionToken) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Try different session types
      let session = await db.getCommonInvestorSession(sessionToken);
      let user = null;
      let userType: 'common_investor' | 'institutional_investor' | 'partner' = 'common_investor';

      if (session && session.expiresAt > new Date()) {
        user = await db.getCommonInvestorById(session.investorId);
        userType = 'common_investor';
      } else {
        // Try institutional investor session
        const instSession = await db.getInstitutionalSession(sessionToken);
        if (instSession && instSession.expiresAt > new Date()) {
          // Check if this is an institutional investor or a partner
          user = await db.getInstitutionalInvestorById(instSession.investorId);
          if (user) {
            userType = 'institutional_investor';
          } else {
            // Try partner
            user = await db.getPartnerById(instSession.investorId);
            if (user) {
              userType = 'partner';
            }
          }
        }
      }

      if (!user || userType !== 'partner') {
        return res.status(401).json({ error: 'Seller access required' });
      }

      (req as any).seller = user;
      (req as any).userType = userType;
      next();
    } catch (error) {
      console.error('Seller authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  };

  // Get seller properties
  app.get('/api/seller/properties', authenticateSeller, async (req, res) => {
    try {
      const seller = (req as any).seller;

      // Get properties for this seller from the database
      const allProperties = await db.getAllProperties();
      const sellerProperties = allProperties.filter((property: any) => property.partnerId === seller.id);

      res.json({ properties: sellerProperties });
    } catch (error) {
      console.error('Get properties error:', error);
      res.status(500).json({ error: 'Failed to fetch properties' });
    }
  });

  // Get seller offers
  app.get('/api/seller/offers', authenticateSeller, async (req, res) => {
    try {
      const seller = (req as any).seller;

      // Get properties for this seller first
      const allProperties = await db.getAllProperties();
      const sellerProperties = allProperties.filter((property: any) => property.partnerId === seller.id);
      
      // Get offers for these properties
      const propertyIds = sellerProperties.map((prop: any) => prop.id);
      const allOffers = await db.getAllOffers();
      const sellerOffers = allOffers.filter((offer: any) => propertyIds.includes(offer.propertyId));

      res.json({ offers: sellerOffers });
    } catch (error) {
      console.error('Get offers error:', error);
      res.status(500).json({ error: 'Failed to fetch offers' });
    }
  });

  // Get seller stats
  app.get('/api/seller/stats', authenticateSeller, async (req, res) => {
    try {
      const seller = (req as any).seller;

      // Get properties for this seller
      const allProperties = await db.getAllProperties();
      const sellerProperties = allProperties.filter((property: any) => property.partnerId === seller.id);
      
      // Get offers for these properties
      const propertyIds = sellerProperties.map((prop: any) => prop.id);
      const allOffers = await db.getAllOffers();
      const sellerOffers = allOffers.filter((offer: any) => propertyIds.includes(offer.propertyId));

      // Calculate stats
      const totalListings = sellerProperties.length;
      const activeListings = sellerProperties.filter((prop: any) => prop.status === 'available').length;
      const pendingReview = sellerProperties.filter((prop: any) => prop.status === 'pending').length;
      const draftListings = sellerProperties.filter((prop: any) => prop.status === 'draft').length;
      
      const totalOffers = sellerOffers.length;
      const pendingOffers = sellerOffers.filter((offer: any) => offer.status === 'pending').length;
      const acceptedOffers = sellerOffers.filter((offer: any) => offer.status === 'accepted').length;
      
      // Mock values for views and other stats (would need analytics in real implementation)
      const totalViews = sellerProperties.reduce((sum: number, prop: any) => sum + (prop.views || 0), 0);
      const averageOfferAmount = totalOffers > 0 
        ? sellerOffers.reduce((sum: number, offer: any) => sum + parseFloat(offer.offerAmount || 0), 0) / totalOffers 
        : 0;
      
      const stats = {
        totalListings,
        activeListings,
        draftListings,
        pendingReview,
        totalOffers,
        pendingOffers,
        acceptedOffers,
        totalViews,
        averageOfferAmount: Math.round(averageOfferAmount),
        averageDaysOnMarket: 28, // Mock value
        conversionRate: totalListings > 0 ? Math.round((acceptedOffers / totalListings) * 100) : 0
      };

      res.json({ stats });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Respond to offer
  app.post('/api/seller/offers/:offerId/respond', authenticateSeller, async (req, res) => {
    try {
      const { offerId } = req.params;
      const { action, message } = req.body;
      const seller = (req as any).seller;

      // Validate action
      if (!['accept', 'reject', 'counter'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }

      // Get the offer
      const offer = await db.getOfferById(offerId);
      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }

      // Verify the offer is for one of the seller's properties
      const property = await db.getPropertyById(offer.propertyId);
      if (!property || property.partnerId !== seller.id) {
        return res.status(403).json({ error: 'Not authorized to respond to this offer' });
      }

      // Update the offer status
      const updatedOffer = await db.updateOffer(offerId, {
        status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'countered',
        updatedAt: new Date()
      });

      // If accepting an offer, update property status
      if (action === 'accept') {
        await db.updateProperty(offer.propertyId, {
          status: 'under_contract',
          updatedAt: new Date()
        });
      }

      res.json({ success: true, message: `Offer ${action}ed successfully` });
    } catch (error) {
      console.error('Respond to offer error:', error);
      res.status(500).json({ error: 'Failed to respond to offer' });
    }
  });
}
