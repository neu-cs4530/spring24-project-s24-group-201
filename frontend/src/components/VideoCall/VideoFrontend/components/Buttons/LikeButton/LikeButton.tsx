import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import HeartIcon from '../../../icons/HeartIcon';
import FilledHeartIcon from '../../../icons/FilledHeartIcon'; // Adjust the import path
import { addLikeToVideo, countLikes, doesUserLikeVideo, removeLikeFromVideo } from '../../../../../DB/FirebaseServices';

export default function ToggleLikeButton(props: { videoID?: string, user?: string }) {
  const [isVideoLiked, setIsVideoLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Check if the user already liked the video on component mount and whenever videoID or user changes
  useEffect(() => {
    const checkIfLiked = async () => {
      if (props.videoID && props.user) {
        const count = await countLikes(props.videoID);
        setLikeCount(count); // Update like count state with the fetched value
        const liked = await doesUserLikeVideo(props.videoID, props.user);
        setIsVideoLiked(liked);
      }
    };
    checkIfLiked();
  }, [props.videoID, props.user, likeCount]);

  const handleLikeToggle = async () => {
    console.log('handleLikeToggle', props.videoID, props.user, isVideoLiked)
    if (!props.videoID || !props.user) return; // Ensure videoID and user are provided

    if (isVideoLiked) {
      await removeLikeFromVideo(props.videoID, props.user);
      setLikeCount((prevCount) => Math.max(0, prevCount - 1));
    } else {
      await addLikeToVideo(props.videoID, props.user);
      setLikeCount((prevCount) => prevCount + 1);
    }

    setIsVideoLiked(!isVideoLiked); // Update local state to reflect the new like status
  };

  return (
    <Button
      onClick={handleLikeToggle}
      startIcon={isVideoLiked ? <FilledHeartIcon /> : <HeartIcon />}
    >
      Like {likeCount !== 0 ? `(${likeCount})` : ''} 
    </Button>
  );
}
