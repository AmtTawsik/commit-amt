const axios = require('axios');
const chalk = require('chalk');

/**
 * Check if Ollama is available locally
 * @returns {Promise<boolean>}
 */
async function isOllamaAvailable() {
  try {
    await axios.get('http://localhost:11434/api/tags');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate commit message using local Ollama
 * @param {string} diff - The git diff
 * @returns {Promise<string>}
 */
async function generateWithOllama(diff) {
  try {
    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama2',
      messages: [
        {
          role: 'system',
          content: 'You are an expert developer assistant that generates conventional commit messages. Format your response as "<type>(<scope>): <description>" without any additional text. Use common types like feat, fix, docs, style, refactor, test, chore, etc. Keep the message concise and descriptive.'
        },
        {
          role: 'user',
          content: `Generate a conventional commit message for this git diff:\n\n${diff}`
        }
      ]
    });
    
    return response.data.message.content.trim();
  } catch (error) {
    throw new Error(`Ollama API error: ${error.message}`);
  }
}

/**
 * Generate commit message using Together.ai
 * @param {string} diff - The git diff
 * @param {string} apiKey - Together.ai API key
 * @returns {Promise<string>}
 */
async function generateWithTogether(diff, apiKey) {
  try {
    const response = await axios.post(
      'https://api.together.xyz/v1/chat/completions',
      {
        model: 'mistral-7b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are an expert developer assistant that generates conventional commit messages. Format your response as "<type>(<scope>): <description>" without any additional text. Use common types like feat, fix, docs, style, refactor, test, chore, etc. Keep the message concise and descriptive.'
          },
          {
            role: 'user',
            content: `Generate a conventional commit message for this git diff:\n\n${diff}`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Invalid Together.ai API key');
    }
    throw new Error(`Together.ai API error: ${error.message}`);
  }
}

/**
 * Generate commit message using rules-based approach
 * @param {string} diff - The git diff
 * @returns {string}
 */
function generateWithRules(diff) {
  const lines = diff.split('\n');
  let type = 'chore';
  let scope = '';
  
  // Detect type based on file patterns
  if (lines.some(l => l.includes('test/'))) {
    type = 'test';
  } else if (lines.some(l => l.includes('docs/'))) {
    type = 'docs';
  } else if (lines.some(l => /\+\s*function/.test(l))) {
    type = 'feat';
  } else if (lines.some(l => l.includes('fix') || l.includes('bug'))) {
    type = 'fix';
  }
  
  // Try to detect scope from modified files
  const files = lines
    .filter(l => l.startsWith('+++') || l.startsWith('---'))
    .map(l => l.split('/')[1])
    .filter(Boolean);
  
  if (files.length > 0) {
    scope = files[0].split('.')[0];
  }
  
  return `${type}${scope ? `(${scope})` : ''}: update code`;
}

/**
 * Generate commit message using the best available method
 * @param {string} diff - The git diff
 * @param {Object} options - Generation options
 * @param {string} options.mode - Force specific mode ('local', 'cloud', or 'rules')
 * @param {string} options.apiKey - Together.ai API key for cloud mode
 * @returns {Promise<{message: string, engine: string}>}
 */
async function getSuggestion(diff, options = {}) {
  const { mode, apiKey } = options;
  
  // Force local mode
  if (mode === 'local') {
    if (await isOllamaAvailable()) {
      return {
        message: await generateWithOllama(diff),
        engine: '🖥️ Using local Ollama'
      };
    }
    throw new Error('Local mode requested but Ollama is not available at http://localhost:11434');
  }
  
  // Force cloud mode
  if (mode === 'cloud') {
    if (!apiKey) {
      throw new Error('Cloud mode requested but no Together.ai API key provided');
    }
    return {
      message: await generateWithTogether(diff, apiKey),
      engine: '🔗 Using Together.ai (free tier)'
    };
  }
  
  // Auto mode - try local first, then cloud, then rules
  try {
    if (await isOllamaAvailable()) {
      return {
        message: await generateWithOllama(diff),
        engine: '🖥️ Using local Ollama'
      };
    }
    
    if (apiKey) {
      return {
        message: await generateWithTogether(diff, apiKey),
        engine: '🔗 Using Together.ai (free tier)'
      };
    }
  } catch (error) {
    console.log(chalk.yellow(`\n⚠️  AI generation failed: ${error.message}`));
    console.log(chalk.gray('Falling back to rules-based generator...'));
  }
  
  return {
    message: generateWithRules(diff),
    engine: '⚙️ Using rules-based generator'
  };
}

module.exports = {
  getSuggestion
};