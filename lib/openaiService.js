const axios = require('axios');
const chalk = require('chalk');

/**
 * Generate a commit message using OpenAI GPT-3.5-turbo
 * @param {string} diff - The git diff
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string>} Generated commit message
 */
async function generateCommitMessage(diff, apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable or configure it when prompted.');
  }
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert developer assistant that generates conventional commit messages. ' +
                     'Format your response as "<type>(<scope>): <description>" without any additional text or explanation. ' +
                     'Use common types like feat, fix, docs, style, refactor, test, chore, etc. ' +
                     'Keep the message concise, clear, and descriptive.'
          },
          {
            role: 'user',
            content: `Generate a conventional commit message for the following git diff:\n\n${diff}`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
      } else if (error.response.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`OpenAI API error (${error.response.status}): ${error.response.data.error.message}`);
      }
    }
    throw new Error(`Failed to generate commit message: ${error.message}`);
  }
}

module.exports = {
  generateCommitMessage
};