import express from 'express';
import { DatabaseRepository } from './database-repository.ts';
import { NotificationService } from './notification-service.ts';

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
    // Mock user data
    const users = [
      {
        id: '1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        userType: 'common_investor',
        status: 'active',
        createdAt: '2023-01-15'
      },
      {
        id: '2',
        username: 'janedoe',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        userType: 'institutional_investor',
        status: 'active',
        createdAt: '2023-02-20'
      },
      {
        id: '3',
        username: 'seller123',
        email: 'seller@example.com',
        firstName: 'Bob',
        lastName: 'Smith',
        userType: 'seller',
        status: 'pending',
        createdAt: '2023-03-10'
      },
      {
        id: '4',
        username: 'adminuser',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        userType: 'admin',
        status: 'active',
        createdAt: '2023-01-01'
      }
    ];
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
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
    // Mock foreclosure data
    const foreclosures = [
      {
        id: 'f1',
        address: '123 Main St',
        county: 'Queens',
        auctionDate: '2024-02-15',
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
        status: 'upcoming',
        isActive: true,
        createdAt: '2023-01-15'
      },
      {
        id: 'f2',
        address: '456 Oak Ave',
        county: 'Brooklyn',
        auctionDate: '2024-02-20',
        startingBid: '380000',
        assessedValue: '420000',
        propertyType: 'Multi-Family',
        beds: 6,
        baths: '4',
        sqft: 3000,
        yearBuilt: 1980,
        description: 'Investment property with multiple rental units',
        docketNumber: '09876-54321',
        plaintiff: 'Chase Bank',
        status: 'upcoming',
        isActive: true,
        createdAt: '2023-02-20'
      }
    ];
    
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
    
    // In a real implementation, this would save to the database
    // For now, we'll return a mock response
    const newForeclosure = {
      id: Date.now().toString(),
      ...foreclosureData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Send notification based on subscription status
    // Institutional investors get free access, common investors need subscription
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
    
    // In a real implementation, this would update the database
    // For now, we'll return a mock response
    const updatedForeclosure = {
      id,
      ...foreclosureData,
      updatedAt: new Date().toISOString()
    };
    
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
    
    // In a real implementation, this would delete from the database
    // For now, we'll return a mock response
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
    
    // In a real implementation, this would toggle the isActive status in the database
    // For now, we'll return a mock response
    res.json({ 
      success: true, 
      message: `Foreclosure listing ${id} status toggled successfully`
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
      status: 'upcoming',
      isActive: true,
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

export default router;