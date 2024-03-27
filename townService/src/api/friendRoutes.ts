import express from 'express';
import { addFriend, getFriendsList, removeFriend } from './friendsListAPI'; // adjust the path as necessary

const router = express.Router();

// Endpoint to add a friend
router.post('/add', async (req, res) => {
  try {
    console.log(req.body); // Log the body to see what you're receiving
    const { playerId, friendId } = req.body;
    await addFriend(playerId, friendId);
    res.status(200).send('Friend added successfully.');
  } catch (error) {
    res.status(500).send('An error occurred.');
  }
});

// Endpoint to retrieve friends list
router.get('/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const friendsList = await getFriendsList(playerId);
    res.status(200).json(friendsList);
  } catch (error) {
    res.status(500).send('An error occurred.');
  }
});

// Endpoint to remove a friend
router.delete('/remove', async (req, res) => {
  try {
    const { playerId, friendId } = req.body;
    await removeFriend(playerId, friendId);
    res.status(200).send('Friend removed successfully.');
  } catch (error) {
    res.status(500).send('An error occurred.');
  }
});

export default router;
