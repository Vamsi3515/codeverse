/**
 * Piston API Diagnostics
 * Tests connectivity and configuration of Piston code execution service
 */

const axios = require('axios');

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

/**
 * Test Piston API connectivity and configuration
 */
const testPistonConnectivity = async () => {
  console.log('\n🔍 Testing Piston API Connectivity...');
  console.log(`URL: ${PISTON_API_URL}`);
  
  try {
    // Test 1: Check if API is reachable
    console.log('\n1️⃣  Testing basic connectivity...');
    const healthResponse = await axios.get(
      `${PISTON_API_URL}/runtimes`,
      {
        timeout: 5000,
        headers: { 'User-Agent': 'CodeVerse-Diagnostics/1.0' }
      }
    );
    
    console.log('✅ Piston API is reachable');
    console.log(`Available runtimes: ${healthResponse.data?.length || 'unknown'}`);
    
    // Test 2: Try a simple Python execution
    console.log('\n2️⃣  Testing Python execution...');
    const pythonTest = await axios.post(
      `${PISTON_API_URL}/execute`,
      {
        language: 'python',
        version: '3.10.0',
        files: [{ content: 'print("Hello from Piston")' }],
        stdin: '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000
      },
      {
        timeout: 10000,
        headers: { 'User-Agent': 'CodeVerse-Diagnostics/1.0' }
      }
    );
    
    if (pythonTest.status === 200) {
      console.log('✅ Python execution works');
      console.log(`Output: ${pythonTest.data.run?.stdout?.trim() || 'No output'}`);
    } else {
      console.warn(`⚠️ Python execution returned code ${pythonTest.status}`);
    }
    
    // Test 3: Try a simple JavaScript execution
    console.log('\n3️⃣  Testing JavaScript execution...');
    const jsTest = await axios.post(
      `${PISTON_API_URL}/execute`,
      {
        language: 'javascript',
        version: '18.15.0',
        files: [{ content: 'console.log("Hello from Piston")' }],
        stdin: '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000
      },
      {
        timeout: 10000,
        headers: { 'User-Agent': 'CodeVerse-Diagnostics/1.0' }
      }
    );
    
    if (jsTest.status === 200) {
      console.log('✅ JavaScript execution works');
      console.log(`Output: ${jsTest.data.run?.stdout?.trim() || 'No output'}`);
    } else {
      console.warn(`⚠️ JavaScript execution returned code ${jsTest.status}`);
    }
    
    return { success: true, message: 'Piston API is functional' };
    
  } catch (error) {
    console.error('❌ Piston API Test Failed:');
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    
    if (error.response) {
      console.error(`Response Status: ${error.response.status}`);
      console.error(`Response Data:`, error.response.data);
    }
    
    // Provide recommendations
    console.log('\n💡 Troubleshooting suggestions:');
    
    if (error.code === 'ENOTFOUND') {
      console.log('   - Check your internet connection');
      console.log('   - Verify the Piston API URL is correct');
      console.log('   - Try setting a custom PISTON_API_URL in .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   - Piston service may not be running');
      console.log('   - If using Docker, ensure the container is running');
      console.log('   - Try using the public API: https://emkc.org/api/v2/piston');
    } else if (error.response?.status === 401) {
      console.log('   - Piston API returned 401 (Unauthorized)');
      console.log('   - Check if API key is required (edit .env PISTON_API_KEY)');
    } else if (error.response?.status === 429) {
      console.log('   - Rate limit exceeded');
      console.log('   - Wait a moment before trying again');
    }
    
    return {
      success: false,
      message: 'Piston API is not accessible',
      error: error.message
    };
  }
};

module.exports = {
  testPistonConnectivity
};
