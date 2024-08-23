import axios from 'axios';

const API_KEY = 'uVktvfZdjycLoNDU8HGlu633wvCVGRKJk7kfxqXrFtBwOpxGVAYNQsbg';
const BASE_URL = 'https://api.pexels.com/v1/search';

export const searchImages = async (query) => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      params: {
        query,
        per_page: 15,
        page: 1,
      },
    });
    return response.data.photos;
  } catch (error) {
    console.error('Error fetching images:', error.response?.data || error.message);
    throw error;
  }
};
