import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, CurrencyDollarIcon, HeartIcon } from '../icons';
import Card from '../ui/Card';
import Button from '../ui/Button';

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
  images: string[];
  description: string;
}

interface PropertyListItemProps {
  property: Property;
  onMakeOffer?: (property: Property) => void;
}

const PropertyListItem: React.FC<PropertyListItemProps> = ({ 
  property, 
  onMakeOffer
}) => {
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseInt(price));
  };

  return (
    <Card 
      variant="elevated" 
      className="group animate-slide-up relative overflow-hidden flex flex-col md:flex-row"
    >
      {/* Image Container */}
      <div className="md:w-1/3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/60 via-transparent to-transparent z-10"></div>
        <img 
          src={property.images[0] || 'https://images.unsplash.com/photo-1666585607888-3f6fe0b323d8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw2fHxsdXh1cnklMjBhcGFydG1lbnQlMjBtb2Rlcm4lMjBpbnRlcmlvciUyMGZsb29yJTIwdG8lMjBjZWlsaW5nJTIwd2luZG93cyUyMGNpdHklMjB2aWV3fGVufDB8MHx8fDE3NTg2MTU5Mzh8MA&ixlib=rb-4.1.0&q=85'} 
          alt={`${property.address} - Modern luxury apartment interior with floor to ceiling windows and city view - S.Group Official on Unsplash`}
          className="w-full h-48 md:h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Floating Action Buttons */}
        <div className="absolute top-4 right-4 z-20">
          <button className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-300 animate-pulse-glow">
            <HeartIcon className="w-4 h-4 text-white" />
          </button>
        </div>
        
        {/* Property Type Badge */}
        <div className="absolute bottom-4 left-4 z-20">
          <span className="px-3 py-1 bg-glass-bg-strong backdrop-blur-md text-white text-xs rounded-full border border-glass-border font-medium">
            {property.propertyType}
          </span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="md:w-2/3 p-6 relative flex flex-col">
        {/* Floating Geometric Shape */}
        <div className="absolute -top-3 right-3 w-8 h-8 bg-gradient-gold rounded-full opacity-20 animate-float"></div>
        
        <div className="mb-4 flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-primary-blue group-hover:text-accent-yellow transition-colors duration-300 mb-2">
              {property.address}
            </h3>
            {/* Price Overlay */}
            <div className="flex items-center bg-glass-bg-dark backdrop-blur-md rounded-full px-3 py-1 border border-glass-border-dark">
              <CurrencyDollarIcon className="w-4 h-4 mr-1 text-accent-yellow" />
              <span className="text-white font-bold">
                {formatPrice(property.price)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center text-neutral-600 mb-3">
            <MapPinIcon className="w-4 h-4 mr-2 text-accent-yellow" />
            <span className="text-sm font-medium">{property.neighborhood}, {property.borough}</span>
          </div>
          
          <p className="text-neutral-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>
        
        {/* Stats and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-primary-blue">{property.beds}</div>
              <div className="text-xs text-neutral-600 font-medium uppercase tracking-wide">Beds</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent-yellow">{property.baths}</div>
              <div className="text-xs text-neutral-600 font-medium uppercase tracking-wide">Baths</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success-emerald">{property.sqft?.toLocaleString()}</div>
              <div className="text-xs text-neutral-600 font-medium uppercase tracking-wide">SqFt</div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link 
              to={`/properties/${property.id}`}
              className="flex-1"
            >
              <Button variant="outline" className="py-2 px-4 rounded-xl font-semibold text-sm border-2 hover:border-primary-blue hover:bg-primary-blue hover:text-white transition-all duration-300">
                View Details
              </Button>
            </Link>
            {onMakeOffer && (
              <Button
                variant="success"
                onClick={() => onMakeOffer(property)}
                className="py-2 px-4 rounded-xl font-semibold text-sm bg-gradient-success hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Make Offer
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PropertyListItem;