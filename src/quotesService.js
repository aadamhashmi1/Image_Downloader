// src/quotesService.js
import axios from 'axios';

const API_KEY = 'WIDogwrp/Kfc3ELin0zpLg==uPeHtjJU6R6Z3X0Q';
const BASE_URL = 'https://api.api-ninjas.com/v1/quotes';

export const getRandomQuote = async (category = 'happiness') => {
    try {
      const response = await axios.get(BASE_URL, {
        params: { category },
        headers: {
          'X-Api-Key': API_KEY,
          'Content-Type': 'application/json',
        },
      });
      console.log('Quote fetched:', response.data[0]); // Log the fetched quote
      return response.data[0];
    } catch (error) {
      console.error('Error fetching quote:', error);
      return { content: 'An error occurred while fetching the quote.', author: '' };
    }
  };
  
