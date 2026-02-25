require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required. Please configure it in backend/.env');
}

const adapter = new PrismaPg({
  connectionString,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 300_000,
});
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
