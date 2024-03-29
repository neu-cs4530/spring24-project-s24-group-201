import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import HeartIcon from '../../../icons/HeartIcon';
import FilledHeartIcon from '../../../icons/FilledHeartIcon';

export default function ToggleLikeButton(videoId: string) {
  const [isVideoLiked, toggleVideoLiked] = useState(false);

  return (
    <Button
      onClick={() => (toggleVideoLiked(!isVideoLiked))}
      startIcon={isVideoLiked ? <FilledHeartIcon /> : <HeartIcon />}
    >
      Like
    </Button>
  );
}