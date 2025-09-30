import express from 'express';
import { DatabaseRepository } from './database-repository.ts';
import { NotificationService } from './notification-service.ts';

const router = express.Router();
const db = new DatabaseRepository();

// Middleware to check JWT token
interface AuthenticatedRequest extends express.Request {
  user?: any;
  userType?: 'common_investor' | 'institutional_investor' | 'seller' | 'admin';
}

// JWT Authentication middleware
export const authenticateUser = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    // Get token from header or cookie
    let token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = db.verifyJWTToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach user info to request
    req.user = decoded;
    req.userType = decoded.userType;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// ==================== COMMON INVESTOR ROUTES ====================

// Common Investor Registration
router.post('/investors/register', async (req: express.Request, res: express.Response) => {
  try {
    const { username, password, email, firstName, lastName, phone, subscriptionPlan } = req.body;
    
    // Validation
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false,
        message: 'All required fields must be provided' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if username or email already exists
    const existingUsername = await db.getCommonInvestorByUsername(username);
    const existingEmail = await db.getCommonInvestorByEmail(email);
    
    if (existingUsername) {
      return res.status(400).json({ 
        success: false,
        message: 'Username already exists' 
      });
    }
    
    if (existingEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await db.hashPassword(password);
    
    // Generate verification tokens
    const emailToken = db.generateEmailVerificationToken();
    const phoneCode = db.generatePhoneVerificationCode();

    const investorData = {
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      phone: phone || null,
      isActive: true,
      emailVerified: false,
      emailVerificationToken: emailToken,
      emailVerificationSentAt: new Date(),
      phoneVerified: false,
      phoneVerificationCode: phoneCode,
      phoneVerificationSentAt: new Date(),
      hasForeclosureSubscription: false,
      subscriptionPlan: subscriptionPlan || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const investor = await db.createCommonInvestor(investorData);
    
    // Generate JWT token
    const token = db.generateJWTToken(investor, 'common_investor');

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      user: {
        id: investor.id,
        username: investor.username,
        email: investor.email,
        firstName: investor.firstName,
        lastName: investor.lastName,
        userType: 'common_investor'
      },
      token: token,
      requiresVerification: true
    });

  } catch (error) {
    console.error('Common investor registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed' 
    });
  }
});

// Common Investor Login
router.post('/investors/login', async (req: express.Request, res: express.Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Username and password required' 
      });
    }

    const investor = await db.authenticateCommonInvestor(username, password);
    
    if (!investor) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Safe check for isActive property
    // @ts-ignore
    if (investor && typeof investor === 'object' && 'isActive' in investor && !investor.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is not active' 
      });
    }

    // Generate JWT token
    const token = db.generateJWTToken(investor, 'common_investor');

    // Build user object safely
    const userObject: any = {
      id: investor.id,
      username: investor.username,
      email: investor.email,
      firstName: investor.firstName,
      lastName: investor.lastName,
      userType: 'common_investor'
    };

    // Safely add optional properties
    // @ts-ignore
    userObject.hasForeclosureSubscription = investor.hasForeclosureSubscription || false;
    // @ts-ignore
    userObject.subscriptionPlan = investor.subscriptionPlan || null;

    res.json({
      success: true,
      message: 'Login successful',
      user: userObject,
      token: token
    });

  } catch (error) {
    console.error('Common investor login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed' 
    });
  }
});

// ==================== INSTITUTIONAL INVESTOR ROUTES ====================

// Add multer for file uploads
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images and PDFs only
    if (file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png' || 
        file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  }
});

// Institutional Investor Registration with file upload support
router.post('/institutional/register', upload.single('businessCard'), async (req: express.Request, res: express.Response) => {
  try {
    const { 
      username, password, email, firstName, lastName, phone, 
      companyName, contactPerson, jobTitle, workPhone, personalPhone,
      subscriptionPlan 
    } = req.body;
    
    // Validation
    if (!username || !password || !email || !firstName || !lastName || !companyName) {
      return res.status(400).json({ 
        success: false,
        message: 'All required fields must be provided' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if username or email already exists
    const existingUsername = await db.getInstitutionalInvestorByUsername(username);
    const existingEmail = await db.getInstitutionalInvestorByEmail(email);
    
    if (existingUsername) {
      return res.status(400).json({ 
        success: false,
        message: 'Username already exists' 
      });
    }
    
    if (existingEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await db.hashPassword(password);
    
    // Generate verification tokens
    const emailToken = db.generateEmailVerificationToken();
    const phoneCode = db.generatePhoneVerificationCode();

    // Build investor data
    const investorData: any = {
      username,
      password: hashedPassword,
      email,
      personName: firstName,
      institutionName: companyName,
      jobTitle: jobTitle || '',
      workPhone: workPhone || phone || '',
      personalPhone: personalPhone || '',
      isActive: true,
      emailVerified: false,
      emailVerificationToken: emailToken,
      emailVerificationSentAt: new Date(),
      phoneVerified: false,
      phoneVerificationCode: phoneCode,
      phoneVerificationSentAt: new Date(),
      hasForeclosureSubscription: false,
      subscriptionPlan: subscriptionPlan || null,
      status: 'pending', // Pending approval
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add business card URL if file was uploaded
    if (req.file) {
      investorData.businessCardUrl = `/uploads/${req.file.filename}`;
    }

    const investor = await db.createInstitutionalInvestor(investorData);
    
    // Generate JWT token
    const token = db.generateJWTToken(investor, 'institutional_investor');

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification. Your account is pending approval and requires business card verification.',
      user: {
        id: investor.id,
        username: investor.username,
        email: investor.email,
        firstName: investor.personName,
        lastName: investor.personName,
        institutionName: investor.institutionName,
        userType: 'institutional_investor',
        status: investor.status
      },
      token: token,
      requiresVerification: true
    });

  } catch (error) {
    console.error('Institutional investor registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed' 
    });
  }
});

// Institutional Investor Login
router.post('/institutional/login', async (req: express.Request, res: express.Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Username and password required' 
      });
    }

    const investor = await db.authenticateInstitutionalInvestor(username, password);
    
    if (!investor) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Safe check for isActive property
    // @ts-ignore
    if (investor && typeof investor === 'object' && 'isActive' in investor && !investor.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is not active' 
      });
    }

    // Generate JWT token
    const token = db.generateJWTToken(investor, 'institutional_investor');

    // Build user object safely
    const userObject: any = {
      id: investor.id,
      username: investor.username || investor.email,
      email: investor.email,
      userType: 'institutional_investor',
      firstName: investor.personName || '',
      lastName: investor.personName || '',
      institutionName: investor.institutionName || '',
      jobTitle: investor.jobTitle || '',
      workPhone: investor.workPhone || '',
      personalPhone: investor.personalPhone || '',
      hasForeclosureSubscription: investor.hasForeclosureSubscription || false,
      status: investor.status || 'pending'
    };

    // Add business card URL if it exists
    // @ts-ignore
    if (investor.businessCardUrl) {
      // @ts-ignore
      userObject.businessCardUrl = investor.businessCardUrl;
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: userObject,
      token: token
    });

  } catch (error) {
    console.error('Institutional investor login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed' 
    });
  }
});

// ==================== INSTITUTIONAL INVESTOR FORECLOSURE BIDS ====================

// Submit foreclosure bid (institutional investors)
router.post('/institutional/foreclosure-bids', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // Verify user is an institutional investor
    if (req.userType !== 'institutional_investor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only institutional investors can submit foreclosure bids' 
      });
    }

    const { 
      foreclosureId, 
      bidAmount, 
      maxBidAmount, 
      investmentExperience, 
      preferredContactMethod, 
      timeframe, 
      additionalRequirements 
    } = req.body;
    
    // Validation
    if (!foreclosureId || !bidAmount || !maxBidAmount || !investmentExperience || !preferredContactMethod || !timeframe) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Get foreclosure listing details
    const foreclosure = await db.getForeclosureListingById(foreclosureId);
    if (!foreclosure) {
      return res.status(404).json({ 
        success: false, 
        message: 'Foreclosure listing not found' 
      });
    }

    // Create bid tracking record
    const bidTrackingData = {
      investorId: req.user.id,
      propertyId: foreclosureId,
      propertyAddress: foreclosure.address,
      bidAmount: bidAmount.toString(),
      auctionDate: foreclosure.auctionDate,
      status: 'submitted',
      notes: `Bid submitted: $${bidAmount} (max: $${maxBidAmount})
Experience: ${investmentExperience}
Contact: ${preferredContactMethod}
Timeframe: ${timeframe}
Additional: ${additionalRequirements || 'None'}`
    };

    const bidTracking = await db.createInstitutionalBidTracking(bidTrackingData);

    // In a real implementation, you would also:
    // 1. Send notification to admin
    // 2. Send confirmation to investor
    // 3. Store bid details in a separate table for admin review

    res.status(201).json({
      success: true,
      message: 'Foreclosure bid submitted successfully',
      bidId: bidTracking.id
    });

  } catch (error) {
    console.error('Error submitting foreclosure bid:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit foreclosure bid' 
    });
  }
});

// Get institutional investor's foreclosure bids
router.get('/institutional/foreclosure-bids', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // Verify user is an institutional investor
    if (req.userType !== 'institutional_investor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only institutional investors can view foreclosure bids' 
      });
    }

    const bids = await db.getInstitutionalBidTrackingByInvestorId(req.user.id);

    res.json({
      success: true,
      bids: bids
    });

  } catch (error) {
    console.error('Error fetching foreclosure bids:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch foreclosure bids' 
    });
  }
});

// ==================== PARTNER/SELLER ROUTES ====================

// Partner/Seller Registration
router.post('/partners/register', async (req: express.Request, res: express.Response) => {
  try {
    const { username, password, email, firstName, lastName, company, phone } = req.body;
    
    // Validation
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false,
        message: 'All required fields must be provided' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if username or email already exists
    const existingUsername = await db.getPartnerByUsername(username);
    const existingEmail = await db.getPartnerByEmail(email);
    
    if (existingUsername) {
      return res.status(400).json({ 
        success: false,
        message: 'Username already exists' 
      });
    }
    
    if (existingEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await db.hashPassword(password);
    
    // Generate verification tokens
    const emailToken = db.generateEmailVerificationToken();
    const phoneCode = db.generatePhoneVerificationCode();

    const partnerData = {
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      company: company || null,
      phone: phone || null,
      isActive: true,
      approvalStatus: 'pending',
      emailVerified: false,
      emailVerificationToken: emailToken,
      emailVerificationSentAt: new Date(),
      phoneVerified: false,
      phoneVerificationCode: phoneCode,
      phoneVerificationSentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const partner = await db.createPartner(partnerData);
    
    // Generate JWT token
    const token = db.generateJWTToken(partner, 'seller');

    res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is pending approval.',
      user: {
        id: partner.id,
        username: partner.username,
        email: partner.email,
        firstName: partner.firstName,
        lastName: partner.lastName,
        company: partner.company,
        userType: 'seller'
      },
      token: token,
      requiresApproval: true
    });

  } catch (error) {
    console.error('Partner registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed' 
    });
  }
});

// Partner/Seller Login
router.post('/partners/login', async (req: express.Request, res: express.Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Username and password required' 
      });
    }

    const partner = await db.authenticatePartner(username, password);
    
    if (!partner) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if partner is active
    if (!partner.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is not active' 
      });
    }

    // Check if partner is approved
    if (partner.approvalStatus !== 'approved') {
      return res.status(401).json({ 
        success: false,
        message: 'Account is pending approval' 
      });
    }

    // Generate JWT token
    const token = db.generateJWTToken(partner, 'seller');

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: partner.id,
        username: partner.username,
        email: partner.email,
        firstName: partner.firstName,
        lastName: partner.lastName,
        company: partner.company,
        userType: 'seller'
      },
      token: token
    });

  } catch (error) {
    console.error('Partner login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed' 
    });
  }
});

// ==================== ADMIN ROUTES ====================

// Admin Login
router.post('/admin/login', async (req: express.Request, res: express.Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Username and password required' 
      });
    }

    const admin = await db.authenticateAdmin(username, password);
    
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid admin credentials' 
      });
    }

    // Check if admin is active (safely handle mock data)
    // @ts-ignore
    if ('isActive' in admin && !admin.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is not active' 
      });
    }

    // Generate JWT token
    const token = db.generateJWTToken(admin, 'admin');

    res.json({
      success: true,
      message: 'Admin login successful',
      user: {
        id: admin.id,
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        userType: 'admin'
      },
      token: token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed' 
    });
  }
});

// ==================== PASSWORD RESET ROUTES ====================

// Request password reset
router.post('/request-password-reset', async (req: express.Request, res: express.Response) => {
  try {
    const { email, userType } = req.body;
    
    if (!email || !userType) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and user type are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address' 
      });
    }

    let user = null;
    
    // Find user based on user type
    switch (userType) {
      case 'common_investor':
        user = await db.getCommonInvestorByEmail(email);
        break;
      case 'institutional_investor':
        user = await db.getInstitutionalInvestorByEmail(email);
        break;
      case 'seller':
        user = await db.getPartnerByEmail(email);
        break;
      default:
        return res.status(400).json({ 
          success: false,
          message: 'Invalid user type' 
        });
    }

    // Even if user doesn't exist, return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      });
    }

    // Generate reset token
    const resetToken = await db.createPasswordResetToken(user.id, userType);
    
    // In a real implementation, you would send an email with a link containing the reset token
    // For now, we'll just log it since we're in demo mode
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Password reset link: http://localhost:3000/auth/reset-password?token=${resetToken}&type=${userType}`);

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred. Please try again.' 
    });
  }
});

// Reset password
router.post('/reset-password', async (req: express.Request, res: express.Response) => {
  try {
    const { token, newPassword, userType } = req.body;
    
    if (!token || !newPassword || !userType) {
      return res.status(400).json({ 
        success: false,
        message: 'Token, user type, and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Validate the reset token
    const tokenValidation = await db.validatePasswordResetToken(token);
    
    if (!tokenValidation) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired reset token' 
      });
    }

    const { userId } = tokenValidation;
    
    // Update password based on user type
    let success = false;
    switch (userType) {
      case 'common_investor':
        success = await db.updateCommonInvestorPassword(userId, newPassword);
        break;
      case 'institutional_investor':
        success = await db.updateInstitutionalInvestorPassword(userId, newPassword);
        break;
      case 'seller':
        success = await db.updatePartnerPassword(userId, newPassword);
        break;
      default:
        return res.status(400).json({ 
          success: false,
          message: 'Invalid user type' 
        });
    }

    if (!success) {
      return res.status(500).json({ 
        success: false,
        message: 'Failed to reset password. Please try again.' 
      });
    }

    // Invalidate the token
    await db.invalidatePasswordResetToken(token);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred. Please try again.' 
    });
  }
});

// ==================== COMMON INVESTOR FORECLOSURE BIDS ====================

// Submit foreclosure bid (common investors)
router.post('/investor/foreclosure-bids', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // Verify user is a common investor
    if (req.userType !== 'common_investor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only common investors can submit foreclosure bids' 
      });
    }

    const bidData = req.body;
    
    // Check if investor has active foreclosure subscription
    const investor = await db.getCommonInvestorById(req.user.id);
    if (!investor || !investor.hasForeclosureSubscription || !investor.foreclosureSubscriptionExpiry || new Date(investor.foreclosureSubscriptionExpiry) < new Date()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You need an active foreclosure subscription to submit bids' 
      });
    }

    // Create bid service request
    const bidRequest = {
      leadId: req.user.id, // Using userId as leadId for now
      foreclosureListingId: bidData.foreclosureId,
      name: `${investor.firstName} ${investor.lastName}`,
      email: investor.email,
      phone: investor.phone || '',
      investmentBudget: '', // Will be filled from bidData
      maxBidAmount: bidData.maxBidAmount.toString(),
      investmentExperience: bidData.investmentExperience,
      preferredContactMethod: bidData.preferredContactMethod,
      timeframe: bidData.timeframe,
      additionalRequirements: bidData.additionalRequirements,
      status: 'pending'
    };

    const createdBid = await db.createBidServiceRequest(bidRequest);

    // Send notification to admin
    // await NotificationService.sendNewBidNotification(createdBid);

    res.status(201).json({ 
      success: true, 
      message: 'Foreclosure bid submitted successfully',
      bid: createdBid
    });
  } catch (error) {
    console.error('Error submitting foreclosure bid:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit foreclosure bid' 
    });
  }
});

// Submit foreclosure bid (institutional investors)
router.post('/institutional/foreclosure-bids', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // Verify user is an institutional investor
    if (req.userType !== 'institutional_investor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only institutional investors can submit foreclosure bids' 
      });
    }

    const bidData = req.body;
    
    // Create institutional bid tracking record
    const bidTracking = {
      investorId: req.user.id,
      propertyId: bidData.foreclosureId, // This might be null for foreclosure properties
      propertyAddress: '', // Will be filled from foreclosure listing
      bidAmount: bidData.bidAmount.toString(),
      auctionDate: new Date(), // Will be filled from foreclosure listing
      status: 'submitted',
      notes: `Investment experience: ${bidData.investmentExperience}\nTimeframe: ${bidData.timeframe}\nAdditional requirements: ${bidData.additionalRequirements}`
    };

    const createdBid = await db.createInstitutionalBidTracking(bidTracking);

    // Send notification to admin
    // await NotificationService.sendNewInstitutionalBidNotification(createdBid);

    res.status(201).json({ 
      success: true, 
      message: 'Foreclosure bid submitted successfully',
      bid: createdBid
    });
  } catch (error) {
    console.error('Error submitting institutional foreclosure bid:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit foreclosure bid' 
    });
  }
});

// Get foreclosure listing details (for investors)
router.get('/foreclosures/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const listing = await db.getForeclosureListingById(id);
    
    if (!listing || !listing.isActive) {
      return res.status(404).json({ message: 'Foreclosure listing not found' });
    }
    
    res.json({ listing });
  } catch (error) {
    console.error('Error fetching foreclosure listing:', error);
    res.status(500).json({ message: 'Failed to fetch foreclosure listing' });
  }
});

// Get all active foreclosure listings (for investors)
router.get('/foreclosures', async (req: express.Request, res: express.Response) => {
  try {
    const listings = await db.getAllForeclosureListings();
    res.json(listings);
  } catch (error) {
    console.error('Error fetching foreclosure listings:', error);
    res.status(500).json({ message: 'Failed to fetch foreclosure listings' });
  }
});

// Submit property offer (common investors)
router.post('/investor/offers', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // Verify user is a common investor
    if (req.userType !== 'common_investor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only common investors can submit property offers' 
      });
    }

    const { 
      propertyId, 
      offerAmount, 
      earnestMoney, 
      closingDate, 
      financingType, 
      contingencies, 
      additionalTerms, 
      message 
    } = req.body;
    
    // Validation
    if (!propertyId || !offerAmount || !earnestMoney || !closingDate || !financingType) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Get property details
    const property = await db.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    // Create offer record
    const offerData = {
      propertyId: propertyId,
      commonInvestorId: req.user.id,
      offerAmount: offerAmount,
      downPayment: earnestMoney,
      closingDate: closingDate,
      financingType: financingType,
      contingencies: contingencies ? contingencies.join(',') : '',
      additionalTerms: additionalTerms || '',
      terms: message || '',
      status: 'pending'
    };

    // Create offer record
    const result = await db.createOffer(offerData);

    res.status(201).json({
      success: true,
      message: 'Property offer submitted successfully',
      offerId: result.id
    });

  } catch (error) {
    console.error('Error submitting property offer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit property offer' 
    });
  }
});

// Get common investor's offers
router.get('/investor/offers', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // Verify user is a common investor
    if (req.userType !== 'common_investor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only common investors can view their offers' 
      });
    }

    const offers = await db.getOffersByInvestorId(req.user.id, 'common');

    res.json({
      success: true,
      offers: offers
    });

  } catch (error) {
    console.error('Error fetching property offers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch property offers' 
    });
  }
});

// Get specific offer by ID (common investors)
router.get('/investor/offers/:id', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // Verify user is a common investor
    if (req.userType !== 'common_investor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only common investors can view their offers' 
      });
    }

    const { id } = req.params;
    
    // Get the offer
    const offer = await db.getOfferById(id);
    
    // Verify the offer belongs to this investor
    if (!offer || offer.commonInvestorId !== req.user.id) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer not found' 
      });
    }

    res.json({
      success: true,
      offer: offer
    });

  } catch (error) {
    console.error('Error fetching property offer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch property offer' 
    });
  }
});

// Get common investor's foreclosure bids
router.get('/investor/foreclosure-bids', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // Verify user is a common investor
    if (req.userType !== 'common_investor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only common investors can view foreclosure bids' 
      });
    }

    const bids = await db.getBidServiceRequestsByLeadId(req.user.id);

    res.json({
      success: true,
      bids: bids
    });

  } catch (error) {
    console.error('Error fetching foreclosure bid requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch foreclosure bid requests' 
    });
  }
});

// ==================== INSTITUTIONAL INVESTOR PROPERTY OFFERS ====================

// Submit property offer (institutional investors)
router.post('/institutional/offers', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // Verify user is an institutional investor
    if (req.userType !== 'institutional_investor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only institutional investors can submit property offers' 
      });
    }

    const { 
      propertyId, 
      offerAmount, 
      earnestMoney, 
      closingDate, 
      financingType, 
      contingencies, 
      additionalTerms, 
      message 
    } = req.body;
    
    // Validation
    if (!propertyId || !offerAmount || !earnestMoney || !closingDate || !financingType) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Get property details
    const property = await db.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    // Create offer record
    const offerData = {
      propertyId: propertyId,
      institutionalInvestorId: req.user.id,
      offerAmount: offerAmount,
      downPayment: earnestMoney,
      closingDate: closingDate,
      financingType: financingType,
      contingencies: contingencies ? contingencies.join(',') : '',
      additionalTerms: additionalTerms || '',
      terms: message || '',
      status: 'pending'
    };

    // Create offer record
    const result = await db.createOffer(offerData);

    res.status(201).json({
      success: true,
      message: 'Property offer submitted successfully',
      offerId: result.id
    });

  } catch (error) {
    console.error('Error submitting property offer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit property offer' 
    });
  }
});

// Get institutional investor's offers
router.get('/institutional/offers', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // Verify user is an institutional investor
    if (req.userType !== 'institutional_investor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only institutional investors can view their offers' 
      });
    }

    const offers = await db.getOffersByInvestorId(req.user.id, 'institutional');

    res.json({
      success: true,
      offers: offers
    });

  } catch (error) {
    console.error('Error fetching property offers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch property offers' 
    });
  }
});

// Get specific offer by ID (institutional investors)
router.get('/institutional/offers/:id', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // Verify user is an institutional investor
    if (req.userType !== 'institutional_investor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only institutional investors can view their offers' 
      });
    }

    const { id } = req.params;
    
    // Get the offer
    const offer = await db.getOfferById(id);
    
    // Verify the offer belongs to this investor
    if (!offer || offer.institutionalInvestorId !== req.user.id) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer not found' 
      });
    }

    res.json({
      success: true,
      offer: offer
    });

  } catch (error) {
    console.error('Error fetching property offer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch property offer' 
    });
  }
});

// ==================== SHARED ROUTES ====================

// Logout route (works for all user types)
router.post('/logout', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // With JWT, logout is simply clearing the token on the client side
    // We don't need to delete sessions from the database
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Logout failed' 
    });
  }
});

// Get current user status
router.get('/status', async (req: express.Request, res: express.Response) => {
  try {
    // Get token from header or cookie
    let token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }

    // Verify token
    const decoded = db.verifyJWTToken(token);
    
    if (!decoded) {
      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }

    // Build user object with consistent structure
    const userObject: any = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      userType: decoded.userType
    };

    // Add properties based on user type
    if (decoded.userType === 'institutional_investor') {
      // Institutional investor properties
      userObject.firstName = decoded.firstName || '';
      userObject.lastName = decoded.lastName || '';
      userObject.companyName = decoded.companyName || '';
    } else if (decoded.userType === 'seller') {
      // Partner/Seller properties
      userObject.firstName = decoded.firstName || '';
      userObject.lastName = decoded.lastName || '';
      userObject.company = decoded.company || '';
      userObject.approvalStatus = decoded.approvalStatus || 'pending';
    } else {
      // Common investor properties
      userObject.firstName = decoded.firstName || '';
      userObject.lastName = decoded.lastName || '';
      userObject.hasForeclosureSubscription = decoded.hasForeclosureSubscription || false;
      userObject.subscriptionPlan = decoded.subscriptionPlan || null;
    }

    res.json({
      success: true,
      authenticated: true,
      user: userObject
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Status check failed' 
    });
  }
});

export default router;