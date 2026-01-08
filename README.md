# Prompt Optimizer - Chrome Extension

A Chrome Extension that integrates Google's Gemma 3-12b model directly into **Claude.ai** and **Google AI Studio** to optimize your prompts.

## Features
- **One-Click Optimization**: Adds an "Optimize" button to text areas.
- **Gemma 3-12b Powered**: Uses Google's state-of-the-art open model.
- **Secure**: API Key stored locally in your browser (`chrome.storage.sync`).
- **Minimal UI**: Clean, unobtrusive design.

## Installation

1.  **Download/Clone** this repository.
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Enable **Developer Mode** (toggle in the top right).
4.  Click **Load unpacked**.
5.  Select the `prompt-optimizer` folder (where `manifest.json` is located).

## Setup

1.  Click the extension icon in your Chrome toolbar.
2.  Enter your **Google AI Studio API Key**.
    - Get one here: [https://aistudio.google.com/](https://aistudio.google.com/)
3.  Click **Save Settings**.

## Usage

1.  Go to [Claude.ai](https://claude.ai) or [Google AI Studio](https://aistudio.google.com).
2.  Click on the prompt input box.
3.  Type your rough prompt.
4.  Click the violet **Optimize** button that appears.
5.  Watch as your prompt is refined for clarity and structure!

## Files
- `manifest.json`: Extension configuration.
- `content.js`: Injects the button and handles page interaction.
- `background.js`: Handles API calls to avoid CORS issues.
- `optimize.js`: Core logic for Gemma API.
- `popup.html/js`: Settings UI.
