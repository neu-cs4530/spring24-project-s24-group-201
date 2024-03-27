import React from 'react';
import { Box, Button } from '@chakra-ui/react';
import Player from '../../classes/PlayerController'; // Adjust the import based on your actual path

interface PlayerNameProps {
  player: Player;
  onAddFriend?: (playerID: string) => void; // This prop will be used to handle adding friends
}

const PlayerName: React.FC<PlayerNameProps> = ({ player, onAddFriend }) => {
  const handleAddFriendClick = () => {
    if (onAddFriend) {
      onAddFriend(player.id);
    }
  };

  return (
    <Box>
      {player.userName}
      {/* Only show add friend button if onAddFriend function is provided */}
      {onAddFriend && (
        <Button size='sm' onClick={handleAddFriendClick}>
          Add Friend
        </Button>
      )}
    </Box>
  );
};

export default PlayerName;
