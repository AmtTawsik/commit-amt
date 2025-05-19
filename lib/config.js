const fs = require('fs');
const path = require('path');
const os = require('os');
const { promptForAPIKey } = require('./promptService');

const CONFIG_PATH = path.join(os.homedir(), '.commit-genius');

/**
 * Get configuration (including API key)
 * @returns {Promise<{apiKey: string}>} Configuration
 */
async function getConfig() {
  // Check environment variable first
  if (process.env.OPENAI_API_KEY) {
    return { apiKey: process.env.OPENAI_API_KEY };
  }
  
  // Try to read from config file
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
      const config = JSON.parse(configData);
      
      if (config.apiKey) {
        return config;
      }
    }
  } catch (error) {
    // Silently fail and fall back to prompting user
  }
  
  // Prompt user for API key
  const { apiKey, save } = await promptForAPIKey();
  
  // Save config if requested
  if (save) {
    saveConfig({ apiKey });
  }
  
  return { apiKey };
}

/**
 * Save configuration
 * @param {Object} config - Configuration to save
 * @param {string} config.apiKey - OpenAI API key
 */
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    fs.chmodSync(CONFIG_PATH, 0o600); // Make file readable only by owner
  } catch (error) {
    console.error(`Warning: Failed to save config: ${error.message}`);
  }
}

module.exports = {
  getConfig,
  saveConfig
};