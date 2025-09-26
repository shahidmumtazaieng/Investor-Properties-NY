import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, CheckIcon, LockClosedIcon, ChartBarIcon, LightBulbIcon, HomeIcon, MagnifyingGlassIcon, UserGroupIcon } from './icons';
import ForeclosureCard from './foreclosure/ForeclosureCard';
import Button from './ui/Button';
import Card from './ui/Card';

interface ForeclosureSample {
  id: string;
  address: string;
  county: string;
  auctionDate: string;
  startingBid: string;
  propertyType: string;
}

interface ForeclosureData {
  samples: ForeclosureSample[];
  totalAvailable: number;
  message: string;
}

const ForeclosurePage: React.FC = () => {
  const [foreclosureData, setForeclosureData] = useState<ForeclosureData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForeclosureSamples();
  }, []);

  const fetchForeclosureSamples = async () => {
    try {
      const response = await fetch('/api/public/foreclosures/samples');
      const data = await response.json();
      setForeclosureData(data);
    } catch (error) {
      console.error('Error fetching foreclosure samples:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseInt(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilAuction = (auctionDate: string) => {
    const auction = new Date(auctionDate);
    const today = new Date();
    const diffTime = auction.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-xl text-white animate-pulse">Loading foreclosure data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-accent-yellow/20 rounded-full animate-float backdrop-blur-sm"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-success-emerald/20 rounded-full animate-float-delayed backdrop-blur-sm"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <span className="px-6 py-3 bg-gradient-gold text-white rounded-full text-sm font-semibold uppercase tracking-wide">
                Premium Access
              </span>
            </div>
            <h1 className="heading-hero mb-8 text-white">
              Foreclosure Opportunities
            </h1>
            <p className="text-xl md:text-2xl text-neutral-100 mb-12 leading-relaxed">
              Get exclusive access to upcoming foreclosure auctions with insider insights, 
              bidding strategies, and market analysis
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/investor">
                <Button variant="success" className="px-8 py-4 rounded-2xl text-lg font-semibold">
                  Subscribe for Full Access
                  <span className="ml-2">🚀</span>
                </Button>
              </Link>
              <a href="#samples" className="btn-outline text-white border-white hover:bg-white hover:text-primary-blue px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300">
                View Sample Listings
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { value: '2000+', label: 'Active Subscribers' },
              { value: '150+', label: 'Daily Listings' },
              { value: '98%', label: 'Success Rate' },
              { value: '24/7', label: 'Market Updates' }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl font-bold text-accent-yellow mb-2">{stat.value}</div>
                <div className="text-neutral-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="heading-section text-primary-blue mb-6">
              How Our Foreclosure Service Works
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Get ahead of the competition with our comprehensive foreclosure investment platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Exclusive Access',
                description: 'Get early access to foreclosure listings before they hit public auction platforms',
                icon: <LockClosedIcon className="w-8 h-8" />
              },
              {
                step: '02',
                title: 'Detailed Analysis',
                description: 'Receive comprehensive property analysis including ARV, profit margins, and bidding strategies',
                icon: <ChartBarIcon className="w-8 h-8" />
              },
              {
                step: '03',
                title: 'Smart Bidding',
                description: 'Use our proprietary bidding algorithms to maximize your chances of winning profitable auctions',
                icon: <LightBulbIcon className="w-8 h-8" />
              }
            ].map((item, index) => (
              <Card 
                key={index} 
                variant="modern" 
                className="p-8 text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  {item.icon}
                </div>
                <div className="text-4xl font-bold text-accent-yellow mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-primary-blue mb-4">{item.title}</h3>
                <p className="text-neutral-600">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Listings */}
      <section id="samples" className="py-24 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="heading-section text-primary-blue mb-6">
              Sample Foreclosure Listings
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
              These are sample listings to demonstrate the quality of information available to subscribers
            </p>
            <Link to="/auth/investor" className="text-accent-yellow hover:text-accent-yellow-dark font-medium">
              Subscribe for Full Access →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {(foreclosureData?.samples || []).map((foreclosure: ForeclosureSample, index: number) => (
              <div key={foreclosure.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <ForeclosureCard 
                  foreclosure={foreclosure}
                  animationDelay={index * 0.1}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="heading-section text-primary-blue mb-6">
              Premium Subscription Features
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Everything you need to succeed in foreclosure investing
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                {[
                  {
                    title: 'Daily Foreclosure Listings',
                    description: 'Access to 150+ new foreclosure listings every day with detailed property information',
                    icon: <HomeIcon className="w-6 h-6" />
                  },
                  {
                    title: 'Advanced Search Filters',
                    description: 'Filter properties by location, price, property type, and investment metrics',
                    icon: <MagnifyingGlassIcon className="w-6 h-6" />
                  },
                  {
                    title: 'Bidding Strategies',
                    description: 'Proprietary bidding algorithms and strategies to maximize your success rate',
                    icon: <LightBulbIcon className="w-6 h-6" />
                  },
                  {
                    title: 'Market Analysis',
                    description: 'Weekly market reports and investment insights from industry experts',
                    icon: <ChartBarIcon className="w-6 h-6" />
                  },
                  {
                    title: 'Priority Support',
                    description: 'Dedicated support team for all your foreclosure investing questions',
                    icon: <UserGroupIcon className="w-6 h-6" />
                  },
                  {
                    title: 'Investment Tracking',
                    description: 'Tools to track, manage, and analyze your foreclosure investments',
                    icon: <CheckIcon className="w-6 h-6" />
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
                  <h3 className="text-2xl font-bold mb-4">Premium Foreclosure Access</h3>
                  <div className="text-5xl font-bold mb-2">$99</div>
                  <div className="text-neutral-200 mb-6">per month</div>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-accent-yellow mr-3 flex-shrink-0" />
                      <span>150+ daily foreclosure listings</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-accent-yellow mr-3 flex-shrink-0" />
                      <span>Comprehensive property analysis</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-accent-yellow mr-3 flex-shrink-0" />
                      <span>Advanced search filters</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-accent-yellow mr-3 flex-shrink-0" />
                      <span>Bidding strategies & algorithms</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-accent-yellow mr-3 flex-shrink-0" />
                      <span>Weekly market reports</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-accent-yellow mr-3 flex-shrink-0" />
                      <span>Priority customer support</span>
                    </li>
                  </ul>
                  <Link to="/auth/investor">
                    <Button variant="success" className="w-full py-4 rounded-2xl text-lg font-semibold">
                      Get Started Now
                    </Button>
                  </Link>
                  <div className="mt-4 text-sm text-neutral-300">
                    Cancel anytime. 30-day money-back guarantee.
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="heading-hero mb-8 text-white">
            Ready to Start Investing in Foreclosures?
          </h2>
          <p className="text-xl mb-12 max-w-4xl mx-auto text-neutral-100 leading-relaxed">
            Join our network of successful foreclosure investors and get access to exclusive listings, 
            expert analysis, and proven bidding strategies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/auth/investor">
              <Button variant="success" className="px-10 py-5 rounded-2xl text-lg font-semibold">
                Subscribe Now
                <span className="ml-2">🚀</span>
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" className="px-10 py-5 rounded-2xl text-lg font-semibold bg-white text-primary-blue hover:bg-neutral-100">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForeclosurePage;