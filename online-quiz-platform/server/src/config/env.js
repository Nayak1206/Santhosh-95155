import dotenv from 'dotenv';
dotenv.config();

const requiredEnv = [
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

requiredEnv.forEach(env => {
  if (!process.env[env]) {
    console.warn(`⚠️ Warning: Environment variable ${env} is missing!`);
    // Fallback for demo purposes (NOT for production use)
    if (env.includes('SECRET')) {
      process.env[env] = `fallback_${env.toLowerCase()}_2026_demo`;
      console.warn(`👉 Using a temporary fallback for ${env}. Please set this in your Render Dashboard ASAP.`);
    }
  }
});

export const env = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
