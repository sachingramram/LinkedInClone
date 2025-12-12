// plain node test using mongodb driver
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(); // default db from URI or 'admin'
    const serverInfo = await db.admin().serverStatus();
    console.log('Connected to MongoDB. Server version:', serverInfo.version);
    // sample read/write check
    const testCol = db.collection('test_connection');
    await testCol.insertOne({ ts: new Date().toISOString(), ok: true });
    const doc = await testCol.findOne({ ok: true });
    console.log('Inserted doc:', doc);
    console.log('SUCCESS: Mongo connection OK');
  } catch (err) {
    console.error('Mongo connection failed:', err);
  } finally {
    await client.close();
  }
}

main();
