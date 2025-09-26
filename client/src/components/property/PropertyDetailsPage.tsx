import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MapPinIcon, 
  CurrencyDollarIcon, 
  HeartIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '../icons';
import Button from '../ui/Button';
import Card from '../ui/Card';
import PropertyCard from './PropertyCard';

interface Property {
  id: string;
  address: string;
  neighborhood: string;
  borough: string;
  propertyType: string;
  beds: number;
  baths: string;
  sqft: number;
  units?: number;
  price: string;
  arv?: string;
  estimatedProfit?: string;
  capRate?: string;
  annualIncome?: string;
  condition: string;
  access: string;
  images: string[];
  description: string;
  status: string;
  createdAt?: string;
  yearBuilt?: number;
  lotSize?: number;
  parkingSpaces?: number;
  heating?: string;
  cooling?: string;
  flooring?: string;
  appliances?: string[];
  utilities?: string[];
  zoning?: string;
  taxes?: string;
  hoa?: string;
  schools?: {
    elementary?: string;
    middle?: string;
    high?: string;
  };
  walkScore?: number;
  transitScore?: number;
  bikeScore?: number;
}

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails(id);
      fetchSimilarProperties(id);
    }
  }, [id]);

  const fetchPropertyDetails = async (propertyId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/properties/${propertyId}`);
      if (!response.ok) {
        throw new Error('Property not found');
      }
      const data = await response.json();
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property details:', error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProperties = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/public/properties/${propertyId}/similar`);
      if (!response.ok) {
        setSimilarProperties([]);
        return;
      }
      const data = await response.json();
      setSimilarProperties(data);
    } catch (error) {
      console.error('Error fetching similar properties:', error);
      setSimilarProperties([]);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseInt(price));
  };

  const handleMakeOffer = () => {
    if (!user) {
      window.location.href = '/auth/investor';
      return;
    }
    setShowContactForm(true);
  };

  const propertyImages = property?.images?.length ? property.images : [
    'https://images.unsplash.com/photo-1666585607888-3f6fe0b323d8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw2fHxsdXh1cnklMjBhcGFydG1lbnQlMjBtb2Rlcm4lMjBpbnRlcmlvciUyMGZsb29yJTIwdG8lMjBjZWlsaW5nJTIwd2luZG93cyUyMGNpdHklMjB2aWV3fGVufDB8MHx8fDE3NTg2MTU5Mzh8MA&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1723468356955-a6c59c641a5b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBraXRjaGVuJTIwbWFyYmxlJTIwY291bnRlcnRvcHMlMjBtb2Rlcm4lMjBhcHBsaWFuY2VzfGVufDB8MHx8fDE3NTg2MTU5Mzh8MA&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1758565810954-7c97ad680715?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBraXRjaGVuJTIwbWFyYmxlJTIwY291bnRlcnRvcHMlMjBtb2Rlcm4lMjBhcHBsaWFuY2VzfGVufDB8MHx8fDE3NTg2MTU5Mzh8MA&ixlib=rb-4.1.0&q=85'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-xl text-white animate-pulse">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">Property Not Found</h2>
          <p className="text-neutral-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Link to="/properties">
            <Button variant="primary">Browse All Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex space-x-2 text-sm">
            <Link to="/" className="text-neutral-500 hover:text-primary-blue">Home</Link>
            <span className="text-neutral-400">/</span>
            <Link to="/properties" className="text-neutral-500 hover:text-primary-blue">Properties</Link>
            <span className="text-neutral-400">/</span>
            <span className="text-primary-blue font-medium">{property.address}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Modern Full-Width Image Gallery */}
            <div className="mb-12 -mx-4 lg:-mx-8">
              <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/60 via-transparent to-transparent z-10"></div>
                <img
                  src={propertyImages[currentImageIndex]}
                  alt={`${property.address} - Property Image`}
                  className="w-full h-[500px] lg:h-[600px] object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                  style={{ width: '100%', height: '500px' }}
                  onClick={() => setShowImageModal(true)}
                />
                
                {/* Floating Action Buttons */}
                <div className="absolute top-6 right-6 z-20 flex gap-3">
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="px-4 py-3 bg-glass-bg-dark backdrop-blur-md text-white rounded-2xl text-sm hover:bg-glass-bg-strong transition-all duration-300 border border-glass-border-dark"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
                    View All ({propertyImages.length})
                  </button>
                  <button className="p-3 bg-glass-bg-dark backdrop-blur-md rounded-2xl hover:bg-glass-bg-strong transition-all duration-300 border border-glass-border-dark">
                    <HeartIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                {/* Property Info Overlay */}
                <div className="absolute bottom-6 left-6 z-20">
                  <div className="bg-glass-bg-dark backdrop-blur-md rounded-2xl p-6 border border-glass-border-dark">
                    <h1 className="text-2xl font-bold text-white mb-2">{property.address}</h1>
                    <div className="flex items-center text-neutral-200 mb-3">
                      <MapPinIcon className="w-5 h-5 mr-2 text-accent-yellow" />
                      <span>{property.neighborhood}, {property.borough}</span>
                    </div>
                    <div className="flex items-center text-accent-yellow">
                      <CurrencyDollarIcon className="w-6 h-6 mr-1" />
                      <span className="text-3xl font-bold">{formatPrice(property.price)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Thumbnail Gallery */}
              <div className="mt-6 px-4 lg:px-8">
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {propertyImages.map((image, index) => (
                    <div
                      key={index}
                      className={`relative flex-shrink-0 cursor-pointer transition-all duration-300 ${
                        index === currentImageIndex ? 'ring-4 ring-accent-yellow scale-105' : 'hover:scale-105'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`Property thumbnail ${index + 1}`}
                        className="w-24 h-20 object-cover rounded-2xl"
                        style={{ width: '96px', height: '80px' }}
                      />
                      {index === currentImageIndex && (
                        <div className="absolute inset-0 bg-accent-yellow/20 rounded-2xl"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Property Details */}
            <Card variant="modern" className="mb-8">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="heading-card text-primary-blue mb-2">{property.address}</h1>
                    <div className="flex items-center text-neutral-600 mb-4">
                      <MapPinIcon className="w-5 h-5 mr-2" />
                      <span>{property.neighborhood}, {property.borough}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-success-emerald mb-2">
                      <CurrencyDollarIcon className="w-6 h-6 mr-1" />
                      <span className="text-3xl font-bold">{formatPrice(property.price)}</span>
                    </div>
                    <span className="text-sm text-neutral-500">{property.propertyType}</span>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 bg-neutral-100 rounded-xl">
                    <div className="text-2xl font-bold text-primary-blue">{property.beds}</div>
                    <div className="text-sm text-neutral-600">Bedrooms</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-100 rounded-xl">
                    <div className="text-2xl font-bold text-primary-blue">{property.baths}</div>
                    <div className="text-sm text-neutral-600">Bathrooms</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-100 rounded-xl">
                    <div className="text-2xl font-bold text-primary-blue">{property.sqft?.toLocaleString()}</div>
                    <div className="text-sm text-neutral-600">Sq Ft</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-100 rounded-xl">
                    <div className="text-2xl font-bold text-primary-blue">{property.yearBuilt || 'N/A'}</div>
                    <div className="text-sm text-neutral-600">Year Built</div>
                  </div>
                </div>

                {/* Enhanced Investment Metrics */}
                {(property.estimatedProfit || property.capRate || property.arv) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {property.estimatedProfit && (
                      <div className="bg-gradient-gold p-8 rounded-3xl text-white text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                          <div className="text-sm font-semibold mb-2 uppercase tracking-wide">Est. Profit</div>
                          <div className="text-3xl font-bold">{formatPrice(property.estimatedProfit)}</div>
                        </div>
                      </div>
                    )}
                    {property.capRate && (
                      <div className="bg-gradient-success p-8 rounded-3xl text-white text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                        <div className="relative z-10">
                          <div className="text-sm font-semibold mb-2 uppercase tracking-wide">Cap Rate</div>
                          <div className="text-3xl font-bold">{property.capRate}%</div>
                        </div>
                      </div>
                    )}
                    {property.arv && (
                      <div className="bg-gradient-primary p-8 rounded-3xl text-white text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                        <div className="absolute top-1/2 right-0 w-12 h-12 bg-white/10 rounded-full -mr-6"></div>
                        <div className="relative z-10">
                          <div className="text-sm font-semibold mb-2 uppercase tracking-wide">ARV</div>
                          <div className="text-3xl font-bold">{formatPrice(property.arv)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-primary-blue mb-4">Description</h3>
                  <p className="text-neutral-700 leading-relaxed">{property.description}</p>
                </div>

                {/* Property Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-primary-blue mb-4">Property Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Property Type:</span>
                        <span className="font-medium">{property.propertyType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Condition:</span>
                        <span className="font-medium">{property.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Access:</span>
                        <span className="font-medium">{property.access}</span>
                      </div>
                      {property.lotSize && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Lot Size:</span>
                          <span className="font-medium">{property.lotSize.toLocaleString()} sq ft</span>
                        </div>
                      )}
                      {property.parkingSpaces && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Parking:</span>
                          <span className="font-medium">{property.parkingSpaces} spaces</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-primary-blue mb-4">Financial Details</h3>
                    <div className="space-y-3">
                      {property.taxes && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Annual Taxes:</span>
                          <span className="font-medium">{formatPrice(property.taxes)}</span>
                        </div>
                      )}
                      {property.hoa && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">HOA Fee:</span>
                          <span className="font-medium">{formatPrice(property.hoa)}/month</span>
                        </div>
                      )}
                      {property.annualIncome && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Annual Income:</span>
                          <span className="font-medium text-success-emerald">{formatPrice(property.annualIncome)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Status:</span>
                        <span className="font-medium capitalize">{property.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Neighborhood Info */}
            <Card variant="modern">
              <div className="p-8">
                <h3 className="text-xl font-semibold text-primary-blue mb-6">Neighborhood & Walkability</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-blue mb-2">{property.walkScore || 85}</div>
                    <div className="text-sm text-neutral-600">Walk Score</div>
                    <div className="text-xs text-neutral-500 mt-1">Very Walkable</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent-yellow mb-2">{property.transitScore || 78}</div>
                    <div className="text-sm text-neutral-600">Transit Score</div>
                    <div className="text-xs text-neutral-500 mt-1">Excellent Transit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success-emerald mb-2">{property.bikeScore || 72}</div>
                    <div className="text-sm text-neutral-600">Bike Score</div>
                    <div className="text-xs text-neutral-500 mt-1">Very Bikeable</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Enhanced Contact Form */}
            <div className="card-floating mb-8 sticky top-4">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-primary-blue mb-8">Interested in this property?</h3>
                <div className="space-y-4">
                  <Button variant="primary" onClick={handleMakeOffer} className="w-full py-4 rounded-2xl text-lg font-semibold bg-gradient-primary hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    Make an Offer
                  </Button>
                  <Button variant="outline" className="w-full py-4 rounded-2xl text-lg font-semibold border-2 hover:bg-primary-blue hover:text-white transition-all duration-300">
                    Schedule Viewing
                  </Button>
                  <Button variant="secondary" className="w-full py-4 rounded-2xl text-lg font-semibold bg-gradient-gold hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    Request Info
                  </Button>
                </div>
                
                <div className="mt-8 pt-8 border-t border-neutral-200">
                  <div className="flex items-center space-x-4 mb-6">
                    <img
                      src="https://i.pravatar.cc/60?img=1"
                      alt="Agent"
                      className="w-16 h-16 rounded-full ring-4 ring-accent-yellow"
                      style={{ width: '64px', height: '64px' }}
                    />
                    <div>
                      <div className="text-lg font-bold text-primary-blue">Sarah Johnson</div>
                      <div className="text-sm text-neutral-600 font-medium">Senior Investment Advisor</div>
                    </div>
                  </div>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    Get expert guidance on this investment opportunity with personalized consultation.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-accent-yellow/10 rounded-xl">
                      <svg className="w-5 h-5 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="font-medium">(212) 555-0123</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-primary-blue/10 rounded-xl">
                      <svg className="w-5 h-5 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">sarah@investorpropertiesny.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <Card variant="modern">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-primary-blue mb-6">Similar Properties</h3>
                  <div className="space-y-4">
                    {similarProperties.map((similarProperty) => (
                      <Link
                        key={similarProperty.id}
                        to={`/properties/${similarProperty.id}`}
                        className="block hover:bg-neutral-50 p-4 rounded-xl transition-colors"
                      >
                        <div className="flex space-x-4">
                          <img
                            src={similarProperty.images[0] || propertyImages[0]}
                            alt={similarProperty.address}
                            className="w-20 h-16 object-cover rounded-lg"
                            style={{ width: '80px', height: '64px' }}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-primary-blue text-sm mb-1">
                              {similarProperty.address}
                            </h4>
                            <p className="text-xs text-neutral-600 mb-2">
                              {similarProperty.neighborhood}, {similarProperty.borough}
                            </p>
                            <div className="text-success-emerald font-bold text-sm">
                              {formatPrice(similarProperty.price)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link to="/properties" className="block mt-4">
                    <Button variant="outline" className="w-full text-sm">
                      View More Properties
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">
                Property Images ({currentImageIndex + 1} of {propertyImages.length})
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-white hover:text-neutral-300 text-2xl"
              >
                ×
              </button>
            </div>
            <img
              src={propertyImages[currentImageIndex]}
              alt={`Property image ${currentImageIndex + 1}`}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            <div className="flex justify-center space-x-2 mt-4">
              {propertyImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;