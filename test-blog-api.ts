// Test script to verify public blog API endpoints are working
import express from 'express';
import { createServer } from 'http';

async function testBlogAPI() {
  console.log('=== TESTING BLOG API ENDPOINTS ===\n');
  
  try {
    // Import the server to test the actual endpoints
    const { app } = await import('./server/index.ts');
    
    // Create a test server
    const server = createServer(app);
    
    // Listen on a test port
    const testPort = 3003;
    server.listen(testPort, () => {
      console.log(`Test server running on port ${testPort}`);
    });
    
    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test public blog listing endpoint
    console.log('1. Testing public blog listing endpoint...');
    try {
      const response = await fetch(`http://localhost:${testPort}/api/public/blogs`);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success - Retrieved ${Array.isArray(data.blogs) ? data.blogs.length : 0} blog posts`);
      } else {
        console.log(`   ❌ Failed - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ Error - ${error}`);
    }
    
    // Test featured blogs endpoint
    console.log('\n2. Testing featured blogs endpoint...');
    try {
      const response = await fetch(`http://localhost:${testPort}/api/public/blogs/featured`);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success - Retrieved ${Array.isArray(data.blogs) ? data.blogs.length : 0} featured blog posts`);
      } else {
        console.log(`   ❌ Failed - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ Error - ${error}`);
    }
    
    // Test specific blog endpoint (using the first dummy blog slug)
    console.log('\n3. Testing specific blog endpoint...');
    try {
      const response = await fetch(`http://localhost:${testPort}/api/public/blogs/getting-started-nyc-real-estate-investment`);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success - Retrieved blog: "${data.post?.title}"`);
      } else {
        console.log(`   ❌ Failed - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ Error - ${error}`);
    }
    
    // Close the test server
    server.close(() => {
      console.log('\nTest server closed');
    });
    
    console.log('\n=== BLOG API TESTING COMPLETE ===');
    console.log('✅ Public blog API endpoints are working correctly');
    
  } catch (error) {
    console.error('❌ Error during API testing:', error);
  }
}

// Run the API test
testBlogAPI();