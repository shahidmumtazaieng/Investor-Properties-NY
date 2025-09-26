import React, { useState } from 'react';
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
}

interface Category {
  id: string;
  name: string;
  count: number;
}

const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Sample blog posts data
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Top 10 Wholesale Properties in Manhattan for Q4 2024',
      excerpt: 'Discover the most profitable wholesale properties in Manhattan that are perfect for investors looking to flip or hold for rental income.',
      content: '',
      date: '2024-10-15',
      author: {
        name: 'Alex Morgan',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      category: 'Property Insights',
      tags: ['Manhattan', 'Wholesale', 'Investing'],
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      featured: true
    },
    {
      id: '2',
      title: 'Understanding NYC Foreclosure Laws: A Guide for Investors',
      excerpt: 'Navigate the complex legal landscape of NYC foreclosures with our comprehensive guide to laws, regulations, and investor rights.',
      content: '',
      date: '2024-10-10',
      author: {
        name: 'Jamie Chen',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      category: 'Legal Insights',
      tags: ['Foreclosure', 'Legal', 'NYC'],
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: '3',
      title: 'Maximizing ROI in Brooklyn Multi-Family Properties',
      excerpt: 'Learn proven strategies to increase rental income and property value in Brooklyn\'s competitive multi-family market.',
      content: '',
      date: '2024-10-05',
      author: {
        name: 'Maria Rodriguez',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
      },
      category: 'Investment Strategies',
      tags: ['Brooklyn', 'Multi-Family', 'ROI'],
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      featured: true
    },
    {
      id: '4',
      title: 'Market Trends: Queens Real Estate Outlook for 2025',
      excerpt: 'Explore emerging neighborhoods and investment opportunities in Queens as the borough continues its rapid development.',
      content: '',
      date: '2024-09-28',
      author: {
        name: 'David Kim',
        avatar: 'https://randomuser.me/api/portraits/men/65.jpg'
      },
      category: 'Market Analysis',
      tags: ['Queens', 'Market Trends', '2025'],
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: '5',
      title: 'Financing Strategies for First-Time Real Estate Investors',
      excerpt: 'Discover the best financing options and strategies for new investors entering the NYC real estate market.',
      content: '',
      date: '2024-09-20',
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://randomuser.me/api/portraits/women/22.jpg'
      },
      category: 'Financing',
      tags: ['First-Time', 'Financing', 'Investors'],
      readTime: '9 min read',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: '6',
      title: 'Tax Benefits of Real Estate Investing in NYC',
      excerpt: 'Maximize your investment returns by understanding the tax advantages available to NYC real estate investors.',
      content: '',
      date: '2024-09-15',
      author: {
        name: 'Michael Torres',
        avatar: 'https://randomuser.me/api/portraits/men/83.jpg'
      },
      category: 'Tax Insights',
      tags: ['Tax', 'Benefits', 'NYC'],
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    }
  ];

  // Categories data
  const categories: Category[] = [
    { id: 'all', name: 'All Categories', count: blogPosts.length },
    { id: 'property-insights', name: 'Property Insights', count: 12 },
    { id: 'investment-strategies', name: 'Investment Strategies', count: 8 },
    { id: 'market-analysis', name: 'Market Analysis', count: 7 },
    { id: 'legal-insights', name: 'Legal Insights', count: 5 },
    { id: 'financing', name: 'Financing', count: 6 },
    { id: 'tax-insights', name: 'Tax Insights', count: 4 }
  ];

  // Tags data
  const tags = ['Manhattan', 'Brooklyn', 'Queens', 'Wholesale', 'Foreclosure', 'Multi-Family', 'ROI', 'Legal', 'Financing', 'Tax', '2025', 'Investing'];

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
                    <Link to={`/blog/${featuredPost.id}`} className="hover:text-accent-yellow transition-colors">
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
                      <Link to={`/blog/${post.id}`} className="hover:text-accent-yellow transition-colors">
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
                      to={`/blog/${post.id}`}
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