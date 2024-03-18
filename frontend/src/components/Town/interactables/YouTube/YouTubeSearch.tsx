import React, { useState } from 'react';

interface YouTubeSearchProps {
  onVideoSelect: (videoId: string) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>; // Use React's FocusEventHandler type
  onBlur?: React.FocusEventHandler<HTMLInputElement>; // Use React's FocusEventHandler type
}

interface VideoItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
  };
}

const YoutubeSearch: React.FC<YouTubeSearchProps> = ({ onVideoSelect, onFocus, onBlur }) => {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<VideoItem[]>([]);

  const handleSearch = () => {
    const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
    const searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${query}&key=${apiKey}`;

    fetch(searchURL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        setVideos(data.items);
      })
      .catch(error => {
        console.error('YouTube API search failed:', error);
      });
  };

  return (
    <div>
      <input
        type='text'
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder='Search YouTube'
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      <div>
        {videos.map(video => (
          <div key={video.id.videoId}>
            <h3>{video.snippet.title}</h3>
            <a
              href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
              target='_blank'
              rel='noopener noreferrer'
              onClick={() => onVideoSelect(video.id.videoId)}>
              Watch Video
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YoutubeSearch;
