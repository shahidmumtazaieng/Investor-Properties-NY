import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, StarIcon, CheckIcon, UserGroupIcon, HomeIcon, ChartBarIcon, ShieldCheckIcon, LightBulbIcon, CurrencyDollarIcon } from './icons';
import PropertyCard from './property/PropertyCard';
import ForeclosureCard from './foreclosure/ForeclosureCard';
import Button from './ui/Button';
import Card from './ui/Card';

interface Property {
  id: string;
  address: string;
  neighborhood: string;
  borough: string;
  propertyType: string;
  beds: number;
  baths: string;
  sqft: number;
  price: string;
  arv?: string;
  estimatedProfit?: string;
  images: string[];
  description: string;
}

interface ForeclosureSample {
  id: string;
  address: string;
  county: string;
  auctionDate: string;
  startingBid: string;
  propertyType: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

const LandingPage: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [foreclosureSamples, setForeclosureSamples] = useState<ForeclosureSample[]>([]);
  const [testimonials] = useState<Testimonial[]>([
    {
      id: '1',
      name: 'Michael Rodriguez',
      role: 'Real Estate Investor',
      company: 'NYC Property Group',
      content: 'This platform has completely transformed how I find deals. The foreclosure listings alone have saved me countless hours of research.',
      rating: 5
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'First-Time Investor',
      company: '',
      content: 'As a new investor, I was overwhelmed until I found this platform. The property analysis tools made it easy to evaluate deals confidently.',
      rating: 5
    },
    {
      id: '3',
      name: 'David Chen',
      role: 'Institutional Investor',
      company: 'Metropolitan Capital',
      content: 'The institutional access has given us a competitive edge in the NYC market. The bulk deal opportunities are unmatched.',
      rating: 4
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLandingPageData();
  }, []);

  const fetchLandingPageData = async () => {
    try {
      // Fetch featured properties (first 6)
      const propertiesResponse = await fetch('/api/public/properties');
      const properties = await propertiesResponse.json();
      setFeaturedProperties(properties.slice(0, 6));

      // Fetch foreclosure samples
      const foreclosuresResponse = await fetch('/api/public/foreclosures/samples');
      const foreclosureData = await foreclosuresResponse.json();
      setForeclosureSamples(foreclosureData.samples || []);

    } catch (error) {
      console.error('Error fetching landing page data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center animate-bounce-in">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <span className="text-3xl font-bold text-white">IP</span>
          </div>
          <div className="text-xl text-white animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section - Professional Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
        {/* Dynamic Background with Advanced Parallax */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1510655083999-4b632cd36e87?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw1fHxOWUMlMjBza3lsaW5lJTIwZ2xhc3MlMjB0b3dlcnMlMjBsdXh0cnklMjBidWlsZGluZ3MlMjBnb2xkZW4lMjBob3VyfGVufDB8MHx8b3JhbmdlfDE3NTg2MTU5Mzh8MA&ixlib=rb-4.1.0&q=85"
            alt="Modern NYC skyline at golden hour with glass towers and luxury buildings - Christopher Burns on Unsplash"
            className="w-full h-full object-cover scale-110 animate-fade-in opacity-40"
            style={{ width: '100%', height: '100vh' }}
          />
          <div className="absolute inset-0 bg-mesh-gradient"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          
          {/* Advanced Floating Elements */}
          <div className="absolute top-20 left-10 w-40 h-40 bg-accent-yellow/20 rounded-full animate-float backdrop-blur-sm"></div>
          <div className="absolute bottom-32 right-16 w-32 h-32 bg-success-emerald/20 rounded-full animate-float-delayed backdrop-blur-sm"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rotate-45 animate-float backdrop-blur-sm" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-accent-yellow/15 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
          
          {/* Particle Effect Simulation */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-accent-yellow rounded-full animate-pulse"></div>
            <div className="absolute top-3/4 left-2/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-success-emerald rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        {/* Hero Content with Enhanced Typography */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-7xl mx-auto">
            <div className="animate-slide-up">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                <span className="block text-white font-display">NYC's Premier</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-yellow via-accent-yellow-light to-accent-yellow animate-gradient-shift font-display">Off-Market</span>
                <span className="block text-white font-display">Real Estate Platform</span>
              </h1>
            </div>
            
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <p className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-5xl mx-auto leading-relaxed text-neutral-100 font-light">
                Discover exclusive wholesale properties and foreclosure opportunities 
                across New York City's five boroughs. Join thousands of investors 
                building wealth through off-market deals.
              </p>
            </div>
            
            <div className="animate-slide-up flex flex-col sm:flex-row gap-6 justify-center items-center mb-16" style={{ animationDelay: '0.6s' }}>
              <Link to="/properties">
                <Button variant="secondary" className="group text-xl px-10 py-5 rounded-2xl backdrop-blur-md bg-gradient-gold hover:shadow-2xl transform hover:scale-105 transition-all duration-500">
                  <MagnifyingGlassIcon className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Browse Properties
                </Button>
              </Link>
              <Link to="/auth/investor">
                <Button variant="outline" className="text-white border-2 border-white/50 hover:bg-white/20 backdrop-blur-md hover:text-white text-xl px-10 py-5 rounded-2xl transition-all duration-500">
                  Join as Investor
                </Button>
              </Link>
            </div>
            
            {/* Professional Stats Section - Integrated into Hero */}
            <div className="animate-slide-up flex flex-col sm:flex-row gap-12 justify-center items-center mt-20" style={{ animationDelay: '0.9s' }}>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent-yellow mb-2 animate-pulse-glow">500+</div>
                <div className="text-lg text-neutral-200 font-medium">Exclusive Properties</div>
              </div>
              <div className="w-1 h-1 bg-accent-yellow rounded-full hidden sm:block"></div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent-yellow mb-2 animate-pulse-glow">$50M+</div>
                <div className="text-lg text-neutral-200 font-medium">Deals Closed</div>
              </div>
              <div className="w-1 h-1 bg-accent-yellow rounded-full hidden sm:block"></div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent-yellow mb-2 animate-pulse-glow">2000+</div>
                <div className="text-lg text-neutral-200 font-medium">Active Investors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center backdrop-blur-sm">
            <div className="w-2 h-4 bg-accent-yellow rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="heading-section text-primary-blue mb-6">
              Why Choose Investor Properties NY?
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-12">
              We provide exclusive access to off-market real estate opportunities that traditional platforms can't offer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card variant="modern" className="p-8 text-center animate-slide-up">
              <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <HomeIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary-blue mb-4">Exclusive Listings</h3>
              <p className="text-neutral-600 leading-relaxed">
                Access to off-market properties not available on public listings with verified profit potential
              </p>
            </Card>

            <Card variant="modern" className="p-8 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-6">
                <ChartBarIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary-blue mb-4">Investment Analysis</h3>
              <p className="text-neutral-600 leading-relaxed">
                Comprehensive financial analysis including ARV, profit margins, and cap rates for every property
              </p>
            </Card>

            <Card variant="modern" className="p-8 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary-blue mb-4">Expert Network</h3>
              <p className="text-neutral-600 leading-relaxed">
                Connect with experienced investors, property experts, and financing partners
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            <div className="animate-slide-in-right">
              <Card variant="modern" className="p-8">
                <div className="bg-gradient-hero rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Our Core Values</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckIcon className="w-6 h-6 text-accent-yellow mr-3 mt-1 flex-shrink-0" />
                      <span>Transparency in all our dealings</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-6 h-6 text-accent-yellow mr-3 mt-1 flex-shrink-0" />
                      <span>Democratizing access to real estate opportunities</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-6 h-6 text-accent-yellow mr-3 mt-1 flex-shrink-0" />
                      <span>Empowering investors with data-driven insights</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-6 h-6 text-accent-yellow mr-3 mt-1 flex-shrink-0" />
                      <span>Building long-term relationships with our community</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
            
            <div>
              <h2 className="heading-section text-primary-blue mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                At Investor Properties NY, we believe that successful real estate investing should be accessible to everyone, 
                not just those with insider connections. Our platform bridges the gap between property owners seeking 
                quick sales and investors looking for profitable opportunities.
              </p>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                We've built a comprehensive ecosystem that provides everything investors need to find, evaluate, 
                and close profitable deals in the competitive NYC real estate market.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/about">
                  <Button variant="primary">
                    Learn More About Us
                  </Button>
                </Link>
                <Link to="/properties">
                  <Button variant="secondary">
                    Browse Properties
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center mb-16">
            <h2 className="heading-section text-primary-blue mb-6">
              Our Leadership Team
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Experienced professionals dedicated to revolutionizing real estate investing in NYC
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Alex Morgan',
                role: 'Founder & CEO',
                bio: '15+ years in NYC real estate investing and development. Former investment banker with expertise in property valuation and market analysis.'
              },
              {
                name: 'Jamie Chen',
                role: 'Chief Technology Officer',
                bio: 'Tech entrepreneur with a focus on real estate platforms. Previously led engineering teams at major PropTech companies.'
              },
              {
                name: 'Maria Rodriguez',
                role: 'Head of Investor Relations',
                bio: 'Licensed real estate broker with deep connections in the NYC investment community. Former portfolio manager at a major REIT.'
              }
            ].map((member, index) => (
              <Card 
                key={index} 
                variant="modern" 
                className="p-8 text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="bg-gradient-hero w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-primary-blue mb-2">{member.name}</h3>
                <div className="text-accent-yellow font-semibold mb-4">{member.role}</div>
                <p className="text-neutral-600">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Featured Properties Section */}
      <section className="section-padding bg-gradient-to-br from-neutral-50 via-white to-neutral-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-block mb-6">
              <span className="px-6 py-3 bg-gradient-gold text-white rounded-full text-sm font-semibold uppercase tracking-wide">
                Top Rated Properties
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-primary-blue mb-8 font-display">
              Featured Properties
            </h2>
            <p className="text-xl text-neutral-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Exclusive off-market opportunities with verified profit potential and comprehensive investment analysis
            </p>
            
            {/* Enhanced Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="px-6 py-4 bg-gradient-to-r from-success-emerald/10 to-success-emerald/20 text-success-emerald rounded-2xl text-sm font-semibold border border-success-emerald/20 backdrop-blur-sm">
                <span className="mr-2">✓</span>Verified Profit Margins
              </div>
              <div className="px-6 py-4 bg-gradient-to-r from-accent-yellow/10 to-accent-yellow/20 text-accent-yellow rounded-2xl text-sm font-semibold border border-accent-yellow/20 backdrop-blur-sm">
                <span className="mr-2">✓</span>Off-Market Exclusive
              </div>
              <div className="px-6 py-4 bg-gradient-to-r from-primary-blue/10 to-primary-blue/20 text-primary-blue rounded-2xl text-sm font-semibold border border-primary-blue/20 backdrop-blur-sm">
                <span className="mr-2">✓</span>Investment Ready
              </div>
            </div>
          </div>

          {/* Asymmetric Property Grid - Modern Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredProperties.map((property, index) => (
              <div 
                key={property.id} 
                className={`animate-slide-up ${index === 0 ? 'lg:col-span-2 lg:row-span-1' : ''}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <PropertyCard 
                  property={property}
                  animationDelay={index * 0.15}
                />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/properties">
              <Button variant="primary" className="text-xl px-12 py-6 rounded-2xl bg-gradient-primary hover:shadow-2xl transform hover:scale-105 transition-all duration-500">
                View All Properties
                <span className="ml-3 text-2xl">→</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-gradient-hero text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="heading-section text-white mb-6">
              What Our Investors Say
            </h2>
            <p className="text-xl text-neutral-100 max-w-3xl mx-auto">
              Join thousands of successful investors who have found profitable deals through our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.id} 
                variant="glass" 
                className="p-8 animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-accent-yellow fill-current' : 'text-neutral-400'}`} 
                    />
                  ))}
                </div>
                <p className="text-neutral-100 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="bg-gradient-gold w-12 h-12 rounded-full flex items-center justify-center mr-4">
                    <span className="font-bold text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-neutral-300">{testimonial.role}</div>
                    {testimonial.company && (
                      <div className="text-xs text-accent-yellow">{testimonial.company}</div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Foreclosure Preview Section */}
      <section className="section-padding bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f57c00' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="heading-section text-primary-blue mb-6">
              Foreclosure Opportunities
            </h2>
            <p className="text-body-lg text-neutral-600 mb-8 max-w-3xl mx-auto">
              Get exclusive access to upcoming foreclosure auctions with insider insights, bidding strategies, and market analysis
            </p>
            
            <Card variant="modern" className="max-w-4xl mx-auto p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center">
                    <span className="text-3xl">🔒</span>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-primary-blue mb-4">Premium Foreclosure Access</h3>
                  <p className="text-neutral-600 mb-6">
                    Full foreclosure listings with detailed information, bidding strategies, 
                    and daily updates are available to subscribed members only.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <div className="flex items-center text-success-emerald">
                      <span className="w-2 h-2 bg-success-emerald rounded-full mr-2"></span>
                      <span className="text-sm font-medium">2000+ Active Subscribers</span>
                    </div>
                    <div className="flex items-center text-accent-yellow">
                      <span className="w-2 h-2 bg-accent-yellow rounded-full mr-2"></span>
                      <span className="text-sm font-medium">Daily Market Updates</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
            {foreclosureSamples.map((foreclosure, index) => (
              <div key={foreclosure.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <ForeclosureCard 
                  foreclosure={foreclosure}
                  animationDelay={index * 0.1}
                />
              </div>
            ))}
          </div>

          <div className="text-center space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/foreclosures">
                <Button variant="outline" className="text-lg px-8 py-4">
                  View More Samples
                </Button>
              </Link>
              <Link to="/auth/investor">
                <Button variant="success" className="text-lg px-8 py-4">
                  Subscribe for Full Access
                  <span className="ml-2">🚀</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Benefits Section */}
      <section className="section-padding bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="heading-section text-primary-blue mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Our platform provides all the tools and resources you need to find, evaluate, and close profitable real estate deals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                {[
                  {
                    title: 'Advanced Property Search',
                    description: 'Filter properties by location, price, property type, and investment metrics to find exactly what you\'re looking for.',
                    icon: <MagnifyingGlassIcon className="w-6 h-6" />
                  },
                  {
                    title: 'Investment Analysis Tools',
                    description: 'Access detailed financial analysis including ARV, profit margins, cap rates, and cash flow projections.',
                    icon: <ChartBarIcon className="w-6 h-6" />
                  },
                  {
                    title: 'Foreclosure Alerts',
                    description: 'Get notified about new foreclosure listings in your preferred areas before they hit the market.',
                    icon: <CheckIcon className="w-6 h-6" />
                  },
                  {
                    title: 'Expert Market Insights',
                    description: 'Stay informed with weekly market reports and investment strategies from industry experts.',
                    icon: <UserGroupIcon className="w-6 h-6" />
                  },
                  {
                    title: 'Verified Opportunities',
                    description: 'All listings are thoroughly vetted to ensure accuracy and investment viability.',
                    icon: <ShieldCheckIcon className="w-6 h-6" />
                  },
                  {
                    title: 'Deal Management',
                    description: 'Tools to track, manage, and close your real estate investments from one platform.',
                    icon: <LightBulbIcon className="w-6 h-6" />
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="bg-gradient-gold w-12 h-12 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary-blue mb-2">{feature.title}</h3>
                      <p className="text-neutral-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="animate-slide-in-right">
              <Card variant="modern" className="p-8">
                <div className="bg-gradient-hero rounded-2xl p-8 text-white text-center">
                  <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                  <p className="mb-6">Join our community of successful real estate investors today</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/auth/investor" className="btn-secondary flex-1">
                      Join as Investor
                    </Link>
                    <Link to="/auth/seller" className="btn-outline text-white border-2 border-white/50 hover:bg-white/20 backdrop-blur-md hover:text-white flex-1">
                      Join as Seller
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-gradient-hero text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="heading-section text-white mb-6">
              By The Numbers
            </h2>
            <p className="text-xl text-neutral-100 max-w-3xl mx-auto">
              Our platform has helped investors close millions in profitable real estate deals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Exclusive Properties' },
              { value: '$50M+', label: 'Deals Closed' },
              { value: '2000+', label: 'Active Investors' },
              { value: '98%', label: 'Customer Satisfaction' }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl font-bold text-accent-yellow mb-4 animate-pulse-glow">
                  {stat.value}
                </div>
                <div className="text-xl text-neutral-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default LandingPage;
