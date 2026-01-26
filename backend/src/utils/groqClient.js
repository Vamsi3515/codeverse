/**
 * Groq LLM Client for Code Analysis
 * Uses Groq's fast inference API to validate code complexity
 */

const Groq = require('groq-sdk');

class GroqClient {
  constructor() {
    if (!process.env.GROQ_API_KEY) {
      console.warn('⚠️ GROQ_API_KEY not set in environment. LLM validation disabled.');
      this.client = null;
    } else {
      this.client = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
    }
  }

  /**
   * Validate if code complexity is acceptable using LLM
   * @param {string} code - Source code to analyze
   * @param {string} language - Programming language
   * @param {string} detectedTimeComplexity - Pattern-based analysis result (e.g., "O(n²)")
   * @param {string} maxTimeComplexity - Problem's time limit (e.g., "O(n)")
   * @param {string} detectedSpaceComplexity - Pattern-based space analysis
   * @param {string} maxSpaceComplexity - Problem's space limit
   * @returns {Promise<object>} { isFeasible: boolean, reasoning: string, confidence: number, llmAnalysis: object }
   */
  async validateComplexity(
    code,
    language,
    detectedTimeComplexity,
    maxTimeComplexity,
    detectedSpaceComplexity,
    maxSpaceComplexity
  ) {
    if (!this.client) {
      return {
        isFeasible: null,
        reasoning: 'LLM service not configured. Using pattern-based decision.',
        confidence: 0,
        llmAnalysis: null,
      };
    }

    try {
      // Truncate code if too long (Groq has token limits)
      const truncatedCode = code.length > 3000 ? code.substring(0, 3000) + '\n// ... [code truncated]' : code;

      const prompt = `You are a competitive programming expert analyzing code complexity.

TASK: Determine if this ${language} solution is FEASIBLE for the given constraints.

CODE TO ANALYZE:
\`\`\`${language}
${truncatedCode}
\`\`\`

CONSTRAINTS:
- Time Complexity Limit: ${maxTimeComplexity}
- Space Complexity Limit: ${maxSpaceComplexity}

PATTERN-BASED ANALYSIS (for reference):
- Detected Time Complexity: ${detectedTimeComplexity}
- Detected Space Complexity: ${detectedSpaceComplexity}

YOUR TASK:
1. Analyze the code for actual time and space complexity
2. Consider clever optimizations, library functions, and algorithm efficiency
3. Check if it meets BOTH time AND space constraints
4. Return a STRICT JSON response with no additional text

RESPOND WITH ONLY THIS JSON (no markdown, no explanation):
{
  "isFeasible": boolean,
  "timeComplexity": "string (e.g., O(n))",
  "spaceComplexity": "string (e.g., O(1))",
  "meetsTimeLimit": boolean,
  "meetsSpaceLimit": boolean,
  "reasoning": "brief explanation",
  "confidence": number between 0.5 and 1.0,
  "flags": ["optional array of concern flags"]
}

Important: Return ONLY valid JSON, no other text.`;

      console.log('🤖 Sending to Groq LLM for complexity validation...');

      const message = await this.client.messages.create({
        model: 'mixtral-8x7b-32768',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText = message.content[0].text.trim();
      console.log('📨 Groq Response:', responseText);

      // Parse JSON response
      let llmAnalysis;
      try {
        // Try to extract JSON from response (in case of extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        llmAnalysis = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('❌ Failed to parse Groq response:', responseText);
        return {
          isFeasible: null,
          reasoning: 'Failed to parse LLM response. Using fallback decision.',
          confidence: 0,
          llmAnalysis: null,
          error: parseError.message,
        };
      }

      // Validate LLM response structure
      if (typeof llmAnalysis.isFeasible !== 'boolean') {
        console.error('❌ Invalid LLM response structure:', llmAnalysis);
        return {
          isFeasible: null,
          reasoning: 'Invalid LLM response structure.',
          confidence: 0,
          llmAnalysis: null,
        };
      }

      console.log('✅ LLM Validation Complete:', {
        isFeasible: llmAnalysis.isFeasible,
        timeComplexity: llmAnalysis.timeComplexity,
        spaceComplexity: llmAnalysis.spaceComplexity,
        confidence: llmAnalysis.confidence,
      });

      return {
        isFeasible: llmAnalysis.isFeasible,
        reasoning: llmAnalysis.reasoning || 'LLM analysis complete',
        confidence: llmAnalysis.confidence || 0.8,
        llmAnalysis: llmAnalysis,
      };
    } catch (error) {
      console.error('🚨 Groq LLM Error:', error.message);
      return {
        isFeasible: null,
        reasoning: `LLM error: ${error.message}`,
        confidence: 0,
        llmAnalysis: null,
        error: error.message,
      };
    }
  }

  /**
   * Quick LLM check for optimization suggestions
   * @param {string} code - Source code
   * @param {string} language - Programming language
   * @param {object} complexityAnalysis - Current analysis
   * @returns {Promise<object>} { suggestions: string[], bestPractices: string[] }
   */
  async getSuggestions(code, language, complexityAnalysis) {
    if (!this.client) {
      return {
        suggestions: ['Enable LLM service for optimization suggestions'],
        bestPractices: [],
      };
    }

    try {
      const truncatedCode = code.length > 2000 ? code.substring(0, 2000) + '\n// ... [truncated]' : code;

      const prompt = `As a competitive programming coach, analyze this ${language} code and provide 3 optimization suggestions.

CODE:
\`\`\`${language}
${truncatedCode}
\`\`\`

Current Complexity: ${complexityAnalysis.timeComplexity} time, ${complexityAnalysis.spaceComplexity} space

Respond with ONLY this JSON (no markdown):
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "bestPractices": ["practice 1", "practice 2"]
}`;

      const message = await this.client.messages.create({
        model: 'mixtral-8x7b-32768',
        max_tokens: 250,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText = message.content[0].text.trim();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const suggestions = JSON.parse(jsonMatch[0]);

      return suggestions;
    } catch (error) {
      console.error('Error getting LLM suggestions:', error.message);
      return {
        suggestions: [],
        bestPractices: [],
      };
    }
  }

  /**
   * Check if LLM is available
   */
  isAvailable() {
    return !!this.client;
  }
}

module.exports = new GroqClient();
