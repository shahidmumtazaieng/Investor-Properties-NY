import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import path from "path";
import authRoutes from "./auth-routes.ts";
import { DatabaseRepository } from "./database-repository.ts";

// Load environment variables
dotenv.config();

const app = express();
const db = new DatabaseRepository();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// CORS configuration
const corsOrigin = process.env.NODE_ENV === 'production' 
  ? process.env.CLIENT_URL || 'https://investorpropertiesny.com'
  : 'http://localhost:3000';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', corsOrigin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Investor Properties NY API Server', 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    documentation: '/api/docs (coming soon)',
    health: '/api/health'
  });
});

// API Documentation
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: 'Investor Properties NY API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      properties: 'GET /api/public/properties',
      foreclosureSamples: 'GET /api/public/foreclosures/samples',
      auth: 'POST /api/auth/login, POST /api/auth/register, etc.'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Properties endpoint (updated to use database)
app.get('/api/public/properties', async (req, res) => {
  try {
    const properties = await db.getAllProperties();
    
    // Transform data to match frontend expectations
    const transformedProperties = properties.map((property: any) => ({
      id: property.id,
      address: property.address,
      neighborhood: property.neighborhood,
      borough: property.borough,
      propertyType: property.propertyType,
      beds: property.beds,
      baths: property.baths?.toString(),
      sqft: property.sqft,
      price: property.price?.toString(),
      arv: property.arv?.toString(),
      estimatedProfit: property.estimatedProfit?.toString(),
      capRate: property.capRate?.toString(),
      annualIncome: property.annualIncome?.toString(),
      condition: property.condition,
      access: property.access,
      images: property.images || ['/placeholder-property.jpg'],
      description: property.description,
      status: property.status,
      createdAt: property.createdAt
    }));
    
    res.json(transformedProperties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    // Fallback to mock data
    const mockProperties = [
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
        description: "Beautiful condo in prime Brooklyn location with modern amenities."
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
        description: "Spacious single family home with great potential for renovation."
      }
    ];
    res.json(mockProperties);
  }
});

// Property details endpoint
app.get('/api/public/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const property = await db.getPropertyById(id);
    
    if (!property) {
      // Fallback to mock data for specific IDs
      const mockProperties: { [key: string]: any } = {
        "1": {
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
          description: "Beautiful condo in prime Brooklyn location with modern amenities. This stunning property features an open floor plan with floor-to-ceiling windows, gourmet kitchen with stainless steel appliances, and a spa-like bathroom. Located in the heart of Park Slope, you'll have easy access to Prospect Park, local cafes, and the F/G/R subway lines.",
          status: "active",
          condition: "Excellent",
          access: "Easy",
          yearBuilt: 1920,
          lotSize: 2500,
          parkingSpaces: 1,
          heating: "Central Heating",
          cooling: "Central AC",
          flooring: "Hardwood",
          appliances: ["Refrigerator", "Oven", "Dishwasher", "Washer", "Dryer"],
          utilities: ["Water", "Gas", "Electricity"],
          zoning: "Residential",
          taxes: "8500",
          hoa: "450",
          schools: {
            elementary: "PS 321",
            middle: "JHS 280",
            high: "Brooklyn Tech"
          },
          walkScore: 95,
          transitScore: 88,
          bikeScore: 82
        },
        "2": {
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
          description: "Spacious single family home with great potential for renovation. This charming 3-bedroom, 2.5-bathroom home features original hardwood floors, a finished basement, and a large backyard. Located in the rapidly developing neighborhood of Long Island City, this property offers excellent investment potential with easy access to Manhattan via the 7 train.",
          status: "active",
          condition: "Good",
          access: "Easy",
          yearBuilt: 1955,
          lotSize: 3200,
          parkingSpaces: 2,
          heating: "Oil",
          cooling: "Window Units",
          flooring: "Hardwood, Tile",
          appliances: ["Refrigerator", "Oven", "Dishwasher"],
          utilities: ["Water", "Gas", "Electricity"],
          zoning: "Residential",
          taxes: "7200",
          hoa: "0",
          schools: {
            elementary: "PS 110",
            middle: "IS 145",
            high: "Frank Sinatra School of the Arts"
          },
          walkScore: 82,
          transitScore: 92,
          bikeScore: 75
        }
      };
      
      if (mockProperties[id]) {
        res.json(mockProperties[id]);
      } else {
        res.status(404).json({ message: 'Property not found' });
      }
      return;
    }
    
    // Transform data to match frontend expectations
    const transformedProperty = {
      id: property.id,
      address: property.address,
      neighborhood: property.neighborhood,
      borough: property.borough,
      propertyType: property.propertyType,
      beds: property.beds,
      baths: property.baths?.toString(),
      sqft: property.sqft,
      price: property.price?.toString(),
      arv: property.arv?.toString(),
      estimatedProfit: property.estimatedProfit?.toString(),
      capRate: property.capRate?.toString(),
      annualIncome: property.annualIncome?.toString(),
      condition: property.condition,
      access: property.access,
      images: property.images || ['/placeholder-property.jpg'],
      description: property.description,
      status: property.status,
      createdAt: property.createdAt,
      yearBuilt: (property as any).yearBuilt || undefined,
      lotSize: (property as any).lotSize || undefined,
      parkingSpaces: (property as any).parkingSpaces || undefined,
      heating: (property as any).heating || undefined,
      cooling: (property as any).cooling || undefined,
      flooring: (property as any).flooring || undefined,
      appliances: (property as any).appliances || undefined,
      utilities: (property as any).utilities || undefined,
      zoning: (property as any).zoning || undefined,
      taxes: (property as any).taxes?.toString() || undefined,
      hoa: (property as any).hoa?.toString() || undefined,
      schools: (property as any).schools || undefined,
      walkScore: (property as any).walkScore || undefined,
      transitScore: (property as any).transitScore || undefined,
      bikeScore: (property as any).bikeScore || undefined
    };
    
    res.json(transformedProperty);
  } catch (error) {
    console.error('Error fetching property details:', error);
    res.status(500).json({ message: 'Error fetching property details' });
  }
});

// Similar properties endpoint
app.get('/api/public/properties/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const allProperties = await db.getAllProperties();
    
    // Filter out the current property and get up to 3 similar ones
    const similarProperties = allProperties
      .filter((property: any) => property.id !== id)
      .slice(0, 3);
    
    // Transform data to match frontend expectations
    const transformedProperties = similarProperties.map((property: any) => ({
      id: property.id,
      address: property.address,
      neighborhood: property.neighborhood,
      borough: property.borough,
      propertyType: property.propertyType,
      beds: property.beds,
      baths: property.baths?.toString(),
      sqft: property.sqft,
      price: property.price?.toString(),
      arv: property.arv?.toString(),
      estimatedProfit: property.estimatedProfit?.toString(),
      capRate: property.capRate?.toString(),
      annualIncome: property.annualIncome?.toString(),
      condition: property.condition,
      access: property.access,
      images: property.images || ['/placeholder-property.jpg'],
      description: property.description,
      status: property.status,
      createdAt: property.createdAt
    }));
    
    res.json(transformedProperties);
  } catch (error) {
    console.error('Error fetching similar properties:', error);
    // Fallback to mock data
    const mockProperties = [
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
        description: "Beautiful condo in prime Brooklyn location with modern amenities."
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
        description: "Spacious single family home with great potential for renovation."
      }
    ];
    res.json(mockProperties);
  }
});

// Mock foreclosure samples endpoint
app.get('/api/public/foreclosures/samples', (req, res) => {
  const mockForeclosures = {
    samples: [
      {
        id: "f1",
        address: "789 Bronx Ave",
        county: "Bronx",
        auctionDate: "2024-02-15",
        startingBid: "450000",
        propertyType: "Multi-Family"
      },
      {
        id: "f2",
        address: "321 Staten Island Way",
        county: "Richmond",
        auctionDate: "2024-02-20",
        startingBid: "380000",
        propertyType: "Single Family"
      },
      {
        id: "f3",
        address: "555 Manhattan Street",
        county: "New York",
        auctionDate: "2024-03-10",
        startingBid: "1200000",
        propertyType: "Condo"
      },
      {
        id: "f4",
        address: "123 Brooklyn Boulevard",
        county: "Kings",
        auctionDate: "2024-02-28",
        startingBid: "650000",
        propertyType: "Townhouse"
      },
      {
        id: "f5",
        address: "456 Queens Road",
        county: "Queens",
        auctionDate: "2024-03-05",
        startingBid: "525000",
        propertyType: "Single Family"
      },
      {
        id: "f6",
        address: "789 Westchester Avenue",
        county: "Bronx",
        auctionDate: "2024-03-15",
        startingBid: "375000",
        propertyType: "Multi-Family"
      }
    ],
    totalAvailable: 150,
    message: "Subscribe to access full foreclosure listings"
  };
  
  res.json(mockForeclosures);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));
  
  // Catch-all handler for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Start server
const startServer = async () => {
  const server = createServer(app);
  const port = parseInt(process.env.PORT || "3002", 10);
  
  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 Frontend: http://localhost:3000`);
      console.log(`🔧 API: http://localhost:${port}/api`);
    }
  });
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});