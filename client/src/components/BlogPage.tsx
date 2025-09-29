import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, CalendarDaysIcon, UserIcon, TagIcon } from './icons';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  readTime: string;
  image: string;
  featured?: boolean;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Categories data
  const categories: Category[] = [
    { id: 'all', name: 'All Categories', count: 0 },
    { id: 'property-insights', name: 'Property Insights', count: 0 },
    { id: 'investment-strategies', name: 'Investment Strategies', count: 0 },
    { id: 'market-analysis', name: 'Market Analysis', count: 0 },
    { id: 'legal-insights', name: 'Legal Insights', count: 0 },
    { id: 'financing', name: 'Financing', count: 0 },
    { id: 'tax-insights', name: 'Tax Insights', count: 0 }
  ];

  // Tags data
  const tags = ['Manhattan', 'Brooklyn', 'Queens', 'Wholesale', 'Foreclosure', 'Multi-Family', 'ROI', 'Legal', 'Financing', 'Tax', '2025', 'Investing'];

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/public/blogs');
        const data = await response.json();
        
        if (data.success && data.blogs) {
          const transformedPosts = data.blogs.map((blog: any) => ({
            id: blog.id,
            title: blog.title,
            excerpt: blog.excerpt || '',
            content: blog.content,
            date: new Date(blog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            author: {
              name: blog.author,
              avatar: `https://ui-avatars.com/api/?name=${blog.author}&background=random`
            },
            category: 'Property Insights', // Default category
            tags: blog.tags || [],
            readTime: '5 min read', // Default read time
            image: blog.coverImage || '/placeholder-blog.jpg',
            featured: blog.featured || false,
            slug: blog.slug
          }));
          
          setBlogPosts(transformedPosts);
        } else {
          setError(data.message || 'Failed to fetch blog posts');
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Filter blog posts based on search term and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || post.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const postsPerPage = 4;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const posts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  // Featured post
  const featuredPost = filteredPosts.find(post => post.featured) || filteredPosts[0];

  // Popular posts
  const popularPosts = filteredPosts.slice(0, 3);

  if (loading && blogPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-primary-blue mb-4">Error Loading Blog Posts</h1>
            <p className="text-neutral-600 mb-6">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-accent-yellow/20 rounded-full animate-float backdrop-blur-sm"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-success-emerald/20 rounded-full animate-float-delayed backdrop-blur-sm"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="heading-hero mb-8 text-white">
              Real Estate Investment Insights
            </h1>
            <p className="text-body-lg mb-12 text-neutral-100">
              Expert advice, market trends, and investment strategies for NYC real estate
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Post */}
            {featuredPost && (
              <Card variant="modern" className="mb-16 overflow-hidden group">
                <div className="md:flex">
                  <div className="md:w-2/3">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="md:w-1/3 p-8 flex flex-col justify-center">
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-accent-yellow/10 text-accent-yellow rounded-full text-sm font-medium">
                        {featuredPost.category}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-primary-blue mb-4">
                      <Link to={`/blog/${featuredPost.slug}`} className="hover:text-accent-yellow transition-colors">
                        {featuredPost.title}
                      </Link>
                    </h2>
                    <p className="text-neutral-600 mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img 
                          src={featuredPost.author.avatar} 
                          alt={featuredPost.author.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{featuredPost.author.name}</div>
                          <div className="text-xs text-neutral-500">{featuredPost.date}</div>
                        </div>
                      </div>
                      <span className="text-sm text-neutral-500">{featuredPost.readTime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {posts.map((post, index) => (
                <Card 
                  key={post.id} 
                  variant="modern" 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-3xl group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        post.featured 
                          ? 'bg-accent-yellow/10 text-accent-yellow font-medium'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {post.category}
                      </span>
                      {post.featured && (
                        <span className="px-2 py-1 bg-success-emerald text-white text-xs rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-primary-blue mb-3">
                      <Link to={`/blog/${post.slug}`} className="hover:text-accent-yellow transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-neutral-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img 
                          src={post.author.avatar} 
                          alt={post.author.name}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <span className="text-sm text-neutral-600">{post.author.name}</span>
                      </div>
                      <span className="text-sm text-neutral-500">{post.date}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      currentPage === page
                        ? 'bg-primary-blue text-white font-medium'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-accent-yellow/10 hover:text-accent-yellow transition-colors'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <Card variant="modern" className="mb-8">
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary-blue mb-4">Search Articles</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search blog posts..."
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                </div>
              </div>
            </Card>

            {/* Categories */}
            <Card variant="modern" className="mb-8">
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary-blue mb-4">Categories</h3>
                <ul className="space-y-2">
                  {categories.map(category => (
                    <li key={category.name}>
                      <button
                        onClick={() => setSelectedCategory(category.name === selectedCategory ? '' : category.name)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm hover:bg-accent-yellow/10 hover:text-accent-yellow transition-colors"
                      >
                        <span>{category.name}</span>
                        <span className="bg-neutral-100 text-neutral-600 rounded-full px-2 py-1 text-xs">
                          {category.count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Popular Posts */}
            <Card variant="modern" className="mb-8">
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary-blue mb-4">Popular Posts</h3>
                <div className="space-y-4">
                  {popularPosts.map(post => (
                    <Link 
                      key={post.id} 
                      to={`/blog/${post.slug}`}
                      className="flex group"
                    >
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-16 h-16 object-cover rounded-lg mr-4 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-semibold text-primary-blue group-hover:text-accent-yellow transition-colors text-sm mb-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center text-xs text-neutral-500">
                          <span>{post.date}</span>
                          <span className="mx-2">•</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Card>

            {/* Newsletter */}
            <Card variant="modern">
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary-blue mb-2">Stay Updated</h3>
                <p className="text-neutral-600 text-sm mb-4">
                  Get the latest real estate investment insights delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm"
                  />
                  <button className="w-full btn-secondary text-sm py-3">
                    Subscribe
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;