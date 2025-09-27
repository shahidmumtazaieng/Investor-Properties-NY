import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:3002/api';

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.success) {
      console.log('✅ Admin login successful');
      return data.user;
    } else {
      console.log('❌ Admin login failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error during admin login test:', error);
    return null;
  }
}

async function testAdminDashboardStats(user) {
  try {
    console.log('Testing admin dashboard stats...');
    
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    console.log('Dashboard stats:', data);
    
    if (response.ok) {
      console.log('✅ Admin dashboard stats retrieved successfully');
    } else {
      console.log('❌ Failed to retrieve admin dashboard stats:', data.message);
    }
  } catch (error) {
    console.error('Error during admin dashboard stats test:', error);
  }
}

async function main() {
  console.log('🚀 Testing Admin Portal Functionality\n');
  
  const user = await testAdminLogin();
  
  if (user) {
    await testAdminDashboardStats(user);
  }
  
  console.log('\n✅ Admin portal tests completed');
}

main();