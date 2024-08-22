// src/textAnalyticsService.js
import axios from 'axios';

const API_KEY = 'be1700c60amsh3af2da5b6e43465p116fefjsnf3be10a5f475';  // Replace with your actual RapidAPI key
const BASE_URL = 'https://microsoft-text-analytics.p.rapidapi.com/text/analytics/v3.0/keyPhrases';


export const analyzeQuote = async (text) => {
  try {
    const response = await axios.post(
      BASE_URL,
      { documents: [{ id: '1', language: 'en', text }] },
      {
        headers: {
          'X-RapidAPI-Host': 'microsoft-text-analytics.p.rapidapi.com',
          'X-RapidAPI-Key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Analysis result:', response.data);  // Log the full response for debugging

    // Check if documents and keyPhrases exist in the response
    const keyPhrases = response.data.documents[0]?.keyPhrases || [];
    return keyPhrases[0] || '';  // Return the first key phrase or an empty string if none found
  } catch (error) {
    console.error('Error analyzing text:', error);  // Log error if API request fails
    return '';  // Return an empty string in case of error
  }
};
