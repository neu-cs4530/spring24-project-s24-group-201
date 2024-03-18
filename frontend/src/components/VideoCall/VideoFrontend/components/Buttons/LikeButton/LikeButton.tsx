import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';
import useTotalLikes from '../../../hooks/useTotalLikes/useTotalLikes';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      background: theme.brand,
      color: 'white',
      '&:hover': {
        background: '#600101',
      },
    },
  })
);

export default function LikeButton(props: { className?: string }) {
  const classes = useStyles();
  const [like, setLike] = useState(false);

  const toggleLike = () => {
    setLike(!like);
    useTotalLikes();
  };

  return (
    <Button onClick={() => toggleLike()} className={clsx(classes.button, props.className)} >
      Like
    </Button>
  );
}
