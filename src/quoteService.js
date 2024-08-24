// Import your required dependencies (if any)





// Fetch a random quote from the API Ninjas API
export const fetchRandomQuote = async () => {
  try {
    const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
      method: 'GET',
      headers: {
        'X-Api-Key': 'WIDogwrp/Kfc3ELin0zpLg==uPeHtjJU6R6Z3X0Q' // Replace with your actual API key
      }
    });

    const data = await response.json();

    // Ensure the response contains at least one quote
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

// Extract meaningful keywords from the quote
export const extractKeywords = (quote) => {
  const stopWords = new Set([
    'the', 'and', 'a', 'to', 'in', 'of', 'for', 'on', 'with', 'is', 'it', 'this', 'that', 'at', 'as', 'by', 'an', 'are'
  ]);

  // Process the quote to extract keywords
  const words = quote
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 3 && !stopWords.has(word)) // Filter short words and stop words
    .reduce((acc, word) => {
      if (!acc.includes(word)) acc.push(word);
      return acc;
    }, [])
    .slice(0, 3) // Take the top 3 words
    .join(' '); // Join them into a single string

  return words;
};



