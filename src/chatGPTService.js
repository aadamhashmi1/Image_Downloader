export const summarizeQuote = async (text) => {
  try {
    const response = await fetch('http://localhost:3001/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error summarizing quote:', error);
    return '';
  }
};
