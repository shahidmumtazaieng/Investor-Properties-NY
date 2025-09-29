import express from 'express';
import { DatabaseRepository } from './database-repository.ts';

const router = express.Router();
const db = new DatabaseRepository();

// Get all properties (public)
router.get('/properties', async (req: express.Request, res: express.Response) => {
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

// Get blog by slug (public)
router.get('/blogs/:slug', async (req: express.Request, res: express.Response) => {
  try {
    const { slug } = req.params;
    const blog = await db.getBlogBySlug(slug);
    
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: 'Blog not found' 
      });
    }
    
    // Only return published blogs
    if (!blog.published) {
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

// Get property by ID (public)
router.get('/properties/:id', async (req: express.Request, res: express.Response) => {
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

// Get similar properties (public)
router.get('/properties/:id/similar', async (req: express.Request, res: express.Response) => {
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

// Get featured blogs (public)
router.get('/blogs/featured', async (req: express.Request, res: express.Response) => {
  try {
    // Fetch only published and featured blogs from database
    const allBlogs = await db.getAllBlogs();
    const featuredBlogs = allBlogs.filter(blog => blog.published && blog.featured);
    
    res.json({
      success: true,
      blogs: featuredBlogs.map(blog => ({
        ...blog,
        date: blog.createdAt,
        readTime: '5 min read',
        image: blog.coverImage || '/placeholder-blog.jpg',
        featured: blog.featured || false
      }))
    });
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch featured blogs' 
    });
  }
});

export default router;