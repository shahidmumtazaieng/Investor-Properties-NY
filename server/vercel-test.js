// Simple JavaScript test file for Vercel
export default function handler(request, response) {
  response.status(200).json({
    message: 'Vercel test endpoint working',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL
    }
  });
}