import React, { useState, useEffect } from 'react';
import { Box, Heading, ListItem, OrderedList, Tooltip, Button } from '@chakra-ui/react';
import { usePlayers } from '../../classes/TownController';
import useTownController from '../../hooks/useTownController';
import { addFriend, getFriendsList } from '../../services/friendService';
import PlayerName from './PlayerName';

interface PlayersInTownListProps {
  currentPlayerID: string; // You would pass the current player's ID as a prop
}

const PlayersInTownList: React.FC<PlayersInTownListProps> = ({ currentPlayerID }) => {
  const [friends, setFriends] = useState<string[]>([]);
  const players = usePlayers();
  const { friendlyName, townID } = useTownController();

  useEffect(() => {
    getFriendsList(currentPlayerID).then(setFriends).catch(console.error);
  }, [currentPlayerID]);

  const handleAddFriend = async (newFriendId: string) => {
    try {
      await addFriend(currentPlayerID, newFriendId);
      setFriends([...friends, newFriendId]);
    } catch (error) {
      console.error(error);
    }
  };

  const sortedPlayers = players.sort((p1, p2) =>
    p1.userName.localeCompare(p2.userName, undefined, { numeric: true, sensitivity: 'base' }),
  );

  return (
    <Box>
      <Tooltip label={`Town ID: ${townID}`}>
        <Heading as='h2' fontSize='l'>
          Current town: {friendlyName}
        </Heading>
      </Tooltip>
      <OrderedList>
        {sortedPlayers.map(player => (
          <ListItem key={player.id}>
            <PlayerName player={player} />
            {player.id !== currentPlayerID && !friends.includes(player.id) && (
              <Button size='sm' onClick={() => handleAddFriend(player.id)}>
                Add Friend
              </Button>
            )}
          </ListItem>
        ))}
      </OrderedList>
    </Box>
  );
};

export default PlayersInTownList;
