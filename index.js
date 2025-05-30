#!/usr/bin/env node

require("dotenv").config();
const { Together } = require("together-ai");
const { exec } = require("child_process");
const util = require("util");
const inquirer = require("inquirer");
const chalk = require("chalk");

const execPromise = util.promisify(exec);

// Initialize Together client
const together = new Together(process.env.TOGETHER_API_KEY);

async function getStagedDiff() {
  try {
    const { stdout } = await execPromise("git diff --cached");
    return stdout;
  } catch (error) {
    throw new Error("Failed to get git diff: " + error.message);
  }
}

async function generateCommitMessage(diff) {
  try {
    const response = await together.chat.completions.create({
      model: 'deepseek-ai/DeepSeek-V3',
      messages: [
        {
          role: 'user',
          content: `You are an expert developer assistant that generates conventional commit messages.
Format your response as "<type>(<scope>): <description>" without any additional text.
Use common types like feat, fix, docs, style, refactor, test, chore, etc.
Keep the message concise, clear, and descriptive.

Generate a conventional commit message for this git diff:

${diff}`
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content.trim();
  } catch (error) {
    throw new Error('Failed to generate commit message: ' + error.message);
  }
}


async function confirmCommitMessage(message) {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do with this message?",
      choices: [
        { name: chalk.green("✅ Use this message"), value: "use" },
        { name: chalk.blue("✏️  Edit this message"), value: "edit" },
        { name: chalk.red("❌ Cancel commit"), value: "cancel" },
      ],
    },
  ]);

  if (action === "edit") {
    const { editedMessage } = await inquirer.prompt([
      {
        type: "input",
        name: "editedMessage",
        message: "Edit the commit message:",
        default: message,
      },
    ]);
    return { action: "use", message: editedMessage };
  }

  return { action, message };
}

async function commitChanges(message) {
  try {
    const escapedMessage = message.replace(/"/g, '\\"');
    await execPromise(`git commit -m "${escapedMessage}"`);
    return true;
  } catch (error) {
    throw new Error("Failed to commit changes: " + error.message);
  }
}

async function main() {
  try {
    console.log(
      chalk.bold.blue("🧠 Commit AMT") +
        chalk.gray(" - AI-powered commit messages\n")
    );

    // Check if we're in a git repository
    try {
      await execPromise("git rev-parse --is-inside-work-tree");
    } catch (error) {
      console.log(chalk.red("❌ Not a git repository!"));
      process.exit(1);
    }

    // Check for API key
    if (!process.env.TOGETHER_API_KEY) {
      console.log(chalk.red("❌ Together.ai API key not found!"));
      console.log(chalk.gray("Please set TOGETHER_API_KEY in your .env file"));
      console.log(chalk.gray("Get your free API key at https://together.ai"));
      process.exit(1);
    }

    // Check for staged changes
    const { stdout: stagedFiles } = await execPromise(
      "git diff --cached --name-only"
    );
    if (!stagedFiles.trim()) {
      console.log(
        chalk.yellow("⚠️  No staged changes found. Use ") +
          chalk.cyan("git add <files>") +
          chalk.yellow(" to stage changes.")
      );
      process.exit(1);
    }

    // Get diff and generate message
    console.log(chalk.blue("🔍 Analyzing your changes..."));
    const diff = await getStagedDiff();
    const suggestedMessage = await generateCommitMessage(diff);

    // Show suggested message and get confirmation
    console.log(chalk.green("\n✅ Suggested commit message:"));
    console.log(chalk.cyan(`\n  ${suggestedMessage}\n`));

    const { action, message } = await confirmCommitMessage(suggestedMessage);

    if (action === "cancel") {
      console.log(chalk.yellow("🛑 Commit canceled."));
      process.exit(0);
    }

    // Commit changes
    console.log(chalk.blue("📝 Committing changes..."));
    await commitChanges(message);
    console.log(chalk.green("🎉 Successfully committed!"));
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}

main();
