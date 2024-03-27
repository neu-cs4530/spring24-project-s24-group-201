import { MongoClient, ObjectId } from 'mongodb';

// Assuming the MongoDB connection is correctly established in this module and client is correctly exported.
import { client } from '../lib/mongoDBConnection';

interface FriendDocument {
  _id?: ObjectId;
  playerId: string;
  friends: string[];
}

const DATABASE_NAME = 'FriendsList';
const COLLECTION_NAME = 'FriendsData';

function getCollection() {
  return client.db(DATABASE_NAME).collection<FriendDocument>(COLLECTION_NAME);
}

// In your friendsListAPI.ts:
export async function addFriend(playerId: string, friendId: string): Promise<void> {
  const collection = getCollection();
  try {
    const result = await collection.updateOne(
      { playerId },
      { $addToSet: { friends: friendId } },
      { upsert: true },
    );
    console.log(`Updated ${result.modifiedCount} document(s)`); // Log how many documents were updated
  } catch (error) {
    console.error('Error updating the database:', error); // Log any errors
    throw error; // Re-throw the error to be caught by the calling function
  }
}

export async function getFriendsList(playerId: string): Promise<string[]> {
  const collection = getCollection();
  const document = await collection.findOne({ playerId });
  return document?.friends || [];
}

export async function removeFriend(playerId: string, friendId: string): Promise<void> {
  const collection = getCollection();
  await collection.updateOne({ playerId }, { $pull: { friends: friendId } });
}

async function connectToDatabase(): Promise<void> {
  await client.connect();
}

// Start the database connection process
connectToDatabase();

// If the above connection function is used, make sure to handle the database connection in the main server file instead to avoid multiple connections.
