import express from 'express';
import { DatabaseRepository } from './database-repository.ts';

const router = express.Router();
const db = new DatabaseRepository();

// Middleware to check session
interface AuthenticatedRequest extends express.Request {
  user?: any;
  userType?: 'common_investor' | 'institutional_investor' | 'partner';
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
    let userType: 'common_investor' | 'institutional_investor' | 'partner' = 'common_investor';

    if (session && session.expiresAt > new Date()) {
      user = await db.getCommonInvestorById(session.investorId);
      userType = 'common_investor';
    } else {
      // Try institutional investor session
      const instSession = await db.getInstitutionalSession(sessionToken);
      if (instSession && instSession.expiresAt > new Date()) {
        user = await db.getInstitutionalInvestorById(instSession.investorId);
        userType = 'institutional_investor';
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired session' });
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

    // For demo purposes, we'll check for a specific admin user
    // In a real application, this would check against admin users in the database
    if (username === 'admin' && password === 'admin123') {
      // Create session
      const sessionToken = db.generateSessionToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      // In a real app, we would save this to an admin sessions table
      // For now, we'll just set the cookie and return success
      
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
          id: 'admin-1',
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          userType: 'admin'
        }
      });
    } else {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid admin credentials' 
      });
    }

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed' 
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
      if (req.userType === 'institutional_investor') {
        await db.deleteInstitutionalSession(sessionToken);
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
    let userType: 'common_investor' | 'institutional_investor' | 'partner' = 'common_investor';

    if (session && session.expiresAt > new Date()) {
      user = await db.getCommonInvestorById(session.investorId);
      userType = 'common_investor';
    } else {
      // Try institutional investor session
      const instSession = await db.getInstitutionalSession(sessionToken);
      if (instSession && instSession.expiresAt > new Date()) {
        user = await db.getInstitutionalInvestorById(instSession.investorId);
        userType = 'institutional_investor';
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