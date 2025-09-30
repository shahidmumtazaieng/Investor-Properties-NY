import { DatabaseRepository } from './server/database-repository.ts';
import { testDatabaseConnection } from './server/database.ts';

async function verifyBlogDatabase() {
  console.log('=== BLOG DATABASE VERIFICATION ===\n');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      console.log('❌ Database connection failed');
      return;
    }
    console.log('✅ Database connection successful\n');
    
    // Test blog repository
    console.log('2. Testing blog repository methods...');
    const db = new DatabaseRepository();
    
    // Check if blog methods exist
    const requiredMethods = [
      'getAllBlogs',
      'getBlogById',
      'getBlogBySlug',
      'createBlog',
      'updateBlog',
      'deleteBlog'
    ];
    
    let allMethodsExist = true;
    for (const method of requiredMethods) {
      if (typeof db[method] === 'function') {
        console.log(`✅ ${method} method exists`);
      } else {
        console.log(`❌ ${method} method missing`);
        allMethodsExist = false;
      }
    }
    
    if (!allMethodsExist) {
      console.log('❌ Some required methods are missing');
      return;
    }
    
    console.log('✅ All blog repository methods exist\n');
    
    // Test creating a dummy blog post
    console.log('3. Testing blog creation with dummy data...');
    
    const dummyBlog = {
      title: 'Getting Started with Real Estate Investment in NYC',
      excerpt: 'A comprehensive guide for new investors looking to enter the New York real estate market.',
      content: `# Getting Started with Real Estate Investment in NYC

Investing in New York City real estate can be one of the most rewarding financial decisions you make. The city's dynamic market offers numerous opportunities for both seasoned investors and newcomers alike.

## Why Invest in NYC Real Estate?

New York City remains one of the most attractive real estate markets in the world due to several key factors:

1. **Stable Market**: Despite fluctuations, NYC real estate has shown long-term appreciation
2. **Strong Rental Demand**: High population density ensures consistent rental income
3. **Diverse Investment Options**: From residential condos to commercial properties
4. **Infrastructure Development**: Ongoing city improvements enhance property values

## Key Considerations for New Investors

Before diving in, consider these important factors:

### Financial Preparation
- Ensure you have adequate capital reserves
- Understand financing options and requirements
- Factor in ongoing maintenance and management costs

### Market Research
- Study different neighborhoods and their growth potential
- Analyze comparable sales in your target areas
- Understand local regulations and tax implications

### Professional Support
- Work with experienced real estate agents
- Engage qualified attorneys for contract review
- Consider property management services for rental properties

## Popular Investment Strategies

### Buy and Hold
Purchase properties with the intention of holding them long-term for appreciation and rental income.

### Fix and Flip
Buy undervalued properties, renovate them, and sell for a profit.

### Wholesaling
Contract properties and assign contracts to other investors for a fee.

## Getting Started

1. Define your investment goals and budget
2. Research target neighborhoods
3. Connect with local professionals
4. Begin property search
5. Conduct thorough due diligence
6. Close on your first investment

Remember, real estate investment requires patience and careful planning. Start small, learn continuously, and scale your portfolio over time.`,
      slug: 'getting-started-nyc-real-estate-investment',
      author: 'Investor Properties NY Team',
      tags: ['investment', 'nyc', 'beginner', 'guide'],
      published: true,
      publishedAt: new Date(),
      coverImage: '/placeholder-blog.jpg',
      featured: true,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      const createdBlog = await db.createBlog(dummyBlog);
      console.log('✅ Dummy blog post created successfully');
      console.log('Blog ID:', createdBlog.id);
      console.log('Blog Title:', createdBlog.title);
      
      // Test fetching the created blog
      console.log('\n4. Testing blog retrieval...');
      const fetchedBlog = await db.getBlogById(createdBlog.id);
      if (fetchedBlog) {
        console.log('✅ Blog retrieval successful');
        console.log('Retrieved Title:', fetchedBlog.title);
      } else {
        console.log('❌ Failed to retrieve created blog');
        return;
      }
      
      // Test listing all blogs
      console.log('\n5. Testing blog listing...');
      const allBlogs = await db.getAllBlogs();
      console.log(`✅ Retrieved ${allBlogs.length} blog posts`);
      
      // Clean up - delete the dummy blog
      console.log('\n6. Cleaning up dummy blog post...');
      await db.deleteBlog(createdBlog.id);
      console.log('✅ Dummy blog post deleted successfully');
      
    } catch (error) {
      console.error('❌ Error during blog operations:', error);
      return;
    }
    
    console.log('\n=== DATABASE VERIFICATION COMPLETE ===');
    console.log('✅ Blog management is fully integrated with real database');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

// Run the verification
verifyBlogDatabase();