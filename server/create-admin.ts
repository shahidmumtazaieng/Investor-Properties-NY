import { DatabaseRepository } from './database-repository.ts';

async function createAdminUser() {
  const db = new DatabaseRepository();
  
  try {
    // Check if admin user already exists
    const existingAdmin = await db.getCommonInvestorByUsername('admin');
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const adminData = {
      username: 'admin',
      password: await db.hashPassword('admin123'),
      email: 'admin@investorpropertiesny.com',
      firstName: 'Admin',
      lastName: 'User',
      phone: null,
      isActive: true,
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationSentAt: null,
      phoneVerified: false,
      phoneVerificationCode: null,
      phoneVerificationSentAt: null,
      hasForeclosureSubscription: false,
      subscriptionPlan: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const adminUser = await db.createCommonInvestor(adminData);
    console.log('Admin user created successfully:', adminUser);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();