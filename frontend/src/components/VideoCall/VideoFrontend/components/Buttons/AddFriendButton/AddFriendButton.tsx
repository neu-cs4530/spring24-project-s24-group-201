import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import { sendFriendRequest, areUsersFriends } from '../../../../../DB/FirebaseServices';

export default function AddFriendButton(props: { userID?: string; friendID?: string }) {
  const [isFriend, setIsFriend] = useState(false);

  // Check if the users are already friends on component mount and whenever userID or friendID changes
  useEffect(() => {
    const checkFriendship = async () => {
      if (props.userID && props.friendID) {
        const friends = await areUsersFriends(props.userID, props.friendID);
        setIsFriend(friends);
      }
    };
    checkFriendship();
  }, [props.userID, props.friendID]);

  const handleAddFriend = async () => {
    if (!props.userID || !props.friendID || isFriend) return; // Ensure userID and friendID are provided and they aren't already friends

    await sendFriendRequest(props.userID, props.friendID);
    setIsFriend(true); // Update local state to reflect the new friendship status
  };

  return <Button onClick={handleAddFriend}>{isFriend ? 'Friend' : 'Add Friend'}</Button>;
}
