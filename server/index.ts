import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./auth-routes.ts";
import adminRoutes from "./admin-routes.ts";
import publicRoutes from "./public-routes.ts";
import { DatabaseRepository } from "./database-repository.ts";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Admin routes
app.use('/api/admin', adminRoutes);

// Public routes
app.use('/api/public', publicRoutes);

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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));
  
  // Catch-all handler for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

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