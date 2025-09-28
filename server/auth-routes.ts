import express from 'express';
import { DatabaseRepository } from './database-repository.ts';

const router = express.Router();
const db = new DatabaseRepository();

// Middleware to check session
interface AuthenticatedRequest extends express.Request {
  user?: any;
  userType?: 'common_investor' | 'institutional_investor' | 'seller' | 'admin';
}

// Authentication middleware
export const authenticateUser = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const sessionToken = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Try different session types
    let session = await db.getCommonInvestorSession(sessionToken);
    let user = null;
    let userType: 'common_investor' | 'institutional_investor' | 'seller' | 'admin' = 'common_investor';

    if (session && session.expiresAt > new Date()) {
      user = await db.getCommonInvestorById(session.investorId);
      userType = 'common_investor';
    } else {
      // Try institutional investor session
      const instSession = await db.getInstitutionalSession(sessionToken);
      if (instSession && instSession.expiresAt > new Date()) {
        // Check if this is an institutional investor or a partner/seller
        const institutionalInvestor = await db.getInstitutionalInvestorById(instSession.investorId);
        const partner = await db.getPartnerById(instSession.investorId);
        
        if (institutionalInvestor) {
          user = institutionalInvestor;
          userType = 'institutional_investor';
        } else if (partner) {
          user = partner;
          userType = 'seller';
        }
      } else {
        // Try admin session
        const adminSession = await db.getAdminSession(sessionToken);
        if (adminSession && adminSession.expiresAt > new Date()) {
          user = await db.getAdminUserById(adminSession.adminId);
          if (user) {
            userType = 'admin';
          }
        }
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Check if user is active (except for admin users which may not have this property in mock data)
    if (userType !== 'admin' && 'isActive' in user && !user.isActive) {
      return res.status(401).json({ message: 'Account is not active' });
    }

    req.user = user;
    req.userType = userType;
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

    // Create session
    const sessionToken = db.generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await db.createCommonInvestorSession(investor.id, sessionToken, expiresAt);

    // Set cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

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
      user: userObject
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

// Institutional Investor Registration
router.post('/institutional/register', async (req: express.Request, res: express.Response) => {
  try {
    const { 
      username, password, email, firstName, lastName, phone, 
      companyName, contactPerson, address, investmentFocus, 
      minimumInvestment, maximumInvestment, subscriptionPlan 
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

    const investorData = {
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      phone: phone || null,
      companyName,
      contactPerson: contactPerson || null,
      address: address || null,
      investmentFocus: investmentFocus || null,
      minimumInvestment: minimumInvestment || null,
      maximumInvestment: maximumInvestment || null,
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

    const investor = await db.createInstitutionalInvestor(investorData);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      user: {
        id: investor.id,
        username: investor.username,
        email: investor.email,
        firstName: investor.firstName,
        lastName: investor.lastName,
        companyName: investor.companyName,
        userType: 'institutional_investor'
      },
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

    // Create session
    const sessionToken = db.generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await db.createInstitutionalSession(investor.id, sessionToken, expiresAt);

    // Set cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Build user object safely
    const userObject: any = {
      id: investor.id,
      username: investor.username,
      email: investor.email,
      userType: 'institutional_investor'
    };

    // Safely add institutional investor specific properties
    // @ts-ignore
    userObject.firstName = investor.personName || '';
    // @ts-ignore
    userObject.lastName = investor.personName || '';
    // @ts-ignore
    userObject.companyName = investor.institutionName || '';

    res.json({
      success: true,
      message: 'Login successful',
      user: userObject
    });

  } catch (error) {
    console.error('Institutional investor login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed' 
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

    // Create session
    const sessionToken = db.generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // For now, we'll use the institutional session table for partners
    // In a real implementation, we would have a separate partner sessions table
    await db.createInstitutionalSession(partner.id, sessionToken, expiresAt);

    // Set cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

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
      }
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

    // Create session
    const sessionToken = db.generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await db.createAdminSession(admin.id, sessionToken, expiresAt);

    // Set cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      message: 'Admin login successful',
      user: {
        id: admin.id,
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        userType: 'admin'
      }
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

// ==================== SHARED ROUTES ====================

// Logout route (works for all user types)
router.post('/logout', authenticateUser, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const sessionToken = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
    
    if (sessionToken) {
      // Delete session from database based on user type
      if (req.userType === 'institutional_investor' || req.userType === 'seller') {
        await db.deleteInstitutionalSession(sessionToken);
      } else if (req.userType === 'admin') {
        await db.deleteAdminSession(sessionToken);
      } else {
        await db.deleteCommonInvestorSession(sessionToken);
      }
    }

    // Clear cookie
    res.clearCookie('session_token');
    
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
    const sessionToken = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }

    // Try different session types
    let session = await db.getCommonInvestorSession(sessionToken);
    let user = null;
    let userType: 'common_investor' | 'institutional_investor' | 'partner' | 'seller' | 'admin' = 'common_investor';

    if (session && session.expiresAt > new Date()) {
      user = await db.getCommonInvestorById(session.investorId);
      userType = 'common_investor';
    } else {
      // Try institutional investor session
      const instSession = await db.getInstitutionalSession(sessionToken);
      if (instSession && instSession.expiresAt > new Date()) {
        // Check if this is an institutional investor or a partner/seller
        const institutionalInvestor = await db.getInstitutionalInvestorById(instSession.investorId);
        const partner = await db.getPartnerById(instSession.investorId);
        
        if (institutionalInvestor) {
          user = institutionalInvestor;
          userType = 'institutional_investor';
        } else if (partner) {
          user = partner;
          userType = 'seller';
        }
      }
    }

    if (!user) {
      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }

    // Build user object with consistent structure
    const userObject: any = {
      id: user.id,
      username: user.username,
      email: user.email,
      userType: userType
    };

    // Add properties based on user type - using @ts-ignore to bypass TypeScript union type issues
    if (userType === 'institutional_investor') {
      // Institutional investor properties
      // @ts-ignore
      userObject.firstName = user.personName || '';
      // @ts-ignore
      userObject.lastName = user.personName || '';
      // @ts-ignore
      userObject.companyName = user.institutionName || '';
    } else if (userType === 'seller') {
      // Partner/Seller properties
      // @ts-ignore
      userObject.firstName = user.firstName || '';
      // @ts-ignore
      userObject.lastName = user.lastName || '';
      // @ts-ignore
      userObject.company = user.company || '';
      // @ts-ignore
      userObject.approvalStatus = user.approvalStatus || 'pending';
    } else {
      // Common investor properties
      // @ts-ignore
      userObject.firstName = user.firstName || '';
      // @ts-ignore
      userObject.lastName = user.lastName || '';
      // @ts-ignore
      userObject.hasForeclosureSubscription = user.hasForeclosureSubscription || false;
      // @ts-ignore
      userObject.subscriptionPlan = user.subscriptionPlan || null;
    }

    // Add isActive if it exists
    // @ts-ignore
    if ('isActive' in user) {
      // @ts-ignore
      userObject.isActive = user.isActive;
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