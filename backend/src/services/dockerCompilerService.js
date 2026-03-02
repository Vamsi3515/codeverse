const axios = require('axios');

const JUDGE0_URL = process.env.JUDGE0_API_URL || 'http://localhost:2358';

const LANGUAGE_MAP = {
  'python': 92,      // Python 3.10
  'javascript': 63,  // JavaScript (Node.js)
  'java': 62,        // Java
  'cpp': 54,         // C++
  'c': 50,           // C
  'javascript': 63,  // Node.js
};

const executeCode = async (language, code, input = '') => {
  try {
    const langId = LANGUAGE_MAP[language.toLowerCase()];
    
    if (!langId) {
      throw new Error(`Language ${language} not supported`);
    }

    // Submit code for execution
    const submitResponse = await axios.post(`${JUDGE0_URL}/api/v1/submissions`, {
      language_id: langId,
      source_code: code,
      stdin: input || '',
    });

    const tokenId = submitResponse.data.token;

    // Poll for execution result (max 10 attempts)
    for (let i = 0; i < 10; i++) {
      const statusResponse = await axios.get(`${JUDGE0_URL}/api/v1/submissions/${tokenId}`);
      
      if (statusResponse.data.status.id > 2) {
        // Status 3+ means execution completed
        return {
          output: statusResponse.data.stdout || '',
          error: statusResponse.data.stderr || '',
          status: statusResponse.data.status.description
        };
      }
      
      // Wait 1 second before next poll
      await new Promise(r => setTimeout(r, 1000));
    }

    throw new Error('Execution timeout');
  } catch (error) {
    return {
      output: '',
      error: error.message,
      status: 'Error'
    };
  }
};

module.exports = { executeCode };