import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Define the expected structure of the YouTube API response
interface YouTubeApiResponse {
  error?: {
    message: string;
  };
  items?: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
    };
  }>;
}

// This endpoint is used to perform a search query to the YouTube API
router.get('/youtube-search', async (req, res) => {
  const searchQuery = req.query.query as string;
  if (!searchQuery) {
    return res.status(400).send('Query parameter is required.');
  }

  // Use the API key from the environment variable
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
    searchQuery,
  )}&key=${apiKey}`;

  // Inside your API route or controller where you're making the fetch call
  // Assuming you have already defined YouTubeApiResponse interface as mentioned before

  try {
    const youtubeResponse = await fetch(url);
    if (!youtubeResponse.ok) {
      throw new Error('YouTube API returned an error.');
    }

    // Use type assertion here
    const youtubeData = (await youtubeResponse.json()) as YouTubeApiResponse;

    return res.status(200).json(youtubeData);
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
});

// This endpoint is used to retrieve the title for a given YouTube URL
router.get('/youtube-video-info', async (req, res) => {
  const videoUrl = req.query.url as string;
  if (!videoUrl) {
    return res.status(400).send('URL parameter is required.');
  }

  // Extract the video ID from the URL
  let videoId = '';
  const urlParams = new URLSearchParams(new URL(videoUrl).search);
  const videoIdParam = urlParams.get('v');
  if (!videoIdParam) {
    return res.status(400).send('Invalid YouTube URL.');
  }
  videoId = videoIdParam;

  if (!videoId) {
    return res.status(400).send('Invalid YouTube URL.');
  }

  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;

  try {
    const youtubeResponse = await fetch(url);
    if (!youtubeResponse.ok) {
      throw new Error('YouTube API returned an error.');
    }

    const youtubeData = (await youtubeResponse.json()) as YouTubeApiResponse;

    if (youtubeData.items) {
      if (youtubeData.items.length !== 0) {
        return res.status(200).json({ title: youtubeData.items[0].snippet.title });
      }
      return res.status(404).send('Video not found.');
    }
    return res.status(404).send('Video not found.');
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
});

export default router;
