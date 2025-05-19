const axios = require('axios');
const chalk = require('chalk');

/**
 * Generate a commit message using Together.ai Mistral-7B
 * @param {string} diff - The git diff
 * @param {string} apiKey - Together.ai API key
 * @returns {Promise<string>} Generated commit message
 */
async function generateCommitMessage(diff, apiKey) {
  if (!apiKey) {
    throw new Error('Together.ai API key is required. Set ALT_AI_API_KEY environment variable or configure it when prompted.');
  }
  
  try {
    const response = await axios.post(
      'https://api.together.xyz/inference',
      {
        model: 'mistralai/Mistral-7B-Instruct-v0.1',
        prompt: `You are an expert developer assistant that generates conventional commit messages.
Format your response as "<type>(<scope>): <description>" without any additional text.
Use common types like feat, fix, docs, style, refactor, test, chore, etc.
Keep the message concise, clear, and descriptive.

Generate a conventional commit message for this git diff:

${diff}`,
        max_tokens: 100,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1,
        stop: ["\n"]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    return response.data.output.choices[0].text.trim();
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Invalid Together.ai API key. Please check your API key and try again.');
      } else if (error.response.status === 429) {
        throw new Error('Together.ai API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Together.ai API error (${error.response.status}): ${error.response.data.error || 'Unknown error'}`);
      }
    }
    throw new Error(`Failed to generate commit message: ${error.message}`);
  }
}

module.exports = {
  generateCommitMessage
};