import { DatabaseRepository } from './server/database-repository.ts';
import { config } from 'dotenv';

// Load environment variables
config();

async function insertSampleForeclosures() {
  const db = new DatabaseRepository();
  
  console.log('Inserting sample foreclosure listings...');
  
  // Sample foreclosure listings
  const sampleListings = [
    {
      address: '123 Main Street',
      county: 'Queens',
      neighborhood: 'Forest Hills',
      borough: 'Queens',
      auctionDate: new Date('2024-03-15T10:00:00Z'),
      startingBid: '450000',
      assessedValue: '500000',
      propertyType: 'Single Family',
      beds: 3,
      baths: '2',
      sqft: 1800,
      yearBuilt: 1995,
      description: 'Beautiful family home in great neighborhood with modern amenities',
      docketNumber: '12345-67890',
      plaintiff: 'Bank of America',
      defendant: 'John Smith',
      attorney: 'Robert Johnson',
      attorneyPhone: '(555) 123-4567',
      attorneyEmail: 'r.johnson@bankofamerica.com',
      caseNumber: 'CV-2023-12345',
      judgmentAmount: '475000',
      interestRate: '4.5',
      lienPosition: 'First',
      propertyCondition: 'Good',
      occupancyStatus: 'Vacant',
      redemptionPeriodEnd: new Date('2024-04-15T00:00:00Z'),
      saleType: 'Judicial',
      openingBid: '450000',
      minimumBid: '400000',
      depositRequirement: '10% of bid amount',
      saleTerms: 'Cash only',
      propertyImages: ['/images/property1.jpg', '/images/property1-2.jpg'],
      legalDescription: 'Lot 10, Block 5, Forest Hills Gardens',
      parcelNumber: '1234567890',
      zoningClassification: 'R1-1',
      taxDelinquencyAmount: '12000',
      hoaDues: '350',
      utilities: 'Electric, Gas, Water',
      environmentalIssues: 'None reported',
      titleStatus: 'Clear',
      titleCompany: 'First American Title',
      titleCompanyPhone: '(555) 987-6543',
      titleCompanyEmail: 'info@firstamericantitle.com',
      inspectionReportUrl: '/documents/inspection1.pdf',
      appraisalReportUrl: '/documents/appraisal1.pdf',
      propertyDocumentsUrl: '/documents/property1-docs.zip',
      notes: 'Property in good condition, recent renovations',
      status: 'upcoming',
      isActive: true,
      featured: true,
      priorityLevel: 1
    },
    {
      address: '456 Oak Avenue',
      county: 'Brooklyn',
      neighborhood: 'Park Slope',
      borough: 'Brooklyn',
      auctionDate: new Date('2024-03-22T14:00:00Z'),
      startingBid: '850000',
      assessedValue: '950000',
      propertyType: 'Multi-Family',
      beds: 6,
      baths: '4',
      sqft: 3200,
      yearBuilt: 1925,
      description: 'Historic brownstone with 2 units, fully renovated',
      docketNumber: '09876-54321',
      plaintiff: 'Chase Bank',
      defendant: 'Maria Garcia',
      attorney: 'Sarah Williams',
      attorneyPhone: '(555) 234-5678',
      attorneyEmail: 's.williams@chase.com',
      caseNumber: 'CV-2023-09876',
      judgmentAmount: '825000',
      interestRate: '5.25',
      lienPosition: 'First',
      propertyCondition: 'Excellent',
      occupancyStatus: 'Occupied',
      redemptionPeriodEnd: new Date('2024-04-22T00:00:00Z'),
      saleType: 'Judicial',
      openingBid: '850000',
      minimumBid: '750000',
      depositRequirement: '10% of bid amount',
      saleTerms: 'Cash or approved financing',
      propertyImages: ['/images/property2.jpg', '/images/property2-2.jpg', '/images/property2-3.jpg'],
      legalDescription: 'Lot 15, Block 3, Park Slope Historic District',
      parcelNumber: '0987654321',
      zoningClassification: 'R3-2',
      taxDelinquencyAmount: '8500',
      hoaDues: '0',
      utilities: 'Electric, Gas, Water, Sewer',
      environmentalIssues: 'Asbestos survey completed',
      titleStatus: 'Clear with exceptions',
      titleCompany: 'Fidelity National Title',
      titleCompanyPhone: '(555) 876-5432',
      titleCompanyEmail: 'contact@fidelitynational.com',
      inspectionReportUrl: '/documents/inspection2.pdf',
      appraisalReportUrl: '/documents/appraisal2.pdf',
      propertyDocumentsUrl: '/documents/property2-docs.zip',
      notes: 'Historic landmark property, income-producing',
      status: 'upcoming',
      isActive: true,
      featured: true,
      priorityLevel: 2
    },
    {
      address: '789 Elm Street',
      county: 'Nassau',
      neighborhood: 'Great Neck',
      borough: 'Nassau',
      auctionDate: new Date('2024-03-29T11:00:00Z'),
      startingBid: '625000',
      assessedValue: '700000',
      propertyType: 'Condo',
      beds: 2,
      baths: '2.5',
      sqft: 1500,
      yearBuilt: 2005,
      description: 'Modern condo with water views and amenities',
      docketNumber: '11223-33445',
      plaintiff: 'Wells Fargo',
      defendant: 'David Lee',
      attorney: 'Michael Brown',
      attorneyPhone: '(555) 345-6789',
      attorneyEmail: 'm.brown@wellsfargo.com',
      caseNumber: 'CV-2023-11223',
      judgmentAmount: '600000',
      interestRate: '3.75',
      lienPosition: 'First',
      propertyCondition: 'Excellent',
      occupancyStatus: 'Vacant',
      redemptionPeriodEnd: new Date('2024-04-29T00:00:00Z'),
      saleType: 'Non-Judicial',
      openingBid: '625000',
      minimumBid: '550000',
      depositRequirement: '5% of bid amount',
      saleTerms: 'Cash or approved financing',
      propertyImages: ['/images/property3.jpg'],
      legalDescription: 'Unit 5B, The Waterfront Condominium',
      parcelNumber: '1122334455',
      zoningClassification: 'R1-1D',
      taxDelinquencyAmount: '5200',
      hoaDues: '850',
      utilities: 'Electric, Gas, Water, Heat included',
      environmentalIssues: 'None reported',
      titleStatus: 'Clear',
      titleCompany: 'Stewart Title',
      titleCompanyPhone: '(555) 765-4321',
      titleCompanyEmail: 'info@stewarttitle.com',
      inspectionReportUrl: '/documents/inspection3.pdf',
      appraisalReportUrl: '/documents/appraisal3.pdf',
      propertyDocumentsUrl: '/documents/property3-docs.zip',
      notes: 'Water views, building amenities include gym and pool',
      status: 'upcoming',
      isActive: true,
      featured: false,
      priorityLevel: 0
    }
  ];

  try {
    // Insert each sample listing
    for (const listing of sampleListings) {
      const result = await db.createForeclosureListing(listing);
      console.log(`Created foreclosure listing: ${result.address}`);
    }
    
    console.log('Sample foreclosure listings inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample foreclosure listings:', error);
  }
}

// Run the script
insertSampleForeclosures().catch(console.error);