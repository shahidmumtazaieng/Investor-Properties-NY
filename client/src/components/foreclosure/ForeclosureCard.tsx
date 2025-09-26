import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, CurrencyDollarIcon, MapPinIcon, ClockIcon } from '../icons';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ForeclosureSample {
  id: string;
  address: string;
  county: string;
  auctionDate: string;
  startingBid: string;
  propertyType: string;
}

interface ForeclosureCardProps {
  foreclosure: ForeclosureSample;
  animationDelay?: number;
}

const ForeclosureCard: React.FC<ForeclosureCardProps> = ({ 
  foreclosure, 
  animationDelay = 0 
}) => {
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

  const daysUntil = getDaysUntilAuction(foreclosure.auctionDate);

  return (
    <Card 
      variant="modern" 
      className="relative animate-slide-up h-full flex flex-col"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Sample Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full">
          SAMPLE
        </span>
      </div>
      
      {/* Auction Countdown Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <ClockIcon className="w-6 h-6 mr-2" />
            <span className="text-sm font-medium">
              {daysUntil > 0 ? 'Auction in' : 'Auction passed'}
            </span>
          </div>
          <div className="text-4xl font-bold mb-2">
            {daysUntil > 0 ? daysUntil : 'PAST'}
          </div>
          <div className="text-sm opacity-90">
            {daysUntil > 0 ? 'days remaining' : 'opportunity expired'}
          </div>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        {/* Reduced heading size for better responsiveness */}
        <h3 className="text-lg md:text-xl font-bold text-primary-blue mb-4">{foreclosure.address}</h3>
        
        <div className="space-y-4 mb-6 flex-grow">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-neutral-600">
              <MapPinIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">County:</span>
            </div>
            <span className="font-semibold text-primary-navy text-sm">{foreclosure.county}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-neutral-600">
              <CalendarDaysIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">Auction Date:</span>
            </div>
            <span className="font-semibold text-primary-navy text-xs md:text-sm">
              {formatDate(foreclosure.auctionDate)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-neutral-600">
              <CurrencyDollarIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">Starting Bid:</span>
            </div>
            <span className="font-bold text-success-emerald text-base md:text-lg">
              {formatPrice(foreclosure.startingBid)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-600 text-sm">Property Type:</span>
            <span className="font-semibold text-primary-navy text-sm">{foreclosure.propertyType}</span>
          </div>
        </div>

        {/* Blurred/Limited Info Section */}
        <div className="bg-neutral-100 rounded-xl p-4 relative mb-6">
          <div className="filter blur-sm">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Assessed Value:</span>
                <span className="font-semibold">$XXX,XXX</span>
              </div>
              <div className="flex justify-between">
                <span>Property Details:</span>
                <span>X bed, X bath</span>
              </div>
              <div className="flex justify-between">
                <span>Docket Number:</span>
                <span>XXXX-XXXX</span>
              </div>
              <div className="flex justify-between">
                <span>Bidding Strategy:</span>
                <span>Premium Info</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-lg px-4 py-2 shadow-lg border">
              <p className="text-sm font-semibold text-primary-navy flex items-center gap-2">
                <span>🔒</span>
                Subscribe to view details
              </p>
            </div>
          </div>
        </div>

        <Link to="/auth/investor" className="mt-auto">
          <Button variant="secondary" className="w-full text-sm md:text-base">
            Subscribe to Bid
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default ForeclosureCard;