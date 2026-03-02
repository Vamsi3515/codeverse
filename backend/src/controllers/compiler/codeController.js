const axios = require('axios');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');
const execFileAsync = util.promisify(execFile);

// Code Execution Services
const PISTON_API_URL = process.env.PISTON_API_URL || 'http://localhost:2000';
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const GLOT_IO_API_URL = 'https://glot.io/api/run';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const API_TIMEOUT = 30000; // 30 seconds timeout
const USE_PISTON = process.env.USE_PISTON === 'true';
const USE_JUDGE0 = process.env.USE_JUDGE0 === 'true' && JUDGE0_API_KEY;
const USE_GLOT = true; // Always available as free fallback

// Language ID mappings for Judge0 API
const JUDGE0_LANGUAGE_MAP = {
  python: 71,      // Python 3.8.1
  javascript: 63,  // JavaScript (Node.js 12.14.0)
  java: 62,        // Java (OpenJDK 13.0.1)
  cpp: 53,         // C++ (GCC 9.2.0)
  c: 50,           // C (GCC 9.2.0)
};

// Language ID mappings for Glot.io API
const GLOT_IO_LANGUAGE_MAP = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
};

// Simple Node.js code executor for testing
const executeNodeCode = (sourceCode, input) => {
  try {
    let output = '';
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      output += args.join(' ') + '\n';
    };
    console.error = (...args) => {
      output += 'Error: ' + args.join(' ') + '\n';
    };
    
    // Create a function from the code
    const func = new Function(sourceCode);
    func();
    
    // Restore console
    console.log = originalLog;
    console.error = originalError;
    
    return { success: true, output };
  } catch (error) {
    console.log = console.log;  // restore
    return { success: false, output: error.toString() };
  }
};

/**
 * Execute Python/Other languages locally using system interpreter
 */
const executeLocalCode = async (language, sourceCode, input) => {
  let tempFile = null;
  
  try {
    const ext = language === 'python' ? '.py' : language === 'javascript' ? '.js' : '.' + language;
    tempFile = path.join(os.tmpdir(), `codeverse_${Date.now()}${ext}`);
    
    // Write source code to temp file
    fs.writeFileSync(tempFile, sourceCode);
    
    console.log(`💻 Executing ${language} locally from ${tempFile}...`);
    
    let command, args;
    
    if (language === 'python') {
      // Try multiple Python commands for Windows compatibility
      const pythonCommands = ['python', 'python3', 'py'];
      let output = null;
      let lastError = null;
      
      for (const pythonCmd of pythonCommands) {
        try {
          console.log(`  Trying: ${pythonCmd} ${tempFile}`);
          const result = await execFileAsync(pythonCmd, [tempFile], {
            timeout: 10000,
            maxBuffer: 1024 * 1024,
            encoding: 'utf-8'
          });
          
          console.log(`  ✅ Success with: ${pythonCmd}`);
          
          if (result.stderr && result.stderr.trim()) {
            return {
              success: true,
              isError: true,
              output: result.stderr
            };
          }
          
          return {
            success: true,
            isError: false,
            output: result.stdout || ''
          };
        } catch (err) {
          lastError = err;
          console.log(`  ✗ Failed with: ${pythonCmd} - ${err.message?.substring(0, 50)}`);
          continue;
        }
      }
      
      // All Python commands failed
      throw lastError || new Error('Python interpreter not found. Install Python or set JUDGE0_API_KEY');
      
    } else if (language === 'javascript') {
      command = 'node';
      args = [tempFile];
      
      const { stdout, stderr } = await execFileAsync(command, args, {
        timeout: 10000,
        maxBuffer: 1024 * 1024,
        encoding: 'utf-8'
      });
      
      if (stderr && stderr.trim()) {
        return {
          success: true,
          isError: true,
          output: stderr
        };
      }
      
      return {
        success: true,
        isError: false,
        output: stdout || ''
      };
    } else {
      throw new Error(`Local execution not supported for ${language}`);
    }
    
  } catch (error) {
    console.error(`Local execution error: ${error.message}`);
    return {
      success: true,
      isError: true,
      output: `Local Execution Error: ${error.message}\n\nTroubleshooting:\n1. Ensure Python is installed and in PATH\n2. On Windows, try installing from python.org\n3. Or set JUDGE0_API_KEY for cloud execution`
    };
  } finally {
    // Clean up temp file
    if (tempFile && fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        console.warn(`Failed to delete temp file: ${e.message}`);
      }
    }
  }
};

/**
 * Execute via Glot.io API (Free, no authentication needed)
 */
const executeViaGlotIO = async (language, sourceCode, input) => {
  try {
    const langCode = GLOT_IO_LANGUAGE_MAP[language.toLowerCase()];
    if (!langCode) {
      throw new Error(`Glot.io does not support ${language}`);
    }

    console.log(`🟣 Executing ${language} code via Glot.io...`);

    // Glot.io API format: POST to /api/run/{language}
    const response = await axios.post(
      `https://glot.io/api/run/${langCode}`,
      {
        files: [
          {
            name: language === 'python' ? 'main.py' : language === 'javascript' ? 'main.js' : 'main.' + language,
            content: sourceCode,
          }
        ],
        stdin: input || '',
      },
      {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: API_TIMEOUT,
      }
    );

    if (response.data.stderr) {
      return {
        success: true,
        isError: true,
        output: response.data.stderr,
      };
    }

    return {
      success: true,
      isError: false,
      output: response.data.stdout || '',
    };
  } catch (error) {
    console.error('Glot.io Error:', error.message);
    throw error;
  }
};

/**
 * Execute via Judge0 API (More reliable alternative)
 */
const executeViaJudge0 = async (language, sourceCode, input) => {
  try {
    const langId = JUDGE0_LANGUAGE_MAP[language.toLowerCase()];
    if (!langId) {
      throw new Error(`Judge0 does not support ${language}`);
    }

    console.log(`🔵 Executing ${language} code via Judge0...`);

    // Submit code
    const submitResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions`,
      {
        language_id: langId,
        source_code: sourceCode,
        stdin: input || '',
        cpu_time_limit: 5,
        memory_limit: 128000,
      },
      {
        headers: {
          'x-rapidapi-key': JUDGE0_API_KEY,
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        timeout: API_TIMEOUT,
      }
    );

    const tokenId = submitResponse.data.token;
    console.log(`Token: ${tokenId}`);

    // Poll for result
    let result;
    let attempts = 0;
    const maxAttempts = 50; // 50 * 500ms = 25 seconds

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      attempts++;

      const resultResponse = await axios.get(
        `${JUDGE0_API_URL}/submissions/${tokenId}`,
        {
          headers: {
            'x-rapidapi-key': JUDGE0_API_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
          },
          timeout: API_TIMEOUT,
        }
      );

      result = resultResponse.data;

      // Check if execution is complete
      if (result.status.id > 2) {
        // Status > 2 means execution is complete
        break;
      }
    }

    // Parse result
    const stdout = result.stdout ? Buffer.from(result.stdout, 'base64').toString() : '';
    const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString() : '';
    const compilationOutput = result.compile_output ? Buffer.from(result.compile_output, 'base64').toString() : '';

    if (stderr || compilationOutput) {
      return {
        success: true,
        isError: true,
        output: compilationOutput || stderr,
      };
    }

    return {
      success: true,
      isError: false,
      output: stdout,
    };
  } catch (error) {
    console.error('Judge0 API Error:', error.message);
    throw error;
  }
};

/**
 * Execute via Piston API
 */
const executeViaPiston = async (language, sourceCode, input) => {
  try {
    const langMap = {
      'python': { language: 'python', version: '3.10.0' },
      'javascript': { language: 'javascript', version: '18.15.0' },
      'java': { language: 'java', version: '15.0.2' },
      'cpp': { language: 'c++', version: '10.2.0' },
      'c': { language: 'c', version: '10.2.0' }
    };

    const config = langMap[language.toLowerCase()];
    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    console.log(`🟢 Executing ${language} code via self-hosted Piston API at ${PISTON_API_URL}...`);

    const payload = {
      language: config.language,
      version: config.version,
      files: [{ content: sourceCode }],
      stdin: input || "",
      args: [],
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: -1,
      run_memory_limit: -1
    };

    const axiosConfig = {
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'CodeVerse/1.0'
      },
      validateStatus: function (status) {
        return true; // Don't throw on any status
      }
    };

    const response = await axios.post(`${PISTON_API_URL}/api/v2/piston/execute`, payload, axiosConfig);

    console.log(`Piston Response Status: ${response.status}`);

    if (response.status !== 200) {
      console.error(`Piston API returned status ${response.status}:`, JSON.stringify(response.data).substring(0, 200));
      throw new Error(`Piston API Error (${response.status}): ${response.data?.message || response.statusText}`);
    }

    const result = response.data;
    if (!result.run) {
      throw new Error('Invalid Piston response format');
    }

    const runOutput = result.run;
    if (runOutput.stderr) {
      return {
        success: true,
        isError: true,
        output: runOutput.stderr,
        stdout: runOutput.stdout
      };
    }

    return {
      success: true,
      isError: false,
      output: runOutput.stdout || ''
    };
  } catch (error) {
    console.error('Piston Error:', error.message);
    throw error;
  }
};

exports.executeCode = async (req, res) => {
  try {
    const { language, sourceCode, input } = req.body;

    if (!language || !sourceCode) {
      return res.status(400).json({ success: false, message: 'Language and source code are required' });
    }

    console.log(`\n📝 Code Execution Request: Language=${language}, CodeLength=${sourceCode.length}`);

    let result = null;
    let executionError = null;

    // Try execution methods in order of preference
    // 1. Judge0 (if configured with API key)
    if (USE_JUDGE0) {
      try {
        result = await executeViaJudge0(language, sourceCode, input);
      } catch (error) {
        console.warn('⚠️ Judge0 failed, trying next method...');
        executionError = error;
      }
    }

    // 2. Self-hosted Piston (if enabled)
    if (!result && USE_PISTON) {
      try {
        result = await executeViaPiston(language, sourceCode, input);
      } catch (error) {
        console.warn('⚠️ Piston failed, trying next method...');
        executionError = error;
      }
    }

    // 3. Glot.io (free fallback) - always try this
    if (!result) {
      try {
        result = await executeViaGlotIO(language, sourceCode, input);
      } catch (error) {
        console.warn('⚠️ Glot.io failed, trying local execution...');
        executionError = error;
      }
    }

    // 4. Local execution (Python, JavaScript, etc.)
    if (!result) {
      try {
        console.log('💻 Using local system execution...');
        result = await executeLocalCode(language, sourceCode, input);
      } catch (error) {
        console.warn('⚠️ Local execution failed');
        executionError = error;
      }
    }

    // If we have a result, return it
    if (result) {
      return res.status(200).json(result);
    }

    // No execution method worked
    console.error('❌ All execution methods failed');
    const errorMsg = executionError?.message || 'No code execution service available';
    // Call Piston API with timeout
    console.log(`🚀 Executing ${language} code via Piston...`);
    const response = await axios.post(`${PISTON_API_URL}/execute`, payload, {
      timeout: 15000
    });
    
    return res.status(200).json({
      success: true,
      isError: true,
      output: `⚠️ Code Execution Error!\n\n${errorMsg}\n\n📋 Execution Methods (in order of attempt):\n\n1. Judge0 API (FREE tier) - set JUDGE0_API_KEY in .env\n2. Piston (Docker) - set USE_PISTON=true and run Docker\n3. Glot.io (FREE, no setup)\n4. Local system (Python/Node if installed)\n\nSee PISTON_SETUP.md for detailed instructions.`
    });

  } catch (error) {
    console.error('❌ Execution Fatal Error:', {
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });

    res.status(500).json({
      success: false,
      message: 'Code execution service error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    console.error('❌ Execution Error:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({ success: false, message: 'Failed to execute code: ' + error.message });
  }
};
