const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Execute a git command
 * @param {string} command - The git command to execute
 * @returns {Promise<string>} Command output
 */
async function execGitCommand(command) {
  try {
    const { stdout } = await execPromise(`git ${command}`);
    return stdout;
  } catch (error) {
    throw new Error(`Git command failed: ${error.message}`);
  }
}

/**
 * Check if current directory is a git repository
 * @returns {Promise<boolean>} True if in a git repository
 */
async function hasGitRepository() {
  try {
    await execGitCommand('rev-parse --is-inside-work-tree');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if there are staged changes
 * @returns {Promise<boolean>} True if there are staged changes
 */
async function hasStagedChanges() {
  try {
    const diff = await execGitCommand('diff --cached --name-only');
    return diff.trim().length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Commit with the given message
 * @param {string} message - The commit message
 * @returns {Promise<void>}
 */
async function commitWithMessage(message) {
  try {
    // Escape quotes in the message to prevent command injection
    const escapedMessage = message.replace(/"/g, '\\"');
    await execGitCommand(`commit -m "${escapedMessage}"`);
  } catch (error) {
    throw new Error(`Failed to commit: ${error.message}`);
  }
}

module.exports = {
  execGitCommand,
  hasGitRepository,
  hasStagedChanges,
  commitWithMessage
};