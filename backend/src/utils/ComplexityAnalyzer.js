/**
 * Complexity Analyzer - Analyzes code for time and space complexity
 * Supports: Python, Java, C++, C
 */

class ComplexityAnalyzer {
  /**
   * Analyze code for time and space complexity
   * @param {string} code - Source code to analyze
   * @param {string} language - Programming language (python, java, cpp, c)
   * @param {object} problemConstraints - Problem's expected complexity
   * @returns {object} { timeComplexity, spaceComplexity, status, message }
   */
  static analyzeComplexity(code, language, problemConstraints = {}) {
    const startTime = Date.now();

    try {
      // Normalize code
      const normalizedCode = code.toLowerCase();

      // Analyze time complexity
      const timeComplexity = this.analyzeTimeComplexity(normalizedCode, language);

      // Analyze space complexity
      const spaceComplexity = this.analyzeSpaceComplexity(normalizedCode, language);

      // Validate against constraints
      const validation = this.validateConstraints(
        timeComplexity,
        spaceComplexity,
        problemConstraints
      );

      const analysisTime = Date.now() - startTime;

      return {
        timeComplexity,
        spaceComplexity,
        status: validation.status, // 'accepted', 'warning', 'exceeded'
        message: validation.message,
        analysisTime,
      };
    } catch (error) {
      console.error('Complexity analysis error:', error);
      return {
        timeComplexity: 'Unknown',
        spaceComplexity: 'Unknown',
        status: 'warning',
        message: 'Could not fully analyze complexity. Please verify manually.',
        analysisTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Analyze time complexity
   */
  static analyzeTimeComplexity(code, language) {
    // Detect nested loop depth
    const nestedLoopDepth = this.detectNestedLoops(code);

    // Detect common algorithms
    if (this.detectBinarySearch(code)) return 'O(log n)';
    if (this.detectMergeSort(code) || this.detectQuickSort(code)) return 'O(n log n)';
    if (this.detectDivideConquer(code)) return 'O(n log n)';

    // Based on loop nesting
    switch (nestedLoopDepth) {
      case 0:
        return 'O(1)'; // Constant time
      case 1:
        return 'O(n)'; // Linear
      case 2:
        return 'O(n²)'; // Quadratic
      case 3:
        return 'O(n³)'; // Cubic
      default:
        return `O(n^${nestedLoopDepth})`; // Polynomial
    }
  }

  /**
   * Analyze space complexity
   */
  static analyzeSpaceComplexity(code, language) {
    // Detect data structures
    if (this.detectRecursion(code)) return 'O(n)'; // Recursive call stack

    if (this.detectArrayCreation(code, language)) {
      if (this.detectNestedArrays(code)) return 'O(n²)';
      return 'O(n)';
    }

    if (this.detectHashMap(code) || this.detectHashSet(code)) return 'O(n)';

    return 'O(1)'; // Constant space
  }

  /**
   * Detect nested loop depth
   */
  static detectNestedLoops(code) {
    let maxDepth = 0;
    let currentDepth = 0;
    const braces = [];

    // Simple bracket matching for loop detection
    for (let i = 0; i < code.length; i++) {
      const char = code[i];

      // Look for loop keywords
      if (
        code.substr(i, 3) === 'for' ||
        code.substr(i, 5) === 'while' ||
        code.substr(i, 6) === 'foreach'
      ) {
        // Make sure it's a word boundary
        const before = i === 0 || !code[i - 1].match(/[a-z0-9_]/i);
        const after = i + 3 < code.length && !code[i + 3].match(/[a-z0-9_]/i);

        if (before && after) {
          currentDepth++;
          maxDepth = Math.max(maxDepth, currentDepth);
        }
      }

      if (char === '{') {
        braces.push('loop');
      } else if (char === '}') {
        if (braces.length > 0 && braces[braces.length - 1] === 'loop') {
          currentDepth = Math.max(0, currentDepth - 1);
          braces.pop();
        }
      }
    }

    return maxDepth;
  }

  /**
   * Detect binary search pattern
   */
  static detectBinarySearch(code) {
    return (
      /binary\s*search/.test(code) ||
      (/\blog\b/.test(code) && (/\breq\s*=|left.*right|mid/.test(code) || /\blow\b.*\bhigh\b/.test(code)))
    );
  }

  /**
   * Detect merge sort pattern
   */
  static detectMergeSort(code) {
    return /merge\s*sort|divide.*conquer/.test(code) || (/merge/.test(code) && /left.*right/.test(code));
  }

  /**
   * Detect quick sort pattern
   */
  static detectQuickSort(code) {
    return (
      /quick\s*sort|partition/.test(code) ||
      (/pivot/.test(code) && /left.*right|partition/.test(code))
    );
  }

  /**
   * Detect divide and conquer
   */
  static detectDivideConquer(code) {
    return /divide.*conquer|recursively/.test(code) && /half|mid|length.*2/.test(code);
  }

  /**
   * Detect recursion
   */
  static detectRecursion(code) {
    // Look for function calling itself
    const functionNameMatch = code.match(/function\s+(\w+)|def\s+(\w+)|(?:int|void|double)\s+(\w+)\s*\(|public\s+(?:int|void|double)\s+(\w+)/i);

    if (functionNameMatch) {
      const funcName = functionNameMatch[1] || functionNameMatch[2] || functionNameMatch[3] || functionNameMatch[4];
      if (funcName) {
        const funcCallPattern = new RegExp(`\\b${funcName}\\s*\\(`);
        return funcCallPattern.test(code);
      }
    }

    return /recursive/.test(code);
  }

  /**
   * Detect array creation
   */
  static detectArrayCreation(code, language) {
    if (language === 'python') return /\[\s*\]|list\s*\(|numpy/.test(code);
    if (language === 'java') return /new\s+(?:int|String|Object|List|ArrayList)\s*\[/.test(code);
    if (language === 'cpp') return /vector|array|new\s+int|new\s+double/.test(code);
    if (language === 'c') return /malloc|calloc|\[\d+\]/.test(code);
    return false;
  }

  /**
   * Detect nested arrays
   */
  static detectNestedArrays(code) {
    return /\[\s*\[\s*\]|\[\[\]|new\s+\w+\s*\[\s*\]\s*\[\s*\]/.test(code);
  }

  /**
   * Detect hash map/dictionary
   */
  static detectHashMap(code) {
    return /hashmap|dict\s*\(|{\s*}|new\s+HashMap|unordered_map/.test(code);
  }

  /**
   * Detect hash set
   */
  static detectHashSet(code) {
    return /hashset|set\s*\(|{\s*}|new\s+HashSet|unordered_set/.test(code);
  }

  /**
   * Validate complexity against constraints
   */
  static validateConstraints(timeComplexity, spaceComplexity, constraints = {}) {
    // Extract complexity order from string (e.g., "O(n)" -> "n")
    const extractOrder = (complexity) => {
      const match = complexity.match(/O\(([^)]+)\)/);
      return match ? match[1] : complexity;
    };

    const acceptedTimeComplexities = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n log² n)'];
    const acceptedSpaceComplexities = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'];

    let status = 'accepted';
    let message = '✅ Complexity analysis passed!';

    // Check if complexity is in acceptable range
    if (!acceptedTimeComplexities.includes(timeComplexity)) {
      status = 'warning';
      message = `⚠️ Time complexity ${timeComplexity} might be inefficient`;
    }

    if (!acceptedSpaceComplexities.includes(spaceComplexity)) {
      status = 'warning';
      message = `⚠️ Space complexity ${spaceComplexity} might be too high`;
    }

    // Check against problem constraints if provided
    if (constraints.maxTimeComplexity && constraints.maxTimeComplexity !== 'Any') {
      if (!this.isComplexityAcceptable(timeComplexity, constraints.maxTimeComplexity)) {
        status = 'exceeded';
        message = `❌ Time complexity ${timeComplexity} exceeds limit ${constraints.maxTimeComplexity}`;
      }
    }

    if (constraints.maxSpaceComplexity && constraints.maxSpaceComplexity !== 'Any') {
      if (!this.isComplexityAcceptable(spaceComplexity, constraints.maxSpaceComplexity)) {
        status = 'exceeded';
        message = `❌ Space complexity ${spaceComplexity} exceeds limit ${constraints.maxSpaceComplexity}`;
      }
    }

    return { status, message };
  }

  /**
   * Check if complexity is acceptable (actual <= maximum)
   * Examples:
   * - O(1) <= O(n) = true (acceptable)
   * - O(n) <= O(n) = true (acceptable)  
   * - O(n²) <= O(n) = false (NOT acceptable)
   */
  static isComplexityAcceptable(actual, maximum) {
    // Complexity order from best to worst
    const complexityOrder = {
      '1': 0,
      'log n': 1,
      'n': 2,
      'n log n': 2.5,
      'n²': 3,
      'n³': 4,
      'n⁴': 5,
      '2^n': 6,
      'n!': 7
    };

    // Extract the complexity class from O(...) notation
    const extractComplexityClass = (complexity) => {
      const match = complexity.match(/O\(([^)]+)\)/);
      if (!match) return complexity;
      
      const inner = match[1].trim();
      
      // Exact matches first
      if (complexityOrder.hasOwnProperty(inner)) {
        return inner;
      }
      
      // Try to match patterns
      for (const key of Object.keys(complexityOrder)) {
        if (inner === key || inner.includes(key)) {
          return key;
        }
      }
      
      // If not found, assume worst case
      return '2^n';
    };

    const actualClass = extractComplexityClass(actual);
    const maximumClass = extractComplexityClass(maximum);

    const actualOrder = complexityOrder[actualClass] !== undefined ? complexityOrder[actualClass] : 999;
    const maximumOrder = complexityOrder[maximumClass] !== undefined ? complexityOrder[maximumClass] : 999;

    console.log(`📊 Complexity Check: ${actual} (${actualOrder}) <= ${maximum} (${maximumOrder}) = ${actualOrder <= maximumOrder}`);

    return actualOrder <= maximumOrder;
  }

  /**
   * Validate complexity with LLM when pattern-based analysis says "exceeded"
   * This provides a second opinion for borderline/complex cases
   * @param {string} code - Source code
   * @param {string} language - Programming language
   * @param {string} timeComplexity - Detected time complexity
   * @param {string} maxTimeComplexity - Maximum allowed time complexity
   * @param {string} spaceComplexity - Detected space complexity
   * @param {string} maxSpaceComplexity - Maximum allowed space complexity
   * @returns {Promise<object>} { llmDecision: boolean, reasoning: string, analysis: object }
   */
  static async validateWithLLM(
    code,
    language,
    timeComplexity,
    maxTimeComplexity,
    spaceComplexity,
    maxSpaceComplexity
  ) {
    try {
      const groqClient = require('./groqClient');
      
      console.log('🤖 Initiating LLM complexity validation...');
      
      const result = await groqClient.validateComplexity(
        code,
        language,
        timeComplexity,
        maxTimeComplexity,
        spaceComplexity,
        maxSpaceComplexity
      );

      return result;
    } catch (error) {
      console.error('⚠️ LLM validation error:', error.message);
      return {
        llmDecision: null,
        reasoning: `LLM validation unavailable: ${error.message}`,
        analysis: null,
        error: true,
      };
    }
  }

  /**
   * Get optimization suggestions from LLM
   * @param {string} code - Source code
   * @param {string} language - Programming language
   * @param {object} complexityAnalysis - Current complexity analysis
   * @returns {Promise<object>} { suggestions: string[], bestPractices: string[] }
   */
  static async getSuggestions(code, language, complexityAnalysis) {
    try {
      const groqClient = require('./groqClient');
      return await groqClient.getSuggestions(code, language, complexityAnalysis);
    } catch (error) {
      console.error('⚠️ Error getting suggestions:', error.message);
      return {
        suggestions: [
          'Use a more efficient data structure',
          'Consider a divide-and-conquer approach',
          'Look for patterns to reduce iterations'
        ],
        bestPractices: []
      };
    }
  }
}

module.exports = ComplexityAnalyzer;
