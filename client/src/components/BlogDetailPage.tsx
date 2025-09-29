import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from './icons';
import Button from './ui/Button';
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

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/blogs/${slug}`);
        const data = await response.json();
        
        if (data.success && data.post) {
          setBlogPost({
            id: data.post.id,
            title: data.post.title,
            excerpt: data.post.excerpt || '',
            content: data.post.content,
            date: new Date(data.post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            author: {
              name: data.post.author,
              avatar: `https://ui-avatars.com/api/?name=${data.post.author}&background=random`
            },
            category: 'Property Insights', // Default category
            tags: data.post.tags || [],
            readTime: '5 min read', // Default read time
            image: data.post.coverImage || '/placeholder-blog.jpg',
            featured: data.post.featured || false
          });
        } else {
          setError('Blog post not found');
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  if (loading) {
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

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-primary-blue mb-4">Blog Post Not Found</h1>
            <p className="text-neutral-600 mb-6">{error || 'The blog post you are looking for does not exist.'}</p>
            <Button variant="primary" onClick={() => navigate('/blog')}>
              Back to Blog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-accent-yellow/20 rounded-full animate-float backdrop-blur-sm"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-success-emerald/20 rounded-full animate-float-delayed backdrop-blur-sm"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-6"
            >
              <ChevronDownIcon className="w-5 h-5 mr-2 transform rotate-90" />
              Back to Blog
            </Link>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/90 mb-4">
              <span>{blogPost.date}</span>
              <span>•</span>
              <span>{blogPost.readTime}</span>
              <span>•</span>
              <span>{blogPost.category}</span>
            </div>
            
            <h1 className="heading-hero mb-6 text-white">
              {blogPost.title}
            </h1>
            
            <div className="flex items-center">
              <img 
                src={blogPost.author.avatar} 
                alt={blogPost.author.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <div className="font-semibold">{blogPost.author.name}</div>
                <div className="text-white/80 text-sm">Author</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card variant="modern" className="overflow-hidden mb-12">
            <img 
              src={blogPost.image} 
              alt={blogPost.title}
              className="w-full h-96 object-cover"
            />
            
            <div className="p-8">
              {blogPost.excerpt && (
                <p className="text-xl text-neutral-700 font-medium mb-8 italic">
                  {blogPost.excerpt}
                </p>
              )}
              
              <div 
                className="prose max-w-none prose-headings:text-primary-blue prose-a:text-accent-yellow prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: blogPost.content.replace(/\n/g, '<br />') }}
              />
            </div>
          </Card>

          {blogPost.tags.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-primary-blue mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blogPost.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-neutral-200 pt-8">
            <div className="flex items-center">
              <img 
                src={blogPost.author.avatar} 
                alt={blogPost.author.name}
                className="w-16 h-16 rounded-full mr-6"
              />
              <div>
                <h3 className="text-xl font-bold text-primary-blue">{blogPost.author.name}</h3>
                <p className="text-neutral-600 mb-4">
                  Author and real estate investment expert with over 10 years of experience in the NYC market.
                </p>
                <Button variant="outline">
                  View More Articles
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;