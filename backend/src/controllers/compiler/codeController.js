const axios = require('axios');

// Piston API Endpoint (Public Execution API)
const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

exports.executeCode = async (req, res) => {
  try {
    const { language, sourceCode, input } = req.body;

    if (!language || !sourceCode) {
      return res.status(400).json({ success: false, message: 'Language and source code are required' });
    }

    // Map frontend languages to Piston versions/names
    const langMap = {
      'python': { language: 'python', version: '3.10.0' },
      'javascript': { language: 'javascript', version: '18.15.0' },
      'java': { language: 'java', version: '15.0.2' }, 
      'cpp': { language: 'c++', version: '10.2.0' },
      'c': { language: 'c', version: '10.2.0' }
    };

    const config = langMap[language.toLowerCase()];
    if (!config) {
      return res.status(400).json({ success: false, message: 'Unsupported language' });
    }

    // Prepare payload for Piston
    const payload = {
      language: config.language,
      version: config.version,
      files: [
        {
          content: sourceCode
        }
      ],
      stdin: input || "",
      args: [],
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: -1,
      run_memory_limit: -1
    };

    // Call Piston API
    console.log(`🚀 Executing ${language} code via Piston...`);
    const response = await axios.post(`${PISTON_API_URL}/execute`, payload);
    
    // Process response
    const result = response.data;
    const runOutput = result.run;

    if (runOutput.stderr) {
        // Code has errors
        return res.status(200).json({
            success: true,
            isError: true,
            output: runOutput.stderr,
            stdout: runOutput.stdout // sometimes partial output exists
        });
    }

    // Success
    return res.status(200).json({
        success: true,
        isError: false,
        output: runOutput.stdout
    });

  } catch (error) {
    console.error('❌ Execution Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to execute code' });
  }
};
