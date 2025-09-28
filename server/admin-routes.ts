import express from 'express';
import { DatabaseRepository } from './database-repository.ts';
import { NotificationService } from './notification-service.ts';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join('uploads', 'blog-images');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Configure multer for property file uploads
const propertyFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join('uploads', 'property-files');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const propertyFileUpload = multer({ 
  storage: propertyFileStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only Excel and CSV files
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'));
    }
  }
});

const router = express.Router();
const db = new DatabaseRepository();

// Middleware to check if user is admin
interface AdminRequest extends express.Request {
  user?: any;
}

export const authenticateAdmin = async (req: AdminRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const sessionToken = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Try different session types to find admin user
    let session = await db.getCommonInvestorSession(sessionToken);
    let user = null;

    if (session && session.expiresAt > new Date()) {
      user = await db.getCommonInvestorById(session.investorId);
      // Check if user is admin (in a real app, this would be a proper admin check)
      if (user && user.username === 'admin') {
        req.user = user;
        return next();
      }
    } else {
      // Try institutional investor session
      const instSession = await db.getInstitutionalSession(sessionToken);
      if (instSession && instSession.expiresAt > new Date()) {
        user = await db.getInstitutionalInvestorById(instSession.investorId);
        // Check if user is admin
        if (user && user.username === 'admin') {
          req.user = user;
          return next();
        }
      }
    }

    return res.status(403).json({ message: 'Admin access required' });
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Admin dashboard stats
router.get('/dashboard/stats', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    // Mock data for dashboard stats
    const stats = {
      totalUsers: 124,
      pendingApprovals: 8,
      activeProperties: 42,
      totalRevenue: 12500
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

// Get all users
router.get('/users', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    // Fetch all users from different tables
    const commonInvestors = await db.getAllCommonInvestors();
    const institutionalInvestors = await db.getAllInstitutionalInvestors();
    const partners = await db.getAllPartners();
    const adminUsers = await db.getAllAdminUsers();
    
    // Transform data to match frontend expectations
    const users = [
      ...commonInvestors.map(investor => ({
        id: investor.id,
        username: investor.username,
        email: investor.email,
        firstName: investor.firstName,
        lastName: investor.lastName,
        userType: 'common_investor',
        status: investor.isActive ? 'active' : 'suspended',
        createdAt: investor.createdAt?.toISOString() || new Date().toISOString()
      })),
      ...institutionalInvestors.map(investor => ({
        id: investor.id,
        username: investor.username || investor.email,
        email: investor.email,
        firstName: investor.personName,
        lastName: '',
        userType: 'institutional_investor',
        status: investor.isActive ? 'active' : 'suspended',
        createdAt: investor.createdAt?.toISOString() || new Date().toISOString()
      })),
      ...partners.map(partner => ({
        id: partner.id,
        username: partner.username,
        email: partner.email,
        firstName: partner.firstName,
        lastName: partner.lastName,
        userType: 'seller',
        status: partner.isActive ? 'active' : 'suspended',
        createdAt: partner.createdAt?.toISOString() || new Date().toISOString()
      })),
      ...adminUsers.map((admin: any) => ({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        userType: 'admin',
        status: admin.isActive ? 'active' : 'suspended',
        createdAt: admin.createdAt?.toISOString() || new Date().toISOString()
      }))
    ];
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/users/:id', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // Try to find user in different tables
    let user = null;
    let userType = '';
    
    // Check common investors
    const commonInvestor = await db.getCommonInvestorById(id);
    if (commonInvestor) {
      user = commonInvestor;
      userType = 'common_investor';
    } else {
      // Check institutional investors
      const institutionalInvestor = await db.getInstitutionalInvestorById(id);
      if (institutionalInvestor) {
        user = institutionalInvestor;
        userType = 'institutional_investor';
      } else {
        // Check partners
        const partner = await db.getPartnerById(id);
        if (partner) {
          user = partner;
          userType = 'seller';
        } else {
          // Check admin users
          const adminUser = await db.getAdminUserById(id);
          if (adminUser) {
            user = adminUser;
            userType = 'admin';
          }
        }
      }
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Transform data to match frontend expectations
    const userData: any = {
      id: user.id,
      username: user.username || (userType === 'institutional_investor' ? user.email : user.username),
      email: user.email,
      firstName: userType === 'institutional_investor' ? (user as any).personName : (user as any).firstName,
      lastName: userType === 'institutional_investor' ? '' : ((user as any).lastName || ''),
      userType: userType,
      status: (user as any).isActive !== undefined ? ((user as any).isActive ? 'active' : 'suspended') : 'active',
      createdAt: (user as any).createdAt?.toISOString() || new Date().toISOString()
    };
    
    // Add admin-specific fields
    if (userType === 'admin' && 'lastLoginAt' in user) {
      userData.lastLoginAt = (user as any).lastLoginAt?.toISOString() || null;
    }
    
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Update user
router.put('/users/:id', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    
    // Try to find user in different tables
    let user = null;
    let userType = '';
    
    // Check common investors
    const commonInvestor = await db.getCommonInvestorById(id);
    if (commonInvestor) {
      user = commonInvestor;
      userType = 'common_investor';
    } else {
      // Check institutional investors
      const institutionalInvestor = await db.getInstitutionalInvestorById(id);
      if (institutionalInvestor) {
        user = institutionalInvestor;
        userType = 'institutional_investor';
      } else {
        // Check partners
        const partner = await db.getPartnerById(id);
        if (partner) {
          user = partner;
          userType = 'seller';
        } else {
          // Check admin users
          const adminUser = await db.getAdminUserById(id);
          if (adminUser) {
            user = adminUser;
            userType = 'admin';
          }
        }
      }
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user based on type
    let updatedUser;
    if (userType === 'common_investor') {
      updatedUser = await db.updateCommonInvestor(id, {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: userData.status === 'active'
      });
    } else if (userType === 'institutional_investor') {
      updatedUser = await db.updateInstitutionalInvestor(id, {
        username: userData.username,
        email: userData.email,
        personName: userData.firstName,
        isActive: userData.status === 'active'
      });
    } else if (userType === 'seller') {
      updatedUser = await db.updatePartner(id, {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: userData.status === 'active'
      });
    } else if (userType === 'admin') {
      updatedUser = await db.updateAdminUser(id, {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: userData.status === 'active'
      });
    }
    
    res.json({ 
      success: true, 
      message: `User ${id} updated successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user' 
    });
  }
});

// Delete user
router.delete('/users/:id', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // Try to find user in different tables
    let user = null;
    let userType = '';
    
    // Check common investors
    const commonInvestor = await db.getCommonInvestorById(id);
    if (commonInvestor) {
      user = commonInvestor;
      userType = 'common_investor';
    } else {
      // Check institutional investors
      const institutionalInvestor = await db.getInstitutionalInvestorById(id);
      if (institutionalInvestor) {
        user = institutionalInvestor;
        userType = 'institutional_investor';
      } else {
        // Check partners
        const partner = await db.getPartnerById(id);
        if (partner) {
          user = partner;
          userType = 'seller';
        } else {
          // Check admin users
          const adminUser = await db.getAdminUserById(id);
          if (adminUser) {
            user = adminUser;
            userType = 'admin';
          }
        }
      }
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user based on type (set inactive instead of actual delete)
    if (userType === 'common_investor') {
      await db.updateCommonInvestor(id, { isActive: false });
    } else if (userType === 'institutional_investor') {
      await db.updateInstitutionalInvestor(id, { isActive: false });
    } else if (userType === 'seller') {
      await db.updatePartner(id, { isActive: false });
    } else if (userType === 'admin') {
      await db.updateAdminUser(id, { isActive: false });
    }
    
    res.json({ 
      success: true, 
      message: `User ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user' 
    });
  }
});

// Create admin user
router.post('/users/admin', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const adminData = req.body;
    
    // Hash password
    const hashedPassword = await db.hashPassword(adminData.password);
    
    // Create admin user
    const newAdmin = await db.createAdminUser({
      username: adminData.username,
      email: adminData.email,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      password: hashedPassword,
      isActive: adminData.status === 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Admin user created successfully',
      user: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        userType: 'admin',
        status: newAdmin.isActive ? 'active' : 'suspended',
        createdAt: newAdmin.createdAt?.toISOString() || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create admin user' 
    });
  }
});

// Get all properties
router.get('/properties', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    // Mock property data
    const properties = [
      {
        id: '1',
        address: '123 Brooklyn Ave',
        neighborhood: 'Park Slope',
        borough: 'Brooklyn',
        propertyType: 'Condo',
        price: '750000',
        seller: 'John Doe',
        status: 'pending',
        submittedAt: '2023-04-15'
      },
      {
        id: '2',
        address: '456 Queens Blvd',
        neighborhood: 'Long Island City',
        borough: 'Queens',
        propertyType: 'Single Family',
        price: '650000',
        seller: 'Jane Smith',
        status: 'pending',
        submittedAt: '2023-04-18'
      },
      {
        id: '3',
        address: '789 Manhattan St',
        neighborhood: 'Chelsea',
        borough: 'Manhattan',
        propertyType: 'Townhouse',
        price: '1200000',
        seller: 'Bob Johnson',
        status: 'approved',
        submittedAt: '2023-04-10'
      }
    ];
    
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// Create new property
router.post('/properties', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const propertyData = req.body;
    
    // Validate required fields
    const requiredFields = ['address', 'neighborhood', 'borough', 'propertyType', 'price'];
    for (const field of requiredFields) {
      if (!propertyData[field]) {
        return res.status(400).json({ 
          success: false, 
          message: `${field} is required` 
        });
      }
    }
    
    // In a real implementation, this would save to the database
    // For now, we'll return a mock response
    const newProperty = {
      id: Date.now().toString(),
      ...propertyData,
      status: 'available',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Send notification to all registered users
    try {
      await NotificationService.sendPropertyListingNotification(newProperty);
    } catch (notificationError) {
      console.error('Failed to send property listing notification:', notificationError);
      // Don't fail the request if notification fails
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Property created successfully',
      property: newProperty
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create property' 
    });
  }
});

// Update property
router.put('/properties/:id', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const propertyData = req.body;
    
    // In a real implementation, this would update the database
    // For now, we'll return a mock response
    const updatedProperty = {
      id,
      ...propertyData,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ 
      success: true, 
      message: `Property ${id} updated successfully`,
      property: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update property' 
    });
  }
});

// Delete property
router.delete('/properties/:id', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would delete from the database
    // For now, we'll return a mock response
    res.json({ 
      success: true, 
      message: `Property ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete property' 
    });
  }
});

// Toggle property active status
router.post('/properties/:id/toggle', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would toggle the isActive status in the database
    // For now, we'll return a mock response
    res.json({ 
      success: true, 
      message: `Property ${id} status toggled successfully`
    });
  } catch (error) {
    console.error('Error toggling property status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle property status' 
    });
  }
});

// Send notification for property listing
router.post('/properties/:id/notify', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would fetch the property from the database
    // For now, we'll use mock data with proper types
    const property: any = {
      id,
      address: '123 Brooklyn Ave',
      neighborhood: 'Park Slope',
      borough: 'Brooklyn',
      propertyType: 'Condo',
      beds: 2,
      baths: '2',
      sqft: 1200,
      units: null,
      price: '750000',
      arv: '850000',
      estimatedProfit: '75000',
      capRate: null,
      annualIncome: null,
      condition: null,
      access: 'Available with Appointment',
      images: ['/placeholder-property.jpg'],
      description: 'Beautiful condo in prime Brooklyn location with modern amenities.',
      googleSheetsRowId: null,
      partnerId: null,
      source: 'internal',
      status: 'available',
      isActive: true,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    };
    
    // Send notification to all registered users
    try {
      await NotificationService.sendPropertyListingNotification(property);
      res.json({ 
        success: true, 
        message: 'Notification sent successfully to all registered users'
      });
    } catch (notificationError) {
      console.error('Failed to send property listing notification:', notificationError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send notification' 
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send notification' 
    });
  }
});

// Import properties from Google Sheets
router.post('/properties/import/google-sheets', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { sheetUrl } = req.body;
    
    // Validate Google Sheets URL
    if (!sheetUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google Sheets URL is required' 
      });
    }
    
    // In a real implementation, this would connect to Google Sheets API and import data
    // For now, we'll return a mock response
    const importedProperties = [
      {
        address: '789 Manhattan St',
        neighborhood: 'Chelsea',
        borough: 'Manhattan',
        propertyType: 'Townhouse',
        beds: 4,
        baths: '3.5',
        sqft: 2200,
        price: '1200000',
        description: 'Luxury townhouse in the heart of Chelsea.'
      },
      {
        address: '321 Bronx Ave',
        neighborhood: 'Riverdale',
        borough: 'Bronx',
        propertyType: 'Multi-Family',
        beds: 6,
        baths: '4',
        sqft: 3000,
        price: '850000',
        description: 'Investment property with multiple rental units.'
      }
    ];
    
    res.json({ 
      success: true, 
      message: `${importedProperties.length} properties imported successfully`,
      properties: importedProperties
    });
  } catch (error) {
    console.error('Error importing properties from Google Sheets:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to import properties from Google Sheets' 
    });
  }
});

// Import properties from uploaded file
router.post('/properties/import/file', authenticateAdmin, propertyFileUpload.single('file'), async (req: AdminRequest, res: express.Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file provided' 
      });
    }

    // Parse the file based on its type
    let properties: any[] = [];
    
    if (req.file.mimetype === 'text/csv') {
      // Handle CSV file
      const csv = fs.readFileSync(req.file.path, 'utf8');
      const lines = csv.split('\n');
      if (lines.length > 1) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const property: any = {};
            headers.forEach((header, index) => {
              property[header] = values[index] || '';
            });
            properties.push(property);
          }
        }
      }
    } else {
      // Handle Excel file
      const workbook = XLSX.readFile(req.file.path);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      properties = XLSX.utils.sheet_to_json(worksheet);
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ 
      success: true, 
      message: `${properties.length} properties imported successfully`,
      properties
    });
  } catch (error) {
    console.error('Error importing properties from file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to import properties from file' 
    });
  }
});

// Publish imported properties
router.post('/properties/import/publish', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { properties } = req.body;
    
    // Validate properties array
    if (!Array.isArray(properties) || properties.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Properties array is required and cannot be empty' 
      });
    }
    
    // In a real implementation, this would save all properties to the database
    // For now, we'll return a mock response
    const publishedProperties = properties.map((prop: any, index: number) => ({
      id: `imported-${Date.now()}-${index}`,
      ...prop,
      status: 'available',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    res.json({ 
      success: true, 
      message: `${publishedProperties.length} properties published successfully`,
      properties: publishedProperties
    });
  } catch (error) {
    console.error('Error publishing imported properties:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to publish imported properties' 
    });
  }
});

// Approve property
router.post('/properties/:id/approve', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // Mock property approval
    res.json({ 
      success: true, 
      message: `Property ${id} approved successfully`,
      propertyId: id,
      status: 'approved'
    });
  } catch (error) {
    console.error('Error approving property:', error);
    res.status(500).json({ message: 'Failed to approve property' });
  }
});

// Reject property
router.post('/properties/:id/reject', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // Mock property rejection
    res.json({ 
      success: true, 
      message: `Property ${id} rejected successfully`,
      propertyId: id,
      status: 'rejected'
    });
  } catch (error) {
    console.error('Error rejecting property:', error);
    res.status(500).json({ message: 'Failed to reject property' });
  }
});

// Get security events
router.get('/security/events', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    // Mock security events
    const events = [
      {
        id: '1',
        type: 'failed_login',
        user: 'johndoe',
        ip: '192.168.1.100',
        location: 'New York, NY',
        timestamp: '2023-04-15T14:30:00Z',
        status: 'pending'
      },
      {
        id: '2',
        type: 'login',
        user: 'adminuser',
        ip: '192.168.1.50',
        location: 'New York, NY',
        timestamp: '2023-04-15T12:15:00Z',
        status: 'resolved'
      },
      {
        id: '3',
        type: 'suspicious_activity',
        user: 'seller123',
        ip: '104.28.29.10',
        location: 'Unknown',
        timestamp: '2023-04-15T10:45:00Z',
        status: 'investigating'
      },
      {
        id: '4',
        type: 'password_reset',
        user: 'janedoe',
        ip: '192.168.1.75',
        location: 'Brooklyn, NY',
        timestamp: '2023-04-15T09:20:00Z',
        status: 'resolved'
      }
    ];
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({ message: 'Failed to fetch security events' });
  }
});

// Resolve security event
router.post('/security/events/:id/resolve', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // Mock event resolution
    res.json({ 
      success: true, 
      message: `Security event ${id} resolved successfully`,
      eventId: id,
      status: 'resolved'
    });
  } catch (error) {
    console.error('Error resolving security event:', error);
    res.status(500).json({ message: 'Failed to resolve security event' });
  }
});

// Get all foreclosure listings
router.get('/foreclosures', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const foreclosures = await db.getAllForeclosureListings();
    res.json(foreclosures);
  } catch (error) {
    console.error('Error fetching foreclosure listings:', error);
    res.status(500).json({ message: 'Failed to fetch foreclosure listings' });
  }
});

// Create new foreclosure listing
router.post('/foreclosures', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const foreclosureData = req.body;
    
    // Validate required fields
    const requiredFields = ['address', 'county', 'auctionDate', 'startingBid', 'propertyType'];
    for (const field of requiredFields) {
      if (!foreclosureData[field]) {
        return res.status(400).json({ 
          success: false, 
          message: `${field} is required` 
        });
      }
    }
    
    const newForeclosure = await db.createForeclosureListing({
      address: foreclosureData.address,
      county: foreclosureData.county,
      neighborhood: foreclosureData.neighborhood,
      borough: foreclosureData.borough,
      auctionDate: foreclosureData.auctionDate,
      startingBid: foreclosureData.startingBid,
      assessedValue: foreclosureData.assessedValue,
      propertyType: foreclosureData.propertyType,
      beds: foreclosureData.beds,
      baths: foreclosureData.baths,
      sqft: foreclosureData.sqft,
      yearBuilt: foreclosureData.yearBuilt,
      description: foreclosureData.description,
      docketNumber: foreclosureData.docketNumber,
      plaintiff: foreclosureData.plaintiff,
      defendant: foreclosureData.defendant,
      attorney: foreclosureData.attorney,
      attorneyPhone: foreclosureData.attorneyPhone,
      attorneyEmail: foreclosureData.attorneyEmail,
      caseNumber: foreclosureData.caseNumber,
      judgmentAmount: foreclosureData.judgmentAmount,
      interestRate: foreclosureData.interestRate,
      lienPosition: foreclosureData.lienPosition,
      propertyCondition: foreclosureData.propertyCondition,
      occupancyStatus: foreclosureData.occupancyStatus,
      redemptionPeriodEnd: foreclosureData.redemptionPeriodEnd,
      saleType: foreclosureData.saleType,
      openingBid: foreclosureData.openingBid,
      minimumBid: foreclosureData.minimumBid,
      depositRequirement: foreclosureData.depositRequirement,
      saleTerms: foreclosureData.saleTerms,
      propertyImages: foreclosureData.propertyImages,
      legalDescription: foreclosureData.legalDescription,
      parcelNumber: foreclosureData.parcelNumber,
      zoningClassification: foreclosureData.zoningClassification,
      taxDelinquencyAmount: foreclosureData.taxDelinquencyAmount,
      hoaDues: foreclosureData.hoaDues,
      utilities: foreclosureData.utilities,
      environmentalIssues: foreclosureData.environmentalIssues,
      titleStatus: foreclosureData.titleStatus,
      titleCompany: foreclosureData.titleCompany,
      titleCompanyPhone: foreclosureData.titleCompanyPhone,
      titleCompanyEmail: foreclosureData.titleCompanyEmail,
      inspectionReportUrl: foreclosureData.inspectionReportUrl,
      appraisalReportUrl: foreclosureData.appraisalReportUrl,
      propertyDocumentsUrl: foreclosureData.propertyDocumentsUrl,
      notes: foreclosureData.notes,
      status: foreclosureData.status || 'upcoming',
      isActive: true,
      featured: foreclosureData.featured || false,
      priorityLevel: foreclosureData.priorityLevel || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Send notification to subscribers
    try {
      await NotificationService.sendForeclosureUpdateNotification(newForeclosure);
    } catch (notificationError) {
      console.error('Failed to send foreclosure update notification:', notificationError);
      // Don't fail the request if notification fails
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Foreclosure listing created successfully',
      foreclosure: newForeclosure
    });
  } catch (error) {
    console.error('Error creating foreclosure listing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create foreclosure listing' 
    });
  }
});

// Update foreclosure listing
router.put('/foreclosures/:id', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const foreclosureData = req.body;
    
    // Check if foreclosure listing exists
    const existingForeclosure = await db.getForeclosureListingById(id);
    if (!existingForeclosure) {
      return res.status(404).json({ 
        success: false,
        message: 'Foreclosure listing not found' 
      });
    }
    
    const updatedForeclosure = await db.updateForeclosureListing(id, {
      address: foreclosureData.address,
      county: foreclosureData.county,
      neighborhood: foreclosureData.neighborhood,
      borough: foreclosureData.borough,
      auctionDate: foreclosureData.auctionDate,
      startingBid: foreclosureData.startingBid,
      assessedValue: foreclosureData.assessedValue,
      propertyType: foreclosureData.propertyType,
      beds: foreclosureData.beds,
      baths: foreclosureData.baths,
      sqft: foreclosureData.sqft,
      yearBuilt: foreclosureData.yearBuilt,
      description: foreclosureData.description,
      docketNumber: foreclosureData.docketNumber,
      plaintiff: foreclosureData.plaintiff,
      defendant: foreclosureData.defendant,
      attorney: foreclosureData.attorney,
      attorneyPhone: foreclosureData.attorneyPhone,
      attorneyEmail: foreclosureData.attorneyEmail,
      caseNumber: foreclosureData.caseNumber,
      judgmentAmount: foreclosureData.judgmentAmount,
      interestRate: foreclosureData.interestRate,
      lienPosition: foreclosureData.lienPosition,
      propertyCondition: foreclosureData.propertyCondition,
      occupancyStatus: foreclosureData.occupancyStatus,
      redemptionPeriodEnd: foreclosureData.redemptionPeriodEnd,
      saleType: foreclosureData.saleType,
      openingBid: foreclosureData.openingBid,
      minimumBid: foreclosureData.minimumBid,
      depositRequirement: foreclosureData.depositRequirement,
      saleTerms: foreclosureData.saleTerms,
      propertyImages: foreclosureData.propertyImages,
      legalDescription: foreclosureData.legalDescription,
      parcelNumber: foreclosureData.parcelNumber,
      zoningClassification: foreclosureData.zoningClassification,
      taxDelinquencyAmount: foreclosureData.taxDelinquencyAmount,
      hoaDues: foreclosureData.hoaDues,
      utilities: foreclosureData.utilities,
      environmentalIssues: foreclosureData.environmentalIssues,
      titleStatus: foreclosureData.titleStatus,
      titleCompany: foreclosureData.titleCompany,
      titleCompanyPhone: foreclosureData.titleCompanyPhone,
      titleCompanyEmail: foreclosureData.titleCompanyEmail,
      inspectionReportUrl: foreclosureData.inspectionReportUrl,
      appraisalReportUrl: foreclosureData.appraisalReportUrl,
      propertyDocumentsUrl: foreclosureData.propertyDocumentsUrl,
      notes: foreclosureData.notes,
      status: foreclosureData.status,
      featured: foreclosureData.featured,
      priorityLevel: foreclosureData.priorityLevel,
      updatedAt: new Date()
    });
    
    res.json({ 
      success: true, 
      message: `Foreclosure listing ${id} updated successfully`,
      foreclosure: updatedForeclosure
    });
  } catch (error) {
    console.error('Error updating foreclosure listing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update foreclosure listing' 
    });
  }
});

// Delete foreclosure listing
router.delete('/foreclosures/:id', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // Check if foreclosure listing exists
    const existingForeclosure = await db.getForeclosureListingById(id);
    if (!existingForeclosure) {
      return res.status(404).json({ 
        success: false,
        message: 'Foreclosure listing not found' 
      });
    }
    
    await db.deleteForeclosureListing(id);
    
    res.json({ 
      success: true, 
      message: `Foreclosure listing ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting foreclosure listing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete foreclosure listing' 
    });
  }
});

// Toggle foreclosure listing active status
router.post('/foreclosures/:id/toggle', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // Check if foreclosure listing exists
    const existingForeclosure = await db.getForeclosureListingById(id);
    if (!existingForeclosure) {
      return res.status(404).json({ 
        success: false,
        message: 'Foreclosure listing not found' 
      });
    }
    
    const updatedForeclosure = await db.updateForeclosureListing(id, {
      isActive: !existingForeclosure.isActive,
      updatedAt: new Date()
    });
    
    res.json({ 
      success: true, 
      message: `Foreclosure listing ${id} status toggled successfully`,
      foreclosure: updatedForeclosure
    });
  } catch (error) {
    console.error('Error toggling foreclosure listing status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle foreclosure listing status' 
    });
  }
});

// Upload PDF for foreclosure listing
router.post('/foreclosures/:id/pdf', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would handle file upload and save to storage
    // For now, we'll return a mock response
    res.json({ 
      success: true, 
      message: `PDF uploaded successfully for foreclosure listing ${id}`,
      pdfUrl: `/uploads/foreclosure-${id}.pdf`
    });
  } catch (error) {
    console.error('Error uploading PDF for foreclosure listing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload PDF for foreclosure listing' 
    });
  }
});

// Download PDF for foreclosure listing
router.get('/foreclosures/:id/pdf', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would serve the PDF file
    // For now, we'll return a mock response
    res.json({ 
      success: true, 
      message: `PDF download link for foreclosure listing ${id}`,
      pdfUrl: `/uploads/foreclosure-${id}.pdf`
    });
  } catch (error) {
    console.error('Error downloading PDF for foreclosure listing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download PDF for foreclosure listing' 
    });
  }
});

// Send notification for property listing
router.post('/properties/:id/notify', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would fetch the property from the database
    // For now, we'll use mock data with proper types
    const property: any = {
      id,
      address: '123 Brooklyn Ave',
      neighborhood: 'Park Slope',
      borough: 'Brooklyn',
      propertyType: 'Condo',
      beds: 2,
      baths: '2',
      sqft: 1200,
      units: null,
      price: '750000',
      arv: '850000',
      estimatedProfit: '75000',
      capRate: null,
      annualIncome: null,
      condition: null,
      access: 'Available with Appointment',
      images: ['/placeholder-property.jpg'],
      description: 'Beautiful condo in prime Brooklyn location with modern amenities.',
      googleSheetsRowId: null,
      partnerId: null,
      source: 'internal',
      status: 'available',
      isActive: true,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    };
    
    // Send notification to all registered users
    try {
      await NotificationService.sendPropertyListingNotification(property);
      res.json({ 
        success: true, 
        message: 'Notification sent successfully to all registered users'
      });
    } catch (notificationError) {
      console.error('Failed to send property listing notification:', notificationError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send notification' 
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send notification' 
    });
  }
});

// Send notification for foreclosure listing
router.post('/foreclosures/:id/notify', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would fetch the foreclosure from the database
    // For now, we'll use mock data
    const foreclosure = {
      id,
      address: '123 Main St',
      county: 'Queens',
      neighborhood: null,
      borough: null,
      auctionDate: new Date('2024-02-15'),
      startingBid: '450000',
      assessedValue: '500000',
      propertyType: 'Single Family',
      beds: 3,
      baths: '2',
      sqft: 1800,
      yearBuilt: 1995,
      description: 'Beautiful family home in great neighborhood',
      docketNumber: '12345-67890',
      plaintiff: 'Bank of America',
      defendant: null,
      attorney: null,
      attorneyPhone: null,
      attorneyEmail: null,
      caseNumber: null,
      judgmentAmount: null,
      interestRate: null,
      lienPosition: null,
      propertyCondition: null,
      occupancyStatus: null,
      redemptionPeriodEnd: null,
      saleType: null,
      openingBid: null,
      minimumBid: null,
      depositRequirement: null,
      saleTerms: null,
      propertyImages: null,
      legalDescription: null,
      parcelNumber: null,
      zoningClassification: null,
      taxDelinquencyAmount: null,
      hoaDues: null,
      utilities: null,
      environmentalIssues: null,
      titleStatus: null,
      titleCompany: null,
      titleCompanyPhone: null,
      titleCompanyEmail: null,
      inspectionReportUrl: null,
      appraisalReportUrl: null,
      propertyDocumentsUrl: null,
      notes: null,
      status: 'upcoming',
      isActive: true,
      featured: false,
      priorityLevel: 0,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    };
    
    // Send notification based on subscription status
    try {
      await NotificationService.sendForeclosureUpdateNotification(foreclosure);
      res.json({ 
        success: true, 
        message: 'Notification sent successfully to all subscribed users'
      });
    } catch (notificationError) {
      console.error('Failed to send foreclosure update notification:', notificationError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send notification' 
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send notification' 
    });
  }
});

// Get all offers
router.get('/offers', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    // Mock offer data
    const offers = [
      {
        id: 'o1',
        propertyId: 'p1',
        propertyAddress: '123 Brooklyn Ave, Brooklyn, NY',
        investorId: 'inv1',
        investorName: 'John Smith',
        investorType: 'common_investor',
        investorEmail: 'john.smith@example.com',
        investorPhone: '(555) 123-4567',
        offerAmount: 750000,
        earnestMoney: 15000,
        closingDate: '2024-03-15',
        financingType: 'Cash',
        contingencies: ['Inspection', 'Appraisal'],
        additionalTerms: 'Flexible on closing date',
        message: 'Very interested in this property. Would love to schedule a viewing.',
        status: 'pending',
        submittedAt: '2024-02-10T14:30:00Z',
        updatedAt: '2024-02-10T14:30:00Z'
      },
      {
        id: 'o2',
        propertyId: 'p2',
        propertyAddress: '456 Queens Blvd, Queens, NY',
        investorId: 'inv2',
        investorName: 'Sarah Johnson',
        investorType: 'institutional_investor',
        investorEmail: 'sarah.j@example.com',
        investorPhone: '(555) 987-6543',
        offerAmount: 650000,
        earnestMoney: 13000,
        closingDate: '2024-03-20',
        financingType: 'Conventional Loan',
        contingencies: ['Financing', 'Appraisal'],
        additionalTerms: 'Need 48 hours for response',
        message: 'Submitting offer on behalf of our investment fund.',
        status: 'accepted',
        submittedAt: '2024-02-08T11:15:00Z',
        updatedAt: '2024-02-09T09:45:00Z'
      }
    ];
    
    res.json({ success: true, offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch offers' });
  }
});

// Update offer status
router.put('/offers/:id/status', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be accepted or rejected.' 
      });
    }
    
    // In a real implementation, this would update the database
    // For now, we'll return a mock response
    res.json({ 
      success: true, 
      message: `Offer ${id} ${status} successfully`,
      offerId: id,
      status
    });
  } catch (error) {
    console.error('Error updating offer status:', error);
    res.status(500).json({ success: false, message: 'Failed to update offer status' });
  }
});

// Get all foreclosure bids
router.get('/foreclosure-bids', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    // Mock foreclosure bid data
    const bids = [
      {
        id: 'b1',
        foreclosureId: 'f1',
        foreclosureAddress: '123 Main St, Queens, NY',
        investorId: 'inv1',
        investorName: 'John Smith',
        investorType: 'common_investor',
        investorEmail: 'john.smith@example.com',
        investorPhone: '(555) 123-4567',
        bidAmount: 450000,
        maxBidAmount: 475000,
        investmentExperience: '3-5 Years Experience',
        preferredContactMethod: 'Email',
        timeframe: '30 days',
        additionalRequirements: 'Need property inspection report',
        status: 'pending',
        submittedAt: '2024-02-12T10:30:00Z',
        updatedAt: '2024-02-12T10:30:00Z'
      },
      {
        id: 'b2',
        foreclosureId: 'f2',
        foreclosureAddress: '456 Oak Ave, Brooklyn, NY',
        investorId: 'inv3',
        investorName: 'Robert Davis',
        investorType: 'institutional_investor',
        investorEmail: 'robert.davis@example.com',
        investorPhone: '(555) 456-7890',
        bidAmount: 380000,
        maxBidAmount: 400000,
        investmentExperience: '5+ Years Experience',
        preferredContactMethod: 'Phone',
        timeframe: 'Immediate',
        additionalRequirements: 'None',
        status: 'reviewed',
        submittedAt: '2024-02-11T14:20:00Z',
        updatedAt: '2024-02-13T09:15:00Z'
      }
    ];
    
    res.json({ success: true, bids });
  } catch (error) {
    console.error('Error fetching foreclosure bids:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch foreclosure bids' });
  }
});

// Update foreclosure bid status
router.put('/foreclosure-bids/:id/status', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['reviewed', 'contacted', 'won', 'lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be reviewed, contacted, won, or lost.' 
      });
    }
    
    // In a real implementation, this would update the database
    // For now, we'll return a mock response
    res.json({ 
      success: true, 
      message: `Foreclosure bid ${id} marked as ${status} successfully`,
      bidId: id,
      status
    });
  } catch (error) {
    console.error('Error updating foreclosure bid status:', error);
    res.status(500).json({ success: false, message: 'Failed to update foreclosure bid status' });
  }
});

// Get all subscription requests
router.get('/subscription-requests', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    // Mock subscription request data
    const requests = [
      {
        id: 'sr1',
        investorId: 'inv1',
        investorName: 'John Smith',
        investorEmail: 'john.smith@example.com',
        investorPhone: '(555) 123-4567',
        planType: 'monthly',
        counties: ['Queens', 'Brooklyn'],
        investmentExperience: '3-5 Years Experience',
        investmentBudget: '$250K - $500K',
        status: 'pending',
        submittedAt: '2024-02-15T10:30:00Z'
      },
      {
        id: 'sr2',
        investorId: 'inv2',
        investorName: 'Sarah Johnson',
        investorEmail: 'sarah.j@example.com',
        investorPhone: '(555) 987-6543',
        planType: 'yearly',
        counties: ['Manhattan', 'Bronx', 'Staten Island'],
        investmentExperience: '5+ Years Experience',
        investmentBudget: '$500K - $1M',
        status: 'approved',
        submittedAt: '2024-02-10T14:22:00Z',
        approvedAt: '2024-02-11T09:15:00Z',
        expiryDate: '2025-02-11T09:15:00Z'
      },
      {
        id: 'sr3',
        investorId: 'inv3',
        investorName: 'Robert Davis',
        investorEmail: 'robert.davis@example.com',
        investorPhone: '(555) 456-7890',
        planType: 'monthly',
        counties: ['Nassau', 'Suffolk'],
        investmentExperience: '1-2 Years Experience',
        investmentBudget: '$100K - $250K',
        status: 'rejected',
        submittedAt: '2024-02-05T16:45:00Z',
        rejectionReason: 'Insufficient investment experience for requested counties'
      }
    ];
    
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching subscription requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscription requests' });
  }
});

// Approve subscription request
router.post('/subscription-requests/:id/approve', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would update the database
    // For now, we'll return a mock response
    res.json({ 
      success: true, 
      message: `Subscription request ${id} approved successfully`,
      requestId: id,
      status: 'approved'
    });
  } catch (error) {
    console.error('Error approving subscription request:', error);
    res.status(500).json({ success: false, message: 'Failed to approve subscription request' });
  }
});

// Reject subscription request
router.post('/subscription-requests/:id/reject', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // In a real implementation, this would update the database
    // For now, we'll return a mock response
    res.json({ 
      success: true, 
      message: `Subscription request ${id} rejected successfully`,
      requestId: id,
      status: 'rejected',
      rejectionReason: reason
    });
  } catch (error) {
    console.error('Error rejecting subscription request:', error);
    res.status(500).json({ success: false, message: 'Failed to reject subscription request' });
  }
});

// Renew subscription
router.post('/subscriptions/:id/renew', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would update the database
    // For now, we'll return a mock response
    res.json({ 
      success: true, 
      message: `Subscription ${id} renewed successfully`,
      subscriptionId: id,
      status: 'approved'
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to renew subscription' });
  }
});

// Cancel subscription
router.post('/subscriptions/:id/cancel', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would update the database
    // For now, we'll return a mock response
    res.json({ 
      success: true, 
      message: `Subscription ${id} cancelled successfully`,
      subscriptionId: id,
      status: 'cancelled'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel subscription' });
  }
});

// Get all blog posts
router.get('/blogs', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const blogs = await db.getAllBlogs();
    res.json({
      success: true,
      blogs: blogs.map(blog => ({
        ...blog,
        date: blog.createdAt,
        readTime: '5 min read',
        image: blog.coverImage || '/placeholder-blog.jpg',
        featured: blog.featured || false
      }))
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch blogs' 
    });
  }
});

// Get blog by ID
router.get('/blogs/:id', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const blog = await db.getBlogById(id);
    
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: 'Blog not found' 
      });
    }
    
    res.json({
      success: true,
      post: {
        ...blog,
        date: blog.createdAt,
        readTime: '5 min read',
        image: blog.coverImage || '/placeholder-blog.jpg',
        featured: blog.featured || false
      }
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch blog' 
    });
  }
});

// Create new blog
router.post('/blogs', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const blogData = req.body;
    
    // Validate required fields
    if (!blogData.title || !blogData.content || !blogData.author) {
      return res.status(400).json({ 
        success: false,
        message: 'Title, content, and author are required' 
      });
    }
    
    // Generate slug from title if not provided
    if (!blogData.slug) {
      blogData.slug = blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Set published date if published
    if (blogData.published && !blogData.publishedAt) {
      blogData.publishedAt = new Date();
    }
    
    const newBlog = await db.createBlog({
      title: blogData.title,
      excerpt: blogData.excerpt,
      content: blogData.content,
      slug: blogData.slug,
      author: blogData.author,
      tags: blogData.tags || [],
      published: blogData.published || false,
      publishedAt: blogData.publishedAt,
      coverImage: blogData.image,
      featured: blogData.featured || false,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Blog created successfully',
      post: {
        ...newBlog,
        date: newBlog.createdAt,
        readTime: '5 min read',
        image: newBlog.coverImage || '/placeholder-blog.jpg',
        featured: newBlog.featured || false
      }
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create blog' 
    });
  }
});

// Update blog
router.put('/blogs/:id', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const blogData = req.body;
    
    // Check if blog exists
    const existingBlog = await db.getBlogById(id);
    if (!existingBlog) {
      return res.status(404).json({ 
        success: false,
        message: 'Blog not found' 
      });
    }
    
    // Set published date if published and not already set
    if (blogData.published && !existingBlog.publishedAt && !blogData.publishedAt) {
      blogData.publishedAt = new Date();
    }
    
    const updatedBlog = await db.updateBlog(id, {
      title: blogData.title,
      excerpt: blogData.excerpt,
      content: blogData.content,
      slug: blogData.slug,
      author: blogData.author,
      tags: blogData.tags,
      published: blogData.published,
      publishedAt: blogData.publishedAt,
      coverImage: blogData.image,
      featured: blogData.featured,
      updatedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Blog updated successfully',
      post: {
        ...updatedBlog,
        date: updatedBlog.updatedAt,
        readTime: '5 min read',
        image: updatedBlog.coverImage || '/placeholder-blog.jpg',
        featured: updatedBlog.featured || false
      }
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update blog' 
    });
  }
});

// Delete blog
router.delete('/blogs/:id', authenticateAdmin, async (req: AdminRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // Check if blog exists
    const existingBlog = await db.getBlogById(id);
    if (!existingBlog) {
      return res.status(404).json({ 
        success: false,
        message: 'Blog not found' 
      });
    }
    
    await db.deleteBlog(id);
    
    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete blog' 
    });
  }
});

// Upload blog image
router.post('/blogs/upload-image', authenticateAdmin, upload.single('image'), async (req: AdminRequest, res: express.Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    // In a real implementation, you might want to store this in a database
    // For now, we'll return the file path
    const imageUrl = `/uploads/blog-images/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload image' 
    });
  }
});

export default router;