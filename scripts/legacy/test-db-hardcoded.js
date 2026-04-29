const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_9piHf6Jxwuba@ep-rapid-wind-ae8481b6.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
    connectionString,
    ssl: true // Trying strict SSL first, standard for Neon
});

async function testConnection() {
    try {
        console.log('Connecting to:', connectionString.replace(/:[^:@]*@/, ':****@'));
        await client.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Query success:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Initial connection failed:', err.message);

        // Retry with rejectUnauthorized: false if the first attempt failed due to SSL validation
        if (err.code === 'SELF_SIGNED_CERT_IN_CHAIN' || err.message.includes('self signed')) {
            console.log('Retrying with rejectUnauthorized: false...');
            const looseClient = new Client({
                connectionString,
                ssl: { rejectUnauthorized: false }
            });
            try {
                await looseClient.connect();
                console.log('Connected successfully (loose SSL)!');
                await looseClient.end();
            } catch (retryErr) {
                console.error('Retry failed:', retryErr);
            }
        } else {
            console.error('Full error details:', err);
        }
    }
}

testConnection();
