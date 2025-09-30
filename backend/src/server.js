const app = require('./app');
const config = require('./config');
const { PrismaClient } = require('../prisma/generated/prisma');

const prisma = new PrismaClient();
const PORT = config.port || 5001;

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connection successful.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
}

main();