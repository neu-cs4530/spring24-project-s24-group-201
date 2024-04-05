import 'firebase/firestore';
import {
  getFirestore,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  setDoc,
  arrayRemove,
  arrayUnion,
  updateDoc,
  doc,
} from 'firebase/firestore';

import { initializeApp } from 'firebase/app';
import { nanoid } from 'nanoid';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'covey-town-yt-watch-party.firebaseapp.com',
  projectId: 'covey-town-yt-watch-party',
  storageBucket: 'covey-town-yt-watch-party.appspot.com',
  messagingSenderId: '102514783714',
  appId: '1:102514783714:web:5b6b61baad313faa6735bb',
  measurementId: 'G-P1QJN28JLQ',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;

export interface LikeData {
  videoID: string;
  userIDs: string[];
}

export interface FriendData {
  friendID: string;
  friendSince: Date;
}

export interface WatchParty {
  hostID: string;
  friendsList: string[]; // List of friends' IDs who are allowed to join
}

/**
 * Determines if a video exists in the 'likes' collection.
 *
 * @param {string} videoID The ID of the video.
 */
export async function doesVideoExist(videoID: string): Promise<boolean> {
  const existingUserQuery = query(collection(db, 'likes'), where('videoID', '==', videoID));
  const existingUserSnapshot = await getDocs(existingUserQuery);
  return !existingUserSnapshot.empty;
}

/**
 * Determines if a user has liked a video.
 *
 * @param {string} videoID The ID of the video.
 *  @param {string} username The username to check from the video's likes.
 */
export async function doesUserLikeVideo(videoID: string, username: string): Promise<boolean> {
  const videoRef = doc(db, 'likes', videoID);
  const docSnap = await getDoc(videoRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data.users.includes(username);
  } else {
    // Document does not exist
    return false;
  }
}

/**
 * Adds a like to a video by a specific user.
 *
 * @param {string} videoID The ID of the video.
 * @param {string} username The username to remove from the video's likes.
 */
export async function addLikeToVideo(videoID: string, username: string): Promise<void> {
  // Check if the video already exists
  const doesExist = await doesVideoExist(videoID);

  // Reference to the document in the 'likes' collection
  const videoRef = doc(db, 'likes', videoID);

  if (doesExist) {
    // If the document exists, add the username to the users array
    await updateDoc(videoRef, {
      users: arrayUnion(username),
    });
  } else {
    // If the document does not exist, create a new document with the videoID and username
    await setDoc(videoRef, {
      videoID: videoID,
      users: [username],
    });
  }
}

/**
 * Removes a like from a video by a specific user.
 *
 * @param {string} videoID The ID of the video.
 * @param {string} username The username to remove from the video's likes.
 */
export async function removeLikeFromVideo(videoID: string, username: string) {
  const videoRef = doc(db, 'likes', videoID);
  await updateDoc(videoRef, {
    users: arrayRemove(username),
  });
}

/**
 * Counts the number of likes a video has.
 *
 * @param {string} videoID The ID of the video to count likes for.
 * @returns {Promise<number>} The count of likes.
 */
export async function countLikes(videoID: string) {
  const videoRef = doc(db, 'likes', videoID);
  const docSnap = await getDoc(videoRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data.users ? data.users.length : 0;
  } else {
    // Document does not exist
    return 0;
  }
}

/**
 * Sends a friend request from one user to another.
 *
 * @param {string} userID The ID of the user sending the request.
 * @param {string} friendID The ID of the user to become friends with.
 */
export async function sendFriendRequest(userID: string, friendID: string): Promise<void> {
  const friendRef = doc(db, 'users', String(userID), 'friends', String(friendID));
  await setDoc(friendRef, {
    friendID: friendID,
    friendSince: new Date(), // Set the current time as the friendship start
  });
}

/**
 * Checks if two users are friends.
 *
 * @param {string} userID The ID of the user.
 * @param {string} friendID The ID of the potential friend.
 * @returns {Promise<boolean>} True if they are friends, false otherwise.
 */
export async function areUsersFriends(userID: string, friendID: string): Promise<boolean> {
  // if (typeof userID !== 'string' || typeof friendID !== 'string') {
  //   console.error('UserID and FriendID must be strings', userID, friendID);
  //   throw new Error('UserID and FriendID must be strings');
  // }

  const friendRef = doc(db, 'users', String(userID), 'friends', String(friendID));
  const docSnap = await getDoc(friendRef);
  return docSnap.exists();
}

export async function createWatchParty(hostID: string, watchPartyID: string): Promise<void> {
  const friendsRef = collection(db, 'users', hostID, 'friends');
  const friendsSnap = await getDocs(friendsRef);
  const friendsList = friendsSnap.docs.map(doc => doc.id);

  const watchPartyRef = doc(db, 'watchParties', watchPartyID);
  await setDoc(watchPartyRef, {
    hostID: hostID,
    friendsList: friendsList,
  });
}


export async function canJoinWatchParty(userID: string, watchPartyID: string): Promise<boolean> {
  const watchPartyRef = doc(db, 'watchParties', watchPartyID);
  const watchPartySnap = await getDoc(watchPartyRef);

  if (watchPartySnap.exists()) {
    const watchParty = watchPartySnap.data() as WatchParty;
    return watchParty.hostID === userID || watchParty.friendsList.includes(userID);
  }
  return false;
}


export async function generateUniqueWatchPartyID(): Promise<string> {
  return nanoid();
}


