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
  slug: string;
  published: boolean;
  publishedAt?: string;
}

const BlogManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/blogs', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.blogs) {
        // Transform the data to match our BlogPost interface
        const transformedPosts = data.blogs.map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          excerpt: blog.excerpt || '',
          content: blog.content,
          date: blog.date || blog.createdAt || new Date().toISOString(),
          author: {
            name: blog.author || 'Unknown Author',
            avatar: authors.find(a => a.name === blog.author)?.avatar || authors[0].avatar
          },
          category: blog.category || categories[0],
          tags: Array.isArray(blog.tags) ? blog.tags : [],
          readTime: blog.readTime || '5 min read',
          image: blog.image || blog.coverImage || '/placeholder-blog.jpg',
          featured: blog.featured || false,
          slug: blog.slug || '',
          published: blog.published || false,
          publishedAt: blog.publishedAt || null
        }));
        setPosts(transformedPosts);
      } else {
        setError(data.message || 'Failed to fetch blog posts');
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setError('Network error. Please try again.');
    } finally {
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
      featured: false,
      slug: '',
      published: false
    });
    setIsEditing(true);
  };

  const handleView = async (postId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/blogs/${postId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.post) {
        // Transform the data to match our BlogPost interface
        const transformedPost: BlogPost = {
          id: data.post.id,
          title: data.post.title,
          excerpt: data.post.excerpt || '',
          content: data.post.content,
          date: data.post.date || data.post.createdAt || new Date().toISOString(),
          author: {
            name: data.post.author || 'Unknown Author',
            avatar: authors.find(a => a.name === data.post.author)?.avatar || authors[0].avatar
          },
          category: data.post.category || categories[0],
          tags: Array.isArray(data.post.tags) ? data.post.tags : [],
          readTime: data.post.readTime || '5 min read',
          image: data.post.image || data.post.coverImage || '/placeholder-blog.jpg',
          featured: data.post.featured || false,
          slug: data.post.slug || '',
          published: data.post.published || false,
          publishedAt: data.post.publishedAt || null
        };
        setCurrentPost(transformedPost);
        setIsEditing(true);
      } else {
        setError(data.message || 'Failed to fetch blog post');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost({ ...post });
    setIsEditing(true);
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/admin/blogs/${postId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
          setPosts(prev => prev.filter(post => post.id !== postId));
          alert('Blog post deleted successfully!');
        } else {
          setError(data.message || 'Failed to delete blog post');
        }
      } catch (error) {
        console.error('Error deleting blog post:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!currentPost || !currentPost.title || !currentPost.content || !currentPost.author.name) {
      alert('Please fill in all required fields (Title, Content, and Author).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      let response;
      let data;
      
      const blogData = {
        title: currentPost.title,
        excerpt: currentPost.excerpt,
        content: currentPost.content,
        author: currentPost.author.name,
        category: currentPost.category,
        tags: currentPost.tags,
        featured: currentPost.featured,
        image: currentPost.image,
        slug: currentPost.slug || currentPost.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        published: currentPost.published,
        publishedAt: currentPost.publishedAt
      };
      
      if (currentPost.id) {
        // Update existing post
        response = await fetch(`/api/admin/blogs/${currentPost.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(blogData),
        });
      } else {
        // Create new post
        response = await fetch('/api/admin/blogs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(blogData),
        });
      }
      
      data = await response.json();
      
      if (data.success) {
        if (currentPost.id) {
          // Update existing post
          setPosts(prev => prev.map(post => post.id === currentPost.id ? {
            ...post,
            ...data.post,
            author: {
              name: data.post.author,
              avatar: authors.find(a => a.name === data.post.author)?.avatar || authors[0].avatar
            },
            image: data.post.image || data.post.coverImage || '/placeholder-blog.jpg',
            date: data.post.date || data.post.updatedAt || post.date
          } : post));
          alert('Blog post updated successfully!');
        } else {
          // Create new post
          const newPost: BlogPost = {
            id: data.post.id,
            title: data.post.title,
            excerpt: data.post.excerpt || '',
            content: data.post.content,
            date: data.post.date || data.post.createdAt || new Date().toISOString(),
            author: {
              name: data.post.author,
              avatar: authors.find(a => a.name === data.post.author)?.avatar || authors[0].avatar
            },
            category: data.post.category || categories[0],
            tags: Array.isArray(data.post.tags) ? data.post.tags : [],
            readTime: data.post.readTime || '5 min read',
            image: data.post.image || data.post.coverImage || '/placeholder-blog.jpg',
            featured: data.post.featured || false,
            slug: data.post.slug || '',
            published: data.post.published || false,
            publishedAt: data.post.publishedAt || null
          };
          setPosts(prev => [...prev, newPost]);
          alert('Blog post created successfully!');
        }
        setIsEditing(false);
        setCurrentPost(null);
      } else {
        setError(data.message || 'Failed to save blog post');
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentPost(null);
    setError(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing && currentPost) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog List
            </button>
          </div>
          
          <Card className="bg-white shadow">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {currentPost.id ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h1>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <Input
                    type="text"
                    value={currentPost.title}
                    onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <Input
                    type="text"
                    value={currentPost.slug}
                    onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                    placeholder="auto-generated-from-title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <Textarea
                    rows={3}
                    value={currentPost.excerpt}
                    onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                  <Textarea
                    rows={12}
                    value={currentPost.content}
                    onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                    <Select
                      options={authors.map(author => ({ value: author.name, label: author.name }))}
                      value={currentPost.author.name}
                      onChange={(e) => setCurrentPost({ 
                        ...currentPost, 
                        author: authors.find(a => a.name === e.target.value) || authors[0] 
                      })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <Select
                      options={categories.map(category => ({ value: category, label: category }))}
                      value={currentPost.category}
                      onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <Input
                    type="text"
                    placeholder="Enter tags separated by commas"
                    value={currentPost.tags.join(', ')}
                    onChange={(e) => setCurrentPost({ 
                      ...currentPost, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                    })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                  <Input
                    type="text"
                    value={currentPost.image}
                    onChange={(e) => setCurrentPost({ ...currentPost, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publish Status</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentPost.published}
                        onChange={(e) => setCurrentPost({ ...currentPost, published: e.target.checked })}
                        className="h-4 w-4 text-primary-blue focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Published</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Featured Post</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentPost.featured}
                        onChange={(e) => setCurrentPost({ ...currentPost, featured: e.target.checked })}
                        className="h-4 w-4 text-primary-blue focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Mark as featured post</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : (currentPost.id ? 'Update Post' : 'Create Post')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
              <p className="mt-2 text-gray-600">Create, edit, and manage your blog posts</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="primary" onClick={handleCreateNew}>
                Create New Post
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select
                  options={[
                    { value: '', label: 'All Categories' },
                    ...categories.map(category => ({ value: category, label: category }))
                  ]}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Blog Posts Table */}
        <Card className="bg-white shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Blog Posts</h2>
              <span className="text-sm text-gray-500">{filteredPosts.length} posts</span>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Post
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPosts.map((post) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded-lg object-cover" 
                                src={post.image || '/placeholder-blog.jpg'} 
                                alt={post.title} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{post.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <img 
                                className="h-8 w-8 rounded-full" 
                                src={post.author.avatar} 
                                alt={post.author.name} 
                              />
                            </div>
                            <div className="ml-2">
                              <div className="text-sm text-gray-900">{post.author.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{post.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(post.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {post.featured ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Featured</span>
                          ) : post.published ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Published</span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Draft</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(post.id)}
                            >
                              View
                            </Button>
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
            ) : (
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
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BlogManagement;