import { CommonInvestor, InstitutionalInvestor, Property, ForeclosureListing } from "../shared/schema.js";
import sgMail from "@sendgrid/mail";

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export class NotificationService {
  // Send property listing updates to all registered users
  static async sendPropertyListingNotification(property: Property) {
    try {
      // Get all common investors
      const commonInvestors = await global.storage.getAllCommonInvestors();
      
      // Get all institutional investors
      const institutionalInvestors = await global.storage.getAllInstitutionalInvestors();
      
      // Prepare email content
      const subject = `New Property Listing: ${property.address}`;
      const baseContent = `
        <h2>New Property Available</h2>
        <p><strong>Address:</strong> ${property.address}</p>
        <p><strong>Neighborhood:</strong> ${property.neighborhood}</p>
        <p><strong>Borough:</strong> ${property.borough}</p>
        <p><strong>Price:</strong> $${property.price}</p>
        <p><strong>Property Type:</strong> ${property.propertyType}</p>
        <p><strong>Estimated Profit:</strong> $${property.estimatedProfit || 'Not specified'}</p>
        <p><a href="${process.env.FRONTEND_URL || 'https://investorpropertiesny.com'}/properties/${property.id}">View Property Details</a></p>
      `;
      
      // Send to all common investors
      for (const investor of commonInvestors) {
        if (investor.emailVerified && investor.isActive) {
          await this.sendEmail(
            investor.email,
            subject,
            baseContent,
            investor.firstName
          );
        }
      }
      
      // Send to all institutional investors
      for (const investor of institutionalInvestors) {
        if (investor.isActive) {
          await this.sendEmail(
            investor.email,
            subject,
            baseContent,
            investor.personName
          );
        }
      }
      
      console.log(`Property listing notification sent for property: ${property.id}`);
      return true;
    } catch (error) {
      console.error("Failed to send property listing notification:", error);
      return false;
    }
  }
  
  // Send foreclosure updates based on subscription status
  static async sendForeclosureUpdateNotification(foreclosure: ForeclosureListing) {
    try {
      // Get all institutional investors (they get free access)
      const institutionalInvestors = await global.storage.getAllInstitutionalInvestors();
      
      // Get all common investors with active foreclosure subscriptions
      const commonInvestors = await global.storage.getCommonInvestorsWithForeclosureSubscription();
      
      // Prepare email content
      const subject = `New Foreclosure Listing: ${foreclosure.address}`;
      const baseContent = `
        <h2>New Foreclosure Listing</h2>
        <p><strong>Address:</strong> ${foreclosure.address}</p>
        <p><strong>County:</strong> ${foreclosure.county}</p>
        <p><strong>Auction Date:</strong> ${new Date(foreclosure.auctionDate).toLocaleDateString()}</p>
        <p><strong>Starting Bid:</strong> $${foreclosure.startingBid || 'Not specified'}</p>
        <p><strong>Property Type:</strong> ${foreclosure.propertyType || 'Not specified'}</p>
        <p><strong>Assessed Value:</strong> $${foreclosure.assessedValue || 'Not specified'}</p>
        <p><a href="${process.env.FRONTEND_URL || 'https://investorpropertiesny.com'}/foreclosures/${foreclosure.id}">View Foreclosure Details</a></p>
      `;
      
      // Send to all institutional investors (free access)
      for (const investor of institutionalInvestors) {
        if (investor.isActive) {
          await this.sendEmail(
            investor.email,
            subject,
            baseContent,
            investor.personName
          );
        }
      }
      
      // Send to common investors with active subscriptions
      for (const investor of commonInvestors) {
        if (investor.emailVerified && investor.isActive && investor.hasForeclosureSubscription) {
          // Check if subscription is still valid
          if (investor.foreclosureSubscriptionExpiry && new Date(investor.foreclosureSubscriptionExpiry) > new Date()) {
            await this.sendEmail(
              investor.email,
              subject,
              baseContent,
              investor.firstName
            );
          }
        }
      }
      
      console.log(`Foreclosure update notification sent for foreclosure: ${foreclosure.id}`);
      return true;
    } catch (error) {
      console.error("Failed to send foreclosure update notification:", error);
      return false;
    }
  }
  
  // Helper method to send emails
  private static async sendEmail(to: string, subject: string, htmlContent: string, recipientName: string) {
    if (!process.env.SENDGRID_API_KEY) {
      console.log(`[DEV MODE] Would send email to ${to} with subject: ${subject}`);
      return;
    }
    
    const personalizedContent = `<p>Hello ${recipientName},</p>${htmlContent}`;
    
    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'notifications@investorpropertiesny.com',
      subject,
      html: personalizedContent,
    };
    
    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}