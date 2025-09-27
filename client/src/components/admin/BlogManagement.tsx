import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';

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

const BlogManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);

  // Sample categories
  const categories = [
    'Property Insights',
    'Investment Strategies',
    'Market Analysis',
    'Legal Insights',
    'Financing',
    'Tax Insights'
  ];

  // Sample authors
  const authors = [
    { name: 'Alex Morgan', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Jamie Chen', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Maria Rodriguez', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { name: 'David Kim', avatar: 'https://randomuser.me/api/portraits/men/65.jpg' },
    { name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
    { name: 'Michael Torres', avatar: 'https://randomuser.me/api/portraits/men/83.jpg' }
  ];

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, selectedCategory]);

  const fetchBlogPosts = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        const samplePosts: BlogPost[] = [
          {
            id: '1',
            title: 'Top 10 Wholesale Properties in Manhattan for Q4 2024',
            excerpt: 'Discover the most profitable wholesale properties in Manhattan that are perfect for investors looking to flip or hold for rental income.',
            content: 'Full content of the blog post...',
            date: '2024-10-15',
            author: authors[0],
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
            content: 'Full content of the blog post...',
            date: '2024-10-10',
            author: authors[1],
            category: 'Legal Insights',
            tags: ['Foreclosure', 'Legal', 'NYC'],
            readTime: '8 min read',
            image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
          },
          {
            id: '3',
            title: 'Maximizing ROI in Brooklyn Multi-Family Properties',
            excerpt: 'Learn proven strategies to increase rental income and property value in Brooklyn\'s competitive multi-family market.',
            content: 'Full content of the blog post...',
            date: '2024-10-05',
            author: authors[2],
            category: 'Investment Strategies',
            tags: ['Brooklyn', 'Multi-Family', 'ROI'],
            readTime: '6 min read',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
            featured: true
          }
        ];
        setPosts(samplePosts);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let result = posts;
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(term) || 
        post.excerpt.toLowerCase().includes(term) ||
        post.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(post => post.category === selectedCategory);
    }
    
    setFilteredPosts(result);
  };

  const handleCreateNew = () => {
    setCurrentPost({
      id: '',
      title: '',
      excerpt: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      author: authors[0],
      category: categories[0],
      tags: [],
      readTime: '5 min read',
      image: '',
      featured: false
    });
    setIsEditing(true);
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost({ ...post });
    setIsEditing(true);
  };

  const handleDelete = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      setPosts(prev => prev.filter(post => post.id !== postId));
    }
  };

  const handleSave = () => {
    if (currentPost) {
      if (currentPost.id) {
        // Update existing post
        setPosts(prev => prev.map(post => post.id === currentPost.id ? currentPost : post));
      } else {
        // Create new post
        const newPost = {
          ...currentPost,
          id: Date.now().toString()
        };
        setPosts(prev => [...prev, newPost]);
      }
      setIsEditing(false);
      setCurrentPost(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentPost(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  if (isEditing && currentPost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {currentPost.id ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>

        <Card className="bg-white shadow">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  value={currentPost.title}
                  onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                  placeholder="Enter blog post title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select
                  value={currentPost.category}
                  onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                  options={categories.map(category => ({ value: category, label: category }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <Select
                  value={currentPost.author.name}
                  onChange={(e) => {
                    const selectedAuthor = authors.find(author => author.name === e.target.value);
                    if (selectedAuthor) {
                      setCurrentPost({ ...currentPost, author: selectedAuthor });
                    }
                  }}
                  options={authors.map(author => ({ value: author.name, label: author.name }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <Input
                  type="date"
                  value={currentPost.date}
                  onChange={(e) => setCurrentPost({ ...currentPost, date: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <Textarea
                  value={currentPost.excerpt}
                  onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                  placeholder="Enter a brief excerpt for the blog post"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <Textarea
                  value={currentPost.content}
                  onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                  placeholder="Enter the full content of the blog post"
                  rows={10}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <Input
                  value={currentPost.image}
                  onChange={(e) => setCurrentPost({ ...currentPost, image: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <Input
                  value={currentPost.tags.join(', ')}
                  onChange={(e) => setCurrentPost({ ...currentPost, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="md:col-span-2 flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={currentPost.featured || false}
                  onChange={(e) => setCurrentPost({ ...currentPost, featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                  Featured Post
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save Post
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="mt-1 text-gray-600">
            Manage blog posts and articles
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <Button variant="primary" onClick={handleCreateNew}>
            Create New Post
          </Button>
        </div>
      </div>

      <Card className="bg-white shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Blog Posts</h2>
            <span className="text-sm text-gray-500">
              {filteredPosts.length} of {posts.length} posts
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No blog posts found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || selectedCategory 
                  ? 'No posts match your current filters.' 
                  : 'Get started by creating a new blog post.'}
              </p>
              <div className="mt-6">
                <Button variant="primary" onClick={handleCreateNew}>
                  Create New Post
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Post
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-md object-cover" src={post.image} alt={post.title} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{post.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <img className="h-8 w-8 rounded-full" src={post.author.avatar} alt={post.author.name} />
                          </div>
                          <div className="ml-2">
                            <div className="text-sm text-gray-900">{post.author.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(post.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {post.featured ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Published
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(post)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(post.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BlogManagement;