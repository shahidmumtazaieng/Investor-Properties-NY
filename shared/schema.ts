import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Selling Partners table for partner authentication
export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  company: text("company"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  // Approval workflow fields
  approvalStatus: text("approval_status").notNull().default("pending"), // pending, approved, rejected
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"),
  rejectionReason: text("rejection_reason"),
  // Email verification fields
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationSentAt: timestamp("email_verification_sent_at"),
  emailVerifiedAt: timestamp("email_verified_at"),
  // Phone verification fields
  phoneVerified: boolean("phone_verified").notNull().default(false),
  phoneVerificationCode: text("phone_verification_code"),
  phoneVerificationSentAt: timestamp("phone_verification_sent_at"),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull(),
  neighborhood: text("neighborhood").notNull(),
  borough: text("borough").notNull(),
  propertyType: text("property_type").notNull(),
  beds: integer("beds"),
  baths: decimal("baths"),
  sqft: integer("sqft"),
  units: integer("units"),
  price: decimal("price").notNull(),
  arv: decimal("arv"),
  estimatedProfit: decimal("estimated_profit"),
  capRate: decimal("cap_rate"),
  annualIncome: decimal("annual_income"),
  condition: text("condition"),
  access: text("access").notNull().default("Available with Appointment"),
  images: text("images").array(),
  description: text("description"),
  googleSheetsRowId: text("google_sheets_row_id"), // Track Google Sheets row for updates
  partnerId: varchar("partner_id").references(() => partners.id), // Partner who posted the property
  source: text("source").notNull().default("internal"), // internal, partner, google_sheets
  status: text("status").notNull().default("available"), // available, under_contract, sold
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // seller, buyer
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  source: text("source").notNull(), // website_form, manual_entry
  status: text("status").notNull().default("new"), // new, contacted, qualified, converted, closed
  motivation: text("motivation"),
  timeline: text("timeline"),
  budget: text("budget"),
  preferredAreas: text("preferred_areas").array(),
  experienceLevel: text("experience_level"),
  propertyDetails: jsonb("property_details"), // For seller leads
  notes: text("notes"),
  // Email verification fields
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationSentAt: timestamp("email_verification_sent_at"),
  emailVerifiedAt: timestamp("email_verified_at"),
  // Phone verification fields
  phoneVerified: boolean("phone_verified").notNull().default(false),
  phoneVerificationCode: text("phone_verification_code"),
  phoneVerificationSentAt: timestamp("phone_verification_sent_at"),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});



export const communications = pgTable("communications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  type: text("type").notNull(), // email, sms, call, meeting
  direction: text("direction").notNull(), // inbound, outbound
  subject: text("subject"),
  content: text("content"),
  status: text("status").notNull().default("sent"), // sent, delivered, read, failed
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const foreclosureListings = pgTable("foreclosure_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull(),
  county: text("county").notNull(), // Queens, Brooklyn, Nassau, Suffolk
  auctionDate: timestamp("auction_date").notNull(),
  startingBid: decimal("starting_bid"),
  assessedValue: decimal("assessed_value"),
  propertyType: text("property_type"),
  beds: integer("beds"),
  baths: decimal("baths"),
  sqft: integer("sqft"),
  yearBuilt: integer("year_built"),
  description: text("description"),
  docketNumber: text("docket_number"),
  plaintiff: text("plaintiff"),
  status: text("status").notNull().default("upcoming"), // upcoming, completed, cancelled
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const foreclosureSubscriptions = pgTable("foreclosure_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  counties: text("counties").array().notNull(), // Selected counties
  subscriptionType: text("subscription_type").notNull(), // weekly, instant
  isActive: boolean("is_active").notNull().default(true),
  lastSent: timestamp("last_sent"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertForeclosureSubscriptionSchema = createInsertSchema(foreclosureSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  id: true,
  createdAt: true,
});

export const insertForeclosureListingSchema = createInsertSchema(foreclosureListings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Common Investors table (regular investors)
export const commonInvestors = pgTable("common_investors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  // Email verification fields
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationSentAt: timestamp("email_verification_sent_at"),
  emailVerifiedAt: timestamp("email_verified_at"),
  // Phone verification fields
  phoneVerified: boolean("phone_verified").notNull().default(false),
  phoneVerificationCode: text("phone_verification_code"),
  phoneVerificationSentAt: timestamp("phone_verification_sent_at"),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  // Subscription fields
  hasForeclosureSubscription: boolean("has_foreclosure_subscription").notNull().default(false),
  foreclosureSubscriptionExpiry: timestamp("foreclosure_subscription_expiry"),
  subscriptionPlan: text("subscription_plan"), // monthly, yearly
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertCommonInvestorSchema = createInsertSchema(commonInvestors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Investor Sessions table for common investors
export const commonInvestorSessions = pgTable("common_investor_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investorId: varchar("investor_id").notNull().references(() => commonInvestors.id, { onDelete: "cascade" }),
  sessionToken: varchar("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommonInvestorSessionSchema = createInsertSchema(commonInvestorSessions).omit({
  id: true,
  createdAt: true,
});

// Offers table - updated to support both investor types
export const offers = pgTable("offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id),
  // Support both common and institutional investors
  commonInvestorId: varchar("common_investor_id").references(() => commonInvestors.id),
  institutionalInvestorId: varchar("institutional_investor_id").references(() => institutionalInvestors.id),
  buyerLeadId: varchar("buyer_lead_id").references(() => leads.id), // Optional for backward compatibility
  offerAmount: decimal("offer_amount").notNull(),
  terms: text("terms"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, countered
  offerLetterUrl: text("offer_letter_url"), // Uploaded offer letter document
  proofOfFundsUrl: text("proof_of_funds_url"), // Uploaded proof of funds document
  closingDate: text("closing_date"),
  downPayment: decimal("down_payment"),
  financingType: text("financing_type"), // cash, conventional, fha, etc.
  contingencies: text("contingencies"),
  additionalTerms: text("additional_terms"),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;

export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;
export type Communication = typeof communications.$inferSelect;

export type InsertForeclosureListing = z.infer<typeof insertForeclosureListingSchema>;
export type ForeclosureListing = typeof foreclosureListings.$inferSelect;

export type InsertForeclosureSubscription = z.infer<typeof insertForeclosureSubscriptionSchema>;
export type ForeclosureSubscription = typeof foreclosureSubscriptions.$inferSelect;

export type InsertCommonInvestor = z.infer<typeof insertCommonInvestorSchema>;
export type CommonInvestor = typeof commonInvestors.$inferSelect;

export type InsertCommonInvestorSession = z.infer<typeof insertCommonInvestorSessionSchema>;
export type CommonInvestorSession = typeof commonInvestorSessions.$inferSelect;

// Bid Service Requests table
export const bidServiceRequests = pgTable("bid_service_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  foreclosureListingId: varchar("foreclosure_listing_id").references(() => foreclosureListings.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  investmentBudget: varchar("investment_budget", { length: 100 }),
  maxBidAmount: varchar("max_bid_amount", { length: 100 }),
  investmentExperience: varchar("investment_experience", { length: 50 }),
  preferredContactMethod: varchar("preferred_contact_method", { length: 50 }),
  timeframe: varchar("timeframe", { length: 100 }),
  additionalRequirements: text("additional_requirements"),
  status: varchar("status", { length: 50 }).default("pending"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBidServiceRequestSchema = createInsertSchema(bidServiceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBidServiceRequest = z.infer<typeof insertBidServiceRequestSchema>;
export type BidServiceRequest = typeof bidServiceRequests.$inferSelect;

// Weekly subscribers table for manual follow-up
export const weeklySubscribers = pgTable("weekly_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  counties: text("counties").array().notNull(),
  planType: varchar("plan_type", { length: 50 }).notNull(), // 'weekly' or 'monthly'
  status: varchar("status", { length: 50 }).default("pending"), // 'pending', 'contacted', 'subscribed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  notes: text("notes"),
});

export const insertWeeklySubscriberSchema = createInsertSchema(weeklySubscribers).omit({
  id: true,
  createdAt: true,
});

export type InsertWeeklySubscriber = z.infer<typeof insertWeeklySubscriberSchema>;
export type WeeklySubscriber = typeof weeklySubscribers.$inferSelect;

// Institutional Investors table
export const institutionalInvestors = pgTable("institutional_investors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personName: varchar("person_name").notNull(),
  institutionName: varchar("institution_name").notNull(),
  jobTitle: varchar("job_title").notNull(),
  email: varchar("email").unique().notNull(),
  workPhone: varchar("work_phone").notNull(),
  personalPhone: varchar("personal_phone").notNull(),
  businessCardUrl: varchar("business_card_url"),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  username: varchar("username").unique(),
  password: varchar("password"),
  isActive: boolean("is_active").default(false),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Institutional Investor Sessions table
export const institutionalSessions = pgTable("institutional_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investorId: varchar("investor_id").notNull().references(() => institutionalInvestors.id, { onDelete: "cascade" }),
  sessionToken: varchar("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Institutional Foreclosure Lists table for weekly delivery
export const institutionalForeclosureLists = pgTable("institutional_foreclosure_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekOfDate: timestamp("week_of_date").notNull(),
  properties: jsonb("properties").notNull(), // Array of property objects
  totalProperties: integer("total_properties").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bid Tracking table
export const institutionalBidTracking = pgTable("institutional_bid_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investorId: varchar("investor_id").notNull().references(() => institutionalInvestors.id, { onDelete: "cascade" }),
  propertyId: varchar("property_id"), // Can be null for foreclosure properties
  propertyAddress: varchar("property_address").notNull(),
  bidAmount: varchar("bid_amount").notNull(),
  auctionDate: timestamp("auction_date").notNull(),
  status: varchar("status").notNull().default("submitted"), // submitted, won, lost, pending
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Weekly List Deliveries tracking for institutional investors
export const institutionalWeeklyDeliveries = pgTable("institutional_weekly_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investorId: varchar("investor_id").notNull().references(() => institutionalInvestors.id, { onDelete: "cascade" }),
  foreclosureListId: varchar("foreclosure_list_id").notNull().references(() => institutionalForeclosureLists.id, { onDelete: "cascade" }),
  deliveredAt: timestamp("delivered_at").defaultNow(),
  emailSent: boolean("email_sent").default(false),
});

export const insertInstitutionalInvestorSchema = createInsertSchema(institutionalInvestors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInstitutionalBidTrackingSchema = createInsertSchema(institutionalBidTracking).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInstitutionalForeclosureListSchema = createInsertSchema(institutionalForeclosureLists).omit({
  id: true,
  createdAt: true,
});

export type InstitutionalInvestor = typeof institutionalInvestors.$inferSelect;
export type InsertInstitutionalInvestor = z.infer<typeof insertInstitutionalInvestorSchema>;
export type InstitutionalBidTracking = typeof institutionalBidTracking.$inferSelect;
export type InsertInstitutionalBidTracking = z.infer<typeof insertInstitutionalBidTrackingSchema>;
export type InstitutionalForeclosureList = typeof institutionalForeclosureLists.$inferSelect;
export type InsertInstitutionalForeclosureList = z.infer<typeof insertInstitutionalForeclosureListSchema>;
