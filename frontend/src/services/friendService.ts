const API_BASE_URL = 'http://localhost:8081/api/friends';

/**
 * Fetch the list of friend IDs for a player.
 * @param playerId - The ID of the player whose friends list to retrieve.
 */
async function getFriendsList(playerId: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/list/${playerId}`);
  if (!response.ok) {
    throw new Error(`Error fetching friends list: ${response.statusText}`);
  }
  const friendsList = await response.json();
  return friendsList;
}

/**
 * Send a friend request or add a friend for a player.
 * @param playerId - The ID of the player adding the friend.
 * @param friendId - The ID of the player to be added as a friend.
 */
async function addFriend(playerId: string, friendId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerId, friendId }),
  });
  if (!response.ok) {
    throw new Error(`Error adding friend: ${response.statusText}`);
  }
}

/**
 * Remove a friend for a player.
 * @param playerId - The ID of the player removing the friend.
 * @param friendId - The ID of the friend to be removed.
 */
async function removeFriend(playerId: string, friendId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerId, friendId }),
  });
  if (!response.ok) {
    throw new Error(`Error removing friend: ${response.statusText}`);
  }
}

// Export the service functions
export { getFriendsList, addFriend, removeFriend };
