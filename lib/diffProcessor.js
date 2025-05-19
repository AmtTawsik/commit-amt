const { execGitCommand } = require('./gitCommands');

/**
 * Get the git diff for staged changes
 * @returns {Promise<string>} The git diff
 */
async function processGitDiff() {
  try {
    return await execGitCommand('diff --cached');
  } catch (error) {
    throw new Error(`Failed to get git diff: ${error.message}`);
  }
}

module.exports = {
  processGitDiff
};