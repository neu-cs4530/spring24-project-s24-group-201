import db, {
  addLikeToVideo,
  doesVideoExist,
  removeLikeFromVideo,
  countLikes,
  doesUserLikeVideo,
  sendFriendRequest,
  areUsersFriends,
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

      await expect(doesVideoExist('video')).resolves.toBe(true);
    });

    it('returns false if the video does not exist', async () => {
      const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
      mockGetDocs.mockResolvedValueOnce({ empty: true } as never);

      await expect(doesVideoExist('video')).resolves.toBe(false);
    });
  });

  describe('addLikeToVideo', () => {
    it('adds a like to an existing video', async () => {
      jest.mocked(doc).mockReturnValue({} as never);
      const mockGetDocs = jest.mocked(getDocs);
      mockGetDocs.mockResolvedValueOnce({ empty: false } as never);
      const mockUpdateDoc = jest.mocked(updateDoc);
      mockUpdateDoc.mockResolvedValueOnce(undefined); // Simulate success

      await addLikeToVideo('video123', 'user456');
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), {
        users: arrayUnion('user456'),
      });
    });
    it('creates a new document and adds a like for a non-existent video', async () => {
      jest.mocked(doc).mockReturnValue({} as never);
      const mockGetDocs = jest.mocked(getDocs);
      mockGetDocs.mockResolvedValueOnce({ empty: true } as never); // Video does not exist
      const mockSetDoc = jest.mocked(setDoc);

      await addLikeToVideo('newVideo', 'newUser');
      expect(mockSetDoc).toHaveBeenCalledWith(expect.anything(), {
        videoID: 'newVideo',
        users: ['newUser'],
      });
    });
    // it('does not add a duplicate like if the user already liked the video', async () => {
    //   jest.mocked(getDocs).mockResolvedValueOnce({ empty: false } as never); // Simulate video exists
    //   jest.mocked(getDoc).mockResolvedValueOnce({
    //     exists: () => true,
    //     data: () => ({ users: ['user456'] }),
    //   } as never); // Simulate user already liked the video

    //   await addLikeToVideo('video123', 'user456');
    //   // Verify updateDoc is not called with arrayUnion for an already existing user
    //   expect(jest.mocked(updateDoc)).not.toHaveBeenCalledWith(expect.anything(), {
    //     users: arrayUnion('user456'),
    //   });
    // });
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
  it('handles Firestore service errors', async () => {
    jest.mocked(getDocs).mockRejectedValueOnce(new Error('Firestore service unavailable'));
    await expect(doesVideoExist('video123')).rejects.toThrow('Firestore service unavailable');
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
    it('returns true if users are friends', async () => {
      const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
      } as never);
      await expect(areUsersFriends('user1', 'user2')).resolves.toBe(true);
      expect(doc).toHaveBeenCalledWith(db, 'users', 'user1', 'friends', 'user2');
    });
    it('returns false if users are not friends', async () => {
      const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      } as never);
      await expect(areUsersFriends('user1', 'user2')).resolves.toBe(false);
      expect(doc).toHaveBeenCalledWith(db, 'users', 'user1', 'friends', 'user2');
    });
    it('checks friendship status with one or more invalid user IDs', async () => {
      const mockGetDoc = jest.mocked(getDoc);
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      } as never);
      await expect(areUsersFriends('', 'validUserID')).resolves.toBe(false);
    });
  });
});
