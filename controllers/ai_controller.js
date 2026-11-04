const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-haiku-5-5';

// Created on first use so the server still starts when ANTHROPIC_API_KEY (.env) is not set yet.
// Extra retries because an evaluation sends one request per "Faux" answer at the same time.
let client;
const getClient = () => {
  if (!client) client = new Anthropic({ maxRetries: 6 });
  return client;
};

// Send a single prompt to Claude and return the text of its answer
exports.chat = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Missing message' });
  }

  try {
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 16000,
      messages: [{ role: 'user', content: message }],
    });

    if (response.stop_reason === 'refusal') {
      return res.status(422).json({ message: 'Claude declined this request' });
    }

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');
    res.status(200).json({ text });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ message: 'Invalid or missing ANTHROPIC_API_KEY' });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ message: 'Claude rate limit reached, try again shortly' });
    }
    if (error instanceof Anthropic.APIError) {
      return res.status(502).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
