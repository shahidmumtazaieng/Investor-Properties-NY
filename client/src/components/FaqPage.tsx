import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, MagnifyingGlassIcon } from './icons';
import Button from './ui/Button';
import Card from './ui/Card';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  relatedLink?: {
    text: string;
    url: string;
  };
}

const FaqPage: React.FC = () => {
  const [openFaqs, setOpenFaqs] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleFaq = (id: string) => {
    setOpenFaqs(prevOpenFaqs => 
      prevOpenFaqs.includes(id) 
        ? prevOpenFaqs.filter(faqId => faqId !== id) 
        : [...prevOpenFaqs, id]
    );
  };

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'What is Investor Properties NY?',
      answer: 'Investor Properties NY is NYC\'s premier platform for exclusive wholesale properties and foreclosure opportunities. We connect property owners seeking quick sales with serious investors looking for profitable deals.',
      category: 'General'
    },
    {
      id: '2',
      question: 'Who can use your platform?',
      answer: 'Our platform is designed for real estate investors of all levels, from first-time buyers to institutional investors. Property sellers who want to reach our network of qualified buyers can also list their properties.',
      category: 'General'
    },
    {
      id: '3',
      question: 'Is there a fee to join?',
      answer: 'Basic membership is free. We offer premium subscription plans for access to our full foreclosure listings and advanced investment tools. Property sellers pay a small commission only when their property sells.',
      category: 'Pricing'
    },
    {
      id: '4',
      question: 'How do I verify my investor status?',
      answer: 'After signing up, you\'ll need to provide documentation of your investing experience or complete our investor verification process. This ensures all members are serious investors.',
      category: 'Account'
    },
    {
      id: '5',
      question: 'What types of properties do you list?',
      answer: 'We specialize in off-market wholesale properties including single-family homes, multi-family buildings, condos, townhouses, and commercial properties across all five NYC boroughs.',
      category: 'Properties'
    },
    {
      id: '6',
      question: 'How often are new properties added?',
      answer: 'We add new properties daily. Our team actively sources deals from motivated sellers, wholesalers, and foreclosure auctions to ensure our members have access to the best opportunities.',
      category: 'Properties'
    },
    {
      id: '7',
      question: 'Are the properties already under contract?',
      answer: 'No, all properties listed on our platform are available for purchase. We work directly with sellers to ensure listings are current and accurate.',
      category: 'Properties'
    },
    {
      id: '8',
      question: 'Do you provide property inspection services?',
      answer: 'While we don\'t provide inspection services directly, we do include property condition information in our listings and can recommend trusted local inspectors.',
      category: 'Properties'
    },
    {
      id: '9',
      question: 'How do foreclosure auctions work?',
      answer: 'Foreclosure auctions are public sales where properties are sold to the highest bidder. We provide detailed information about auction dates, starting bids, and bidding strategies to help you succeed.',
      category: 'Foreclosures'
    },
    {
      id: '10',
      question: 'What is the minimum bid at foreclosure auctions?',
      answer: 'The minimum bid is typically set by the lender and is based on the property\'s appraised value. We provide this information for all foreclosure listings in our premium subscription.',
      category: 'Foreclosures'
    },
    {
      id: '11',
      question: 'Can I inspect a foreclosure property before the auction?',
      answer: 'Pre-auction inspections are often limited or not allowed. However, we provide detailed property information and can arrange exterior walkthroughs in many cases.',
      category: 'Foreclosures'
    },
    {
      id: '12',
      question: 'What happens after I win a foreclosure auction?',
      answer: 'After winning an auction, you\'ll need to complete the purchase within a specified timeframe (usually 30-45 days) and pay the full purchase price. We provide guidance throughout this process.',
      category: 'Foreclosures'
    },
    {
      id: '13',
      question: 'What is the typical profit margin on wholesale properties?',
      answer: 'Profit margins vary by property and market conditions, but our listings typically offer 10-30% profit potential after repairs and holding costs. We provide detailed profit analysis for each property.',
      category: 'Investing'
    },
    {
      id: '14',
      question: 'How do I finance wholesale property purchases?',
      answer: 'Options include hard money loans, private lenders, cash purchases, or partnerships. We provide financing guides and can connect you with preferred lenders in our network.',
      category: 'Investing'
    },
    {
      id: '15',
      question: 'What are the risks of wholesale property investing?',
      answer: 'Risks include property condition issues, market fluctuations, and financing challenges. Our platform helps mitigate these risks through detailed property analysis and market data.',
      category: 'Investing'
    },
    {
      id: '16',
      question: 'How quickly can I flip a wholesale property?',
      answer: 'Most wholesale flips take 3-6 months from purchase to sale. Timeline depends on property condition, market conditions, and your renovation efficiency.',
      category: 'Investing'
    }
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const filteredFaqs = faqs
    .filter(faq => 
      selectedCategory === '' || faq.category === selectedCategory
    )
    .filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
              Frequently Asked Questions
            </h1>
            <p className="text-body-lg mb-12 text-neutral-100">
              Find answers to common questions about our platform, properties, and investment opportunities
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Search */}
          <div className="mb-12">
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search FAQs..."
                className="w-full px-6 py-4 rounded-2xl border border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-neutral-400" />
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === ''
                  ? 'bg-primary-blue text-white shadow-lg'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-accent-yellow/10 hover:text-accent-yellow'
              }`}
            >
              All Questions
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-primary-blue text-white shadow-lg'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-accent-yellow/10 hover:text-accent-yellow'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-6">
            {filteredFaqs.map((faq, index) => (
              <div 
                key={faq.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card 
                  variant="modern" 
                  className="overflow-hidden cursor-pointer"
                >
                  <div className="p-6" onClick={() => toggleFaq(faq.id)}>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-primary-blue flex-1 pr-4">
                        {faq.question}
                      </h3>
                      <button className="text-accent-yellow p-2 rounded-full hover:bg-accent-yellow/10 transition-colors">
                        <ChevronDownIcon 
                          className={`w-5 h-5 transition-transform duration-300 ${
                            openFaqs.includes(faq.id) ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                    </div>
                    
                    {openFaqs.includes(faq.id) && (
                      <div className="mt-4 pt-4 border-t border-neutral-200">
                        <p className="text-neutral-600 whitespace-pre-line">{faq.answer}</p>
                        
                        {faq.relatedLink && (
                          <div className="mt-4">
                            <Link 
                              to={faq.relatedLink.url} 
                              className="text-accent-yellow hover:text-accent-yellow-dark font-medium inline-flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {faq.relatedLink.text}
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Still Need Help */}
          <Card variant="modern" className="mt-16 p-8 text-center">
            <h2 className="heading-section text-primary-blue mb-4">Still Have Questions?</h2>
            <p className="text-neutral-600 mb-6">
              Can't find the answer you're looking for? Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button variant="primary" className="px-8 py-3 rounded-2xl">
                  Contact Us
                </Button>
              </Link>
              <a href="tel:2125550123">
                <Button variant="secondary" className="px-8 py-3 rounded-2xl">
                  Call Us: (212) 555-0123
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;