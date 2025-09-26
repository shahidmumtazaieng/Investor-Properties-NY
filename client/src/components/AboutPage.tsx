import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, HeartIcon, CurrencyDollarIcon, MapPinIcon } from './icons';
import Button from './ui/Button';
import Card from './ui/Card';

const AboutPage: React.FC = () => {
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
              About Investor Properties NY
            </h1>
            <p className="text-xl md:text-2xl text-neutral-100 mb-12 leading-relaxed">
              NYC's premier platform for exclusive wholesale properties and foreclosure opportunities. 
              We're on a mission to democratize real estate investing.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
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
                  <Link to="/properties">
                    <Button variant="primary">
                      Browse Properties
                    </Button>
                  </Link>
                  <Link to="/auth/investor">
                    <Button variant="secondary">
                      Join Our Community
                    </Button>
                  </Link>
                </div>
              </div>
              
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
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-24 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="heading-section text-primary-blue mb-6">
              What We Offer
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              A comprehensive suite of tools and services designed to help you succeed in real estate investing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPinIcon className="w-8 h-8" />,
                title: 'Exclusive Property Listings',
                description: 'Access to off-market properties not available on public listings with verified profit potential'
              },
              {
                icon: <CurrencyDollarIcon className="w-8 h-8" />,
                title: 'Investment Analysis',
                description: 'Comprehensive financial analysis including ARV, profit margins, and cap rates for every property'
              },
              {
                icon: <CheckIcon className="w-8 h-8" />,
                title: 'Verified Opportunities',
                description: 'All listings are thoroughly vetted to ensure accuracy and investment viability'
              },
              {
                icon: <HeartIcon className="w-8 h-8" />,
                title: 'Expert Network',
                description: 'Connect with experienced investors, property experts, and financing partners'
              },
              {
                icon: <HeartIcon className="w-8 h-8" />,
                title: 'Market Insights',
                description: 'Stay informed with weekly market reports and investment strategies from industry experts'
              },
              {
                icon: <CurrencyDollarIcon className="w-8 h-8" />,
                title: 'Deal Management',
                description: 'Tools to track, manage, and close your real estate investments from one platform'
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                variant="modern" 
                className={`p-8 text-center animate-slide-up delay-${index * 100}`}
              >
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-primary-blue mb-4">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
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
                className={`p-8 text-center animate-slide-up delay-${index * 200}`}
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

      {/* Stats Section */}
      <section className="py-24 bg-gradient-hero text-white">
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

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card variant="modern" className="max-w-4xl mx-auto p-12 text-center">
            <h2 className="heading-section text-primary-blue mb-6">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto">
              Get exclusive access to off-market properties, foreclosure opportunities, and expert market insights
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/auth/investor">
                <Button variant="primary" className="text-lg px-8 py-4">
                  Join as Investor
                </Button>
              </Link>
              <Link to="/auth/seller">
                <Button variant="secondary" className="text-lg px-8 py-4">
                  Join as Seller
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;