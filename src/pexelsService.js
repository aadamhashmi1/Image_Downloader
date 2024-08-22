

import axios from 'axios';

// Replace these with your actual API key and base URL
const API_KEY = 'uVktvfZdjycLoNDU8HGlu633wvCVGRKJk7kfxqXrFtBwOpxGVAYNQsbg';
const BASE_URL = 'https://api.pexels.com/v1';

export const searchImages = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: { query, per_page: 100 },
      headers: {
        Authorization: API_KEY,
      },
    });
    return response.data.photos;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
};
