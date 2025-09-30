require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5001,
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    accessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES || 60,
    refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS || 30,
  },
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/lighthouse'
  }
};

module.exports = config;