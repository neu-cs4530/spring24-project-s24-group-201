import 'firebase/firestore';
import {
  getFirestore,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  arrayRemove,
  arrayUnion,
  updateDoc,
  doc,
  increment,
  orderBy,
  limit,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';

import { initializeApp } from 'firebase/app';
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
