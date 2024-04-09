import db, {
  addLikeToVideo,
  doesVideoExist,
  removeLikeFromVideo,
  countLikes,
  doesUserLikeVideo,
  sendFriendRequest,
} from './FirebaseServices';
import {
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

jest.mock('firebase/firestore');

describe('Firebase Services - Likes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('doesVideoExist', () => {
    it('returns true if the video exists', async () => {
      const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
      mockGetDocs.mockResolvedValueOnce({ empty: false } as never);

      await expect(doesVideoExist('video123')).resolves.toBe(true);
    });

    it('returns false if the video does not exist', async () => {
      const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
      mockGetDocs.mockResolvedValueOnce({ empty: true } as never);

      await expect(doesVideoExist('videoXYZ')).resolves.toBe(false);
    });
  });

  describe('addLikeToVideo', () => {
    it('adds a like to an existing video', async () => {
      const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
      mockGetDocs.mockResolvedValueOnce({ empty: false } as never);
      const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;

      await addLikeToVideo('video123', 'user456');
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), {
        users: arrayUnion('user456'),
      });
    });
  });

  describe('doesUserLikeVideo', () => {
    it('returns true if a user has liked a video', async () => {
      const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ users: ['user456'] }),
      } as never);

      await expect(doesUserLikeVideo('video123', 'user456')).resolves.toBe(true);
    });

    it('returns false if a user has not liked a video', async () => {
      const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ users: ['anotherUser'] }),
      } as never);

      await expect(doesUserLikeVideo('video123', 'user456')).resolves.toBe(false);
    });

    it('returns false if the video does not exist', async () => {
      const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      } as never);

      await expect(doesUserLikeVideo('video123', 'user456')).resolves.toBe(false);
    });
  });

  describe('removeLikeFromVideo', () => {
    it('removes a like from a video', async () => {
      const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;

      await removeLikeFromVideo('video123', 'user456');

      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), {
        users: arrayRemove('user456'),
      });
    });
  });

  describe('countLikes', () => {
    it('counts the number of likes a video has', async () => {
      const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ users: ['user456', 'user789'] }),
      } as never);

      await expect(countLikes('video123')).resolves.toBe(2);
    });

    it('returns 0 if the video does not exist', async () => {
      const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      } as never);

      await expect(countLikes('video123')).resolves.toBe(0);
    });
  });
});

describe('Firebase Services - Friends', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendFriendRequest', () => {
    it('sends a friend request successfully', async () => {
      await expect(sendFriendRequest('user1', 'user2')).resolves.toBeUndefined();

      expect(doc).toHaveBeenCalledWith(db, 'users', 'user1', 'friends', 'user2');
      expect(setDoc).toHaveBeenCalled();
    });
  });

  describe('areUsersFriends', () => {
    it('adds a like to an existing video', async () => {
      const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
      mockGetDocs.mockResolvedValueOnce({ empty: false } as never);
      const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;

      await addLikeToVideo('video123', 'user456');
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), {
        users: arrayUnion('user456'),
      });
    });
  });
});
