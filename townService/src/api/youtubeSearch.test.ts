import express from 'express';
import supertest from 'supertest';
import fetch, { Response } from 'node-fetch';
import router from './youtubeSearch'; // Replace with the actual filename

jest.mock('node-fetch');

const app = express();
app.use(express.json());
app.use('/', router);

describe('GET /youtube-search', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return 400 if query parameter is missing', async () => {
    const response = await supertest(app).get('/youtube-search');
    expect(response.status).toBe(400);
  });

  it('should return 500 if YouTube API request fails', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error('Failed to fetch'),
    );
    const response = await supertest(app).get('/youtube-search?query=test');
    expect(response.status).toBe(500);
  });

  it('should return YouTube API response if request is successful', async () => {
    const mockResponse = {
      items: [
        {
          id: { videoId: '123456' },
          snippet: { title: 'Test Video' },
        },
      ],
    };
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);
    const response = await supertest(app).get('/youtube-search?query=test');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
  });
});
