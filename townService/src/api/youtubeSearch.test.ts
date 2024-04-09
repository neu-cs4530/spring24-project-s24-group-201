import express from 'express';
import request from 'supertest';
import fetchMock from 'jest-fetch-mock';
import router from './youtubeSearch';

beforeAll(() => {
  fetchMock.enableMocks();
});

beforeEach(() => {
  fetchMock.resetMocks();
});

const app = express();
app.use(express.json());
app.use('/', router);

describe('Testing for YoutubeSearch', () => {
  it('should require a query parameter', async () => {
    const response = await request(app).get('/youtube-search');
    expect(response.status).toBe(400);
    expect(response.text).toBe('Query parameter is required.');
  });

  it('should handle YouTube API errors gracefully', async () => {
    fetchMock.mockReject(new Error('YouTube API returned an error.'));
    const response = await request(app).get('/youtube-search?query=test');
    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal Server Error');
  });

  it('should return YouTube API data successfully', async () => {
    process.env.REACT_APP_YOUTUBE_API_KEY = 'AIzaSyBQx2knfxTyJxo7IyQsbSwkFCzBvRiYGWE';

    const response = await request(app).get('/youtube-search?query=test');

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty('items');
    expect(response.body.items).toBeInstanceOf(Array);

    expect(response.body.items[0]).toHaveProperty('id');
    expect(response.body.items[0].id).toHaveProperty('videoId');
    expect(response.body.items[0].snippet).toHaveProperty('title');
  });
});
