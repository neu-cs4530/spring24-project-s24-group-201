import React, { useState, useEffect } from 'react';
import { addFriend, removeFriend, getFriendsList } from '../../services/friendService';

interface FriendsManagerProps {
  playerId: string; // The ID of the current player
  nearbyPlayerId: string | null; // The ID of a nearby player or null if no player is nearby
}

const FriendsManager: React.FC<FriendsManagerProps> = ({ playerId, nearbyPlayerId }) => {
  const [friends, setFriends] = useState<string[]>([]);

  useEffect(() => {
    // Fetch friends list on component mount
    const fetchFriends = async () => {
      try {
        const friendsList = await getFriendsList(playerId);
        setFriends(friendsList);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFriends();
  }, [playerId]);

  const handleAddFriend = async () => {
    if (nearbyPlayerId) {
      try {
        await addFriend(playerId, nearbyPlayerId);
        setFriends([...friends, nearbyPlayerId]); // Update UI optimistically
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRemoveFriend = async (friendIdToRemove: string) => {
    try {
      await removeFriend(playerId, friendIdToRemove);
      setFriends(friends.filter(friendId => friendId !== friendIdToRemove)); // Update UI optimistically
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Friends Manager</h2>
      <button onClick={handleAddFriend} disabled={!nearbyPlayerId}>
        Add Friend
      </button>
      <ul>
        {friends.map(friendId => (
          <li key={friendId}>
            {friendId}
            <button onClick={() => handleRemoveFriend(friendId)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendsManager;
