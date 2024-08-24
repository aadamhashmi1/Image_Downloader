import axios from 'axios';

const API_KEY = 'uVktvfZdjycLoNDU8HGlu633wvCVGRKJk7kfxqXrFtBwOpxGVAYNQsbg';
const BASE_URL = 'https://api.pexels.com/v1';

export const searchImages = async (query) => {
  const response = await axios.get(`${BASE_URL}/search`, {
    params: { query, per_page: 10 },
    headers: {
      Authorization: API_KEY,
    },
  });
  return response.data.photos;
};
