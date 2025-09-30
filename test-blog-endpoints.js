// Simple JavaScript test to verify blog endpoints
async function testBlogEndpoints() {
  const baseUrl = 'http://localhost:3002';
  
  console.log('=== TESTING BLOG ENDPOINTS ===\n');
  
  try {
    // Test health endpoint first
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    console.log(`   Status: ${healthResponse.status}`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`   ✅ Server health: ${healthData.status}`);
    } else {
      console.log(`   ❌ Server health check failed`);
      return;
    }
    
    // Test public blog listing endpoint
    console.log('\n2. Testing public blog listing endpoint...');
    try {
      const response = await fetch(`${baseUrl}/api/public/blogs`);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success - Blog endpoint accessible`);
        if (data.blogs && Array.isArray(data.blogs)) {
          console.log(`   Found ${data.blogs.length} blog posts`);
          if (data.blogs.length > 0) {
            console.log(`   Sample blog: "${data.blogs[0].title}"`);
          }
        }
      } else {
        console.log(`   ❌ Blog endpoint returned error: ${response.status}`);
        const errorText = await response.text();
        console.log(`   Error details: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ Blog endpoint error: ${error.message}`);
    }
    
    // Test featured blogs endpoint
    console.log('\n3. Testing featured blogs endpoint...');
    try {
      const response = await fetch(`${baseUrl}/api/public/blogs/featured`);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success - Featured blogs endpoint accessible`);
        if (data.blogs && Array.isArray(data.blogs)) {
          console.log(`   Found ${data.blogs.length} featured blog posts`);
        }
      } else {
        console.log(`   ❌ Featured blogs endpoint returned error: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Featured blogs endpoint error: ${error.message}`);
    }
    
    // Test admin blog listing endpoint (this will likely require authentication)
    console.log('\n4. Testing admin blog listing endpoint...');
    try {
      const response = await fetch(`${baseUrl}/api/admin/blogs`);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success - Admin blog endpoint accessible`);
        if (data.length > 0 || (data.blogs && Array.isArray(data.blogs))) {
          const count = Array.isArray(data) ? data.length : data.blogs.length;
          console.log(`   Found ${count} blog posts in admin`);
        }
      } else if (response.status === 401) {
        console.log(`   ⚠️  Admin endpoint requires authentication (expected)`);
      } else {
        console.log(`   ❌ Admin blog endpoint returned error: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Admin blog endpoint error: ${error.message}`);
    }
    
    console.log('\n=== ENDPOINT TESTING COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Run the test
testBlogEndpoints();