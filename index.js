#!/usr/bin/env node

require('dotenv').config();
const { Command } = require('commander');
const chalk = require('chalk');
const { processGitDiff } = require('./lib/diffProcessor');
const { getSuggestion } = require('./lib/aiService');
const { hasGitRepository, hasStagedChanges, commitWithMessage } = require('./lib/gitCommands');
const { confirmCommitMessage, editCommitMessage } = require('./lib/promptService');

const program = new Command();

// Programs 
program
  .name('commit-genius')
  .description('AI-powered conventional commit message generator')
  .option('--local', 'Force using local Ollama')
  .option('--cloud', 'Force using Together.ai cloud API')
  .parse();

const options = program.opts();

async function main() {
  try {
    console.log(chalk.bold.blue('🧠 Commit Genius') + chalk.gray(' - Free AI-powered commit messages\n'));
    
    // Check if we're in a git repository
    if (!await hasGitRepository()) {
      console.log(chalk.red('❌ Not a git repository!'));
      process.exit(1);
    }

    // Check if there are staged changes
    if (!await hasStagedChanges()) {
      console.log(chalk.yellow('⚠️  No staged changes found. Use ') + 
        chalk.cyan('git add <files>') + 
        chalk.yellow(' to stage changes.'));
      process.exit(1);
    }
    
    // Get diff of staged changes
    const diff = await processGitDiff();
    
    // Determine mode based on flags
    let mode = null;
    if (options.local) mode = 'local';
    if (options.cloud) mode = 'cloud';
    
    // Generate commit message
    console.log(chalk.blue('🔍 Analyzing your changes...'));
    const { message: suggestedMessage, engine } = await getSuggestion(diff, {
      mode,
      apiKey: process.env.TOGETHER_API_KEY
    });
    
    // Show engine used
    console.log(chalk.gray(`\n${engine}`));
    
    // Show suggested message and ask for confirmation
    console.log(chalk.green('\n✅ Suggested commit message:'));
    console.log(chalk.cyan(`\n  ${suggestedMessage}\n`));
    
    const { action } = await confirmCommitMessage();
    
    let finalMessage = suggestedMessage;
    
    if (action === 'edit') {
      const { editedMessage } = await editCommitMessage(suggestedMessage);
      finalMessage = editedMessage;
    } else if (action === 'cancel') {
      console.log(chalk.yellow('🛑 Commit canceled.'));
      process.exit(0);
    }
    
    // Commit with message if confirmed
    console.log(chalk.blue('📝 Committing changes...'));
    await commitWithMessage(finalMessage);
    console.log(chalk.green('🎉 Successfully committed!'));
    
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}

main();