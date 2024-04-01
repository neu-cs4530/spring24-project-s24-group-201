import { Box, Heading, ListItem, OrderedList, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { usePlayers } from '../../classes/TownController';
import useTownController from '../../hooks/useTownController';
import PlayerName from './PlayerName';
import AddFriendButton from '../../components/VideoCall/VideoFrontend/components/Buttons/AddFriend/AddFriendButton';

export default function PlayersInTownList(): JSX.Element {
  const players = usePlayers();
  const townController = useTownController(); // Use the town controller directly
  const myPlayerID = townController.userID; // Use the getter method to access the userID
  const { friendlyName, townID } = useTownController(); // Assume you have myPlayerID
  const sorted = [...players]; // Using spread operator to copy the array
  sorted.sort((p1, p2) =>
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
        {sorted.map(player => (
          <ListItem
            key={player.id}
            display='flex'
            alignItems='center'
            justifyContent='space-between'>
            <PlayerName player={player} />
            {player.id !== myPlayerID ? ( // Don't show the button for the current user
              <AddFriendButton userID={myPlayerID} friendID={player.id} />
            ) : null}
          </ListItem>
        ))}
      </OrderedList>
    </Box>
  );
}
