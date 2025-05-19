# commit-genius 🧠

[![npm version](https://img.shields.io/npm/v/commit-genius.svg)](https://www.npmjs.com/package/commit-genius)
[![npm downloads](https://img.shields.io/npm/dm/commit-genius.svg)](https://www.npmjs.com/package/commit-genius)
[![license](https://img.shields.io/npm/l/commit-genius.svg)](https://github.com/AmtTawsik/commit-genius/blob/main/LICENSE)

AI-powered conventional commit message generator using Together.ai's DeepSeek-V3 model.  
Streamline your git workflow with smart, clear commit messages crafted by AI.

---

## ✨ Features

- 🤖 AI-generated conventional commit messages  
- 📝 Analyzes your staged changes with `git diff --cached`  
- ✨ Uses Together.ai's DeepSeek-V3 for smart suggestions  
- 🎨 Colorful CLI interface with emojis  
- ✏️ Edit suggested commit messages before committing  
- 🔑 Secure API key management via `.env` file  
- 🚫 Handles missing API keys and no staged changes gracefully  

---

## 📦 Installation

Use without installing globally:

```bash
npx commit-genius
````

Or install globally:

```bash
npm install -g commit-genius
```

---

## 🚀 Basic Usage

1. Stage your changes:

```bash
git add .
```

2. Run Commit Genius:

```bash
npx commit-genius
```

3. Review the AI-suggested commit message.
4. Choose to:

   * ✅ Use the suggested message as-is
   * ✏️ Edit the message manually
   * ❌ Cancel the commit

---

## 🔧 Setup

1. Get your free API key from [Together.ai](https://together.ai).
2. Create a `.env` file in your project root with:

```bash
TOGETHER_API_KEY=your_api_key_here
```

3. Commit Genius will automatically use this API key.

---

## 📝 Example Output

```
🧠 Commit Genius - AI-powered commit messages

🔍 Analyzing your changes...

✅ Suggested commit message:

  feat(auth): add OAuth2 authentication support

What would you like to do with this message?
❯ ✅ Use this message
  ✏️ Edit this message
  ❌ Cancel commit

📝 Committing changes...
🎉 Successfully committed!
```

---

## ❓ FAQ

### How do I get the Together.ai API key?

Sign up for free at [Together.ai](https://together.ai), generate your API key, and add it to your `.env`.

### What if I have no staged changes?

Stage your changes using `git add <files>` before running Commit Genius.

### Can I edit the suggested commit message?

Yes! You can choose to edit the AI-generated message before committing.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to:

1. Fork the repo
2. Create a new branch (`git checkout -b feature-name`)
3. Commit your changes
4. Push to the branch (`git push origin feature-name`)
5. Open a pull request

---

## 📜 License

MIT © [Abdullah Al Mubin](https://github.com/AmtTawsik)