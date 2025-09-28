import { DatabaseRepository } from './database-repository.ts';

async function createAdminUser() {
  const db = new DatabaseRepository();
  
  try {
    // Check if admin user already exists
    const existingAdmin = await db.getAdminUserByUsername('admin');
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
      isActive: true,
      lastLoginAt: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const adminUser = await db.createAdminUser(adminData);
    console.log('Admin user created successfully:', adminUser);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();