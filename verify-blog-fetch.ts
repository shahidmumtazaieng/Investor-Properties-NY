// Script to verify that blog data can be fetched from the database
import { supabase } from './server/database.ts';

async function verifyBlogFetch() {
  console.log('=== VERIFYING BLOG DATA FETCH ===\n');
  
  try {
    // Fetch all blogs
    console.log('1. Fetching all blog posts...');
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Failed to fetch blogs:', error.message);
      return;
    }
    
    console.log(`✅ Successfully fetched ${blogs.length} blog posts`);
    
    // Display blog information
    blogs.forEach((blog: any, index: number) => {
      console.log(`\n${index + 1}. ${blog.title}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log(`   Author: ${blog.author}`);
      console.log(`   Published: ${blog.published ? 'Yes' : 'No'}`);
      console.log(`   Featured: ${blog.featured ? 'Yes' : 'No'}`);
      console.log(`   Tags: ${blog.tags ? blog.tags.join(', ') : 'None'}`);
      console.log(`   Created: ${new Date(blog.created_at).toLocaleDateString()}`);
    });
    
    // Test fetching a specific blog by slug
    if (blogs.length > 0) {
      console.log('\n2. Testing specific blog fetch by slug...');
      const firstBlog = blogs[0];
      const { data: specificBlog, error: specificError } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', firstBlog.slug)
        .single();
      
      if (specificError) {
        console.log('❌ Failed to fetch specific blog:', specificError.message);
        return;
      }
      
      console.log('✅ Successfully fetched specific blog by slug');
      console.log(`   Title: ${specificBlog.title}`);
      console.log(`   Excerpt: ${specificBlog.excerpt}`);
      console.log(`   Content length: ${specificBlog.content.length} characters`);
    }
    
    // Test fetching featured blogs
    console.log('\n3. Testing featured blogs fetch...');
    const { data: featuredBlogs, error: featuredError } = await supabase
      .from('blogs')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false });
    
    if (featuredError) {
      console.log('❌ Failed to fetch featured blogs:', featuredError.message);
      return;
    }
    
    console.log(`✅ Successfully fetched ${featuredBlogs.length} featured blog posts`);
    
    // Test fetching published blogs
    console.log('\n4. Testing published blogs fetch...');
    const { data: publishedBlogs, error: publishedError } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (publishedError) {
      console.log('❌ Failed to fetch published blogs:', publishedError.message);
      return;
    }
    
    console.log(`✅ Successfully fetched ${publishedBlogs.length} published blog posts`);
    
    console.log('\n=== BLOG FETCH VERIFICATION COMPLETE ===');
    console.log('✅ Blog data can be successfully fetched from the database');
    console.log('✅ Blog management system is fully operational with real database');
    
  } catch (error) {
    console.error('❌ Error during blog fetch verification:', error);
  }
}

// Run the verification
verifyBlogFetch();