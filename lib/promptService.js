const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * Prompt user for OpenAI API key
 * @returns {Promise<{apiKey: string, save: boolean}>} User input
 */
async function promptForAPIKey() {
  console.log(chalk.yellow('\n⚠️  OpenAI API key not found'));
  
  const questions = [
    {
      type: 'password',
      name: 'apiKey',
      message: 'Enter your OpenAI API key:',
      validate: input => input.length > 0 ? true : 'API key is required'
    },
    {
      type: 'confirm',
      name: 'save',
      message: 'Save API key for future use?',
      default: true
    }
  ];
  
  return inquirer.prompt(questions);
}

/**
 * Ask user to confirm, edit, or cancel the commit message
 * @returns {Promise<{action: string}>} User action choice
 */
async function confirmCommitMessage() {
  const question = {
    type: 'list',
    name: 'action',
    message: 'What would you like to do with this message?',
    choices: [
      { name: chalk.green('✅ Use this message'), value: 'use' },
      { name: chalk.blue('✏️  Edit this message'), value: 'edit' },
      { name: chalk.red('❌ Cancel commit'), value: 'cancel' }
    ]
  };
  
  return inquirer.prompt(question);
}

/**
 * Prompt user to edit the commit message
 * @param {string} suggestedMessage - The suggested commit message
 * @returns {Promise<{editedMessage: string}>} Edited message
 */
async function editCommitMessage(suggestedMessage) {
  const question = {
    type: 'input',
    name: 'editedMessage',
    message: 'Edit the commit message:',
    default: suggestedMessage
  };
  
  return inquirer.prompt(question);
}

module.exports = {
  promptForAPIKey,
  confirmCommitMessage,
  editCommitMessage
};