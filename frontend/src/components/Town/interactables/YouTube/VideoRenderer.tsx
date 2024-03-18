import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: any;
  }
}

interface VideoRendererProps {
  videoId: string;
}

const VideoRenderer = ({ videoId }: VideoRendererProps) => {
  const playerRef = useRef<any>(null);

  // Load the YouTube IFrame API script
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      // Handle the error case here, e.g., append directly to the document body
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      if (!playerRef.current) {
        playerRef.current = new window.YT.Player('ytplayer', {
          height: '360',
          width: '640',
          videoId: videoId,
          events: {
            onReady: () => {
              playerRef.current.playVideo();
            },
          },
        });
      }
    };

    return () => {
      if (window.onYouTubeIframeAPIReady) {
        delete window.onYouTubeIframeAPIReady;
      }
    };
  }, [videoId]);

  // Update the video when the videoId changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  // Cleanup the player on component unmount
  useEffect(() => {
    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  return <div id='ytplayer' />;
};

export default VideoRenderer;
