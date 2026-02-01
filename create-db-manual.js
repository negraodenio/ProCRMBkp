const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_9piHf6Jxwuba@ep-rapid-wind-ae8481b6.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
    connectionString,
    ssl: true
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
  );
`;

async function main() {
    try {
        await client.connect();
        console.log('Connected to database.');
        await client.query(createTableQuery);
        console.log('Table "Contact" created successfully (or already exists).');
        await client.end();
    } catch (e) {
        console.error('Error creating table:', e);
        process.exit(1);
    }
}

main();
