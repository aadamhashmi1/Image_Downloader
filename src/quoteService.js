// src/quoteService.js
export const fetchRandomQuote = async () => {
  try {
    const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
      method: 'GET',
      headers: {
        'X-Api-Key': 'WIDogwrp/Kfc3ELin0zpLg==uPeHtjJU6R6Z3X0Q' // Replace with your actual API key
      }
    });

    const data = await response.json();

    if (data && data.length > 0) {
      return data[0].quote;
    } else {
      throw new Error('No quote found');
    }
  } catch (error) {
    console.error('Error fetching quote:', error);
    return 'Life is beautiful'; // Fallback quote if the API fails
  }
};
