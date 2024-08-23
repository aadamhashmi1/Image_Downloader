const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// POST /summarize endpoint
app.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text field is required' });
    }
    // Your summarization logic here
    const summary = await summarizeText(text);
    res.json({ summary });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Placeholder summarization function
const summarizeText = async (text) => {
  return `Summarized: ${text}`; // Replace with actual summarization logic
};

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
