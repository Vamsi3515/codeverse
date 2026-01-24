const axios = require('axios');

const OPENAI_KEY = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY || '';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5';

if (!OPENAI_KEY) {
  console.warn('Warning: OPENAI_KEY not set. OpenAI requests will fail without a valid API key.');
}

async function createChatCompletion(messages = [], options = {}) {
  const model = options.model || DEFAULT_MODEL;

  const payload = {
    model,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.max_tokens ?? 1000
  };

  const res = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: options.timeout || 15000
  });

  return res.data;
}

module.exports = {
  createChatCompletion,
  getDefaultModel: () => DEFAULT_MODEL
};
