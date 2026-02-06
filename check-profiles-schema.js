const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    try {
        await client.connect();
        console.log('--- PROFILES TABLE ---');
        const profilesRes = await client.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'profiles'
            ORDER BY ordinal_position
        `);
        profilesRes.rows.forEach(r => console.log(`${r.column_name} (${r.data_type}) - Nullable: ${r.is_nullable}`));

        console.log('\n--- ORGANIZATIONS TABLE ---');
        const orgsRes = await client.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'organizations'
            ORDER BY ordinal_position
        `);
        orgsRes.rows.forEach(r => console.log(`${r.column_name} (${r.data_type}) - Nullable: ${r.is_nullable}`));

        await client.end();
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
}

checkSchema();
