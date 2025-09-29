import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  MapPinIcon,
  HomeIcon,
  LockClosedIcon
} from './icons';
import PropertyCard from './property/PropertyCard';
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
  estimatedProfit?: string;
  capRate?: string;
  annualIncome?: string;
  images: string[];
  description: string;
  status?: string;
  condition?: string;
  access?: string;
  arv?: string;
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
  createdAt?: string;
}

const PropertiesPage: React.FC = () => {
  console.log('PropertiesPage component rendering');
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBorough, setSelectedBorough] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    console.log('Properties updated:', properties);
    console.log('Filtered properties updated:', filteredProperties);
  }, [properties, filteredProperties]);

  useEffect(() => {
    // Re-apply filters when properties change
    if (properties.length > 0) {
      applyFilters();
    }
  }, [properties, searchTerm, selectedBorough, selectedType, priceRange]);

  const fetchProperties = async () => {
    try {
      console.log('Fetching properties...');
      const response = await fetch('/api/public/properties');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched data:', data);
      
      // Validate the data
      if (Array.isArray(data)) {
        console.log('Valid data received, setting properties');
        setProperties(data);
        setFilteredProperties(data); // Set filtered properties initially
      } else {
        console.log('Invalid data received, using fallback');
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Fallback to sample data if API fails
      console.log('Using sample data as fallback');
      const sampleData = [
        {
          id: '1',
          address: '123 Main St',
          neighborhood: 'Downtown',
          borough: 'Manhattan',
          propertyType: 'Single Family',
          beds: 3,
          baths: '2',
          sqft: 1500,
          price: '450000',
          estimatedProfit: '75000',
          capRate: '12.5',
          images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'],
          description: 'Beautiful modern home with updated kitchen and spacious backyard.'
        },
        {
          id: '2',
          address: '456 Park Ave',
          neighborhood: 'Midtown',
          borough: 'Manhattan',
          propertyType: 'Apartment',
          beds: 2,
          baths: '1',
          sqft: 1200,
          price: '650000',
          estimatedProfit: '95000',
          capRate: '14.2',
          images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'],
          description: 'Luxury apartment with city views and premium amenities.'
        }
      ];
      console.log('Setting sample data:', sampleData);
      setProperties(sampleData);
      setFilteredProperties(sampleData);
    } finally {
      console.log('Finished loading properties');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    console.log('Applying filters...', { searchTerm, selectedBorough, selectedType, priceRange });
    let filtered = [...properties];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property => 
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.borough.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Borough filter
    if (selectedBorough !== 'all') {
      filtered = filtered.filter(property => property.borough === selectedBorough);
    }

    // Property type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(property => property.propertyType === selectedType);
    }

    // Price range filter
    if (priceRange !== 'all') {
      filtered = filtered.filter(property => {
        const price = parseInt(property.price.replace(/[$,]/g, ''));
        switch (priceRange) {
          case 'under-500k':
            return price < 500000;
          case '500k-1m':
            return price >= 500000 && price < 1000000;
          case '1m-2m':
            return price >= 1000000 && price < 2000000;
          case 'over-2m':
            return price >= 2000000;
          default:
            return true;
        }
      });
    }

    console.log('Filtered properties:', filtered);
    setFilteredProperties(filtered);
  };

  const handleMakeOffer = (property: Property) => {
    console.log('Make offer clicked for property:', property);
    if (!user) {
      window.location.href = '/auth/investor';
      return;
    }
    // Handle offer logic here
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering properties page with:', { properties, filteredProperties, loading });
  
  // Simple test to ensure the component is rendering
  if (properties.length === 0 && filteredProperties.length === 0) {
    console.log('No properties found - this might be the issue');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Header Section */}
      <section className="bg-gradient-hero text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Exclusive Properties
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-neutral-100 leading-relaxed">
              Discover off-market real estate opportunities with verified profit potential across NYC's five boroughs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="relative flex-1 max-w-md mx-auto">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by address, neighborhood, or borough..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Borough Filter */}
              <select
                value={selectedBorough}
                onChange={(e) => setSelectedBorough(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
              >
                <option value="all">All Boroughs</option>
                <option value="Manhattan">Manhattan</option>
                <option value="Brooklyn">Brooklyn</option>
                <option value="Queens">Queens</option>
                <option value="Bronx">Bronx</option>
                <option value="Staten Island">Staten Island</option>
              </select>

              {/* Property Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
              >
                <option value="all">All Types</option>
                <option value="Single Family">Single Family</option>
                <option value="Multi-Family">Multi-Family</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Co-op">Co-op</option>
                <option value="Apartment">Apartment</option>
                <option value="Commercial">Commercial</option>
              </select>

              {/* Price Range Filter */}
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow"
              >
                <option value="all">All Prices</option>
                <option value="under-500k">Under $500K</option>
                <option value="500k-1m">$500K - $1M</option>
                <option value="1m-2m">$1M - $2M</option>
                <option value="over-2m">Over $2M</option>
              </select>
            </div>

            <div className="text-neutral-600">
              {filteredProperties.length} properties found
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property, index) => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  onMakeOffer={handleMakeOffer}
                  animationDelay={index * 0.1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <MapPinIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-neutral-600 mb-2">No properties found</h3>
              <p className="text-neutral-500 mb-6">
                Try adjusting your search criteria or filters to find more properties.
              </p>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBorough('all');
                  setSelectedType('all');
                  setPriceRange('all');
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Don't See What You're Looking For?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-neutral-100 leading-relaxed">
            Get notified about new properties that match your investment criteria before they hit the market.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/investor">
              <Button variant="secondary" className="text-lg px-8 py-4">
                Create Alert
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="text-lg px-8 py-4">
                Contact Agent
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PropertiesPage;