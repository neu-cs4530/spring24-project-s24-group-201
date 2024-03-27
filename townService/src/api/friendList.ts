import { MongoClient, ServerApiVersion } from 'mongodb';

// Ensure you have loaded environment variables here if you're using them
const URI = process.env.MONGODB_URI || ''; // replace with your MongoDB URI stored in an environment variable

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// A function to connect to the database
export async function connectToDatabase(): Promise<MongoClient> {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    // Here you would typically return the client or the db instance
    return client;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    // Throw the error to be handled by the caller
    throw err;
  }
}

// A function to close the database connection
export async function closeDatabaseConnection() {
  await client.close();
  console.log('Disconnected from MongoDB');
}

// You can export the client directly if needed
export { client };
