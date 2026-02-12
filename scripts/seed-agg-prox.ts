import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'agg-prox';

const sampleUsers = [
  { name: 'Favour Ajokubi Emmanuel', email: 'favour@example.com', age: 25 },
  { name: 'John Smith', email: 'john@example.com', age: 30 },
  { name: 'Jane Doe', email: 'jane@example.com', age: 28 },
  { name: 'Michael Johnson', email: 'michael@example.com', age: 35 },
  { name: 'Sarah Williams', email: 'sarah@example.com', age: 27 },
  { name: 'David Brown', email: 'david@example.com', age: 32 },
  { name: 'Emily Davis', email: 'emily@example.com', age: 29 },
  { name: 'Christopher Wilson', email: 'chris@example.com', age: 31 },
  { name: 'Jessica Taylor', email: 'jessica@example.com', age: 26 },
  { name: 'Daniel Anderson', email: 'daniel@example.com', age: 33 },
  { name: 'Michelle Thomas', email: 'michelle@example.com', age: 24 },
  { name: 'Robert Martinez', email: 'robert@example.com', age: 36 },
  { name: 'Jennifer Garcia', email: 'jennifer@example.com', age: 28 },
  { name: 'William Rodriguez', email: 'william@example.com', age: 34 },
  { name: 'Elizabeth Lopez', email: 'elizabeth@example.com', age: 27 },
  { name: 'James Lee', email: 'james@example.com', age: 30 },
  { name: 'Mary Walker', email: 'mary@example.com', age: 29 },
  { name: 'Charles Hall', email: 'charles@example.com', age: 31 },
  { name: 'Patricia Allen', email: 'patricia@example.com', age: 26 },
  { name: 'Thomas Young', email: 'thomas@example.com', age: 32 },
  { name: 'Fabrice Emmanuel', email: 'fabrice@example.com', age: 28 },
  { name: 'Frank Aaron Johnson', email: 'frank@example.com', age: 29 },
  { name: 'Ferdinand Albert Emmanuel', email: 'ferdinand@example.com', age: 30 },
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // Drop existing data
    console.log('\n🗑️  Dropping existing users collection...');
    await usersCollection.drop().catch(() => console.log('Collection does not exist yet'));

    // Insert sample users
    console.log('\n📝 Inserting sample users...');
    const result = await usersCollection.insertMany(sampleUsers);
    console.log(`✅ Inserted ${result.insertedCount} users`);

    // Create indexes for better search performance
    console.log('\n🔍 Creating indexes...');
    await usersCollection.createIndex({ name: 1 });
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('✅ Indexes created');

    // Display sample data
    console.log('\n📊 Sample users in database:');
    const users = await usersCollection.find().limit(5).toArray();
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });

    console.log(`\n✨ Database "${DB_NAME}" seeded successfully!`);
    console.log(`📝 Total users: ${sampleUsers.length}`);
    console.log(`\n🔗 You can now test the search at: http://localhost:3000/agg-prox`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the seed
seedDatabase();
